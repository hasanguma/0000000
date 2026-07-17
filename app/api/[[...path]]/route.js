import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const COLLECTION = 'content';
const SUBMISSIONS = 'submissions';
const SESSIONS = 'sessions';

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

async function getContent() {
  const db = await getDb();
  let doc = await db.collection(COLLECTION).findOne({ _id: 'site' });
  if (!doc) {
    await db.collection(COLLECTION).insertOne(DEFAULT_CONTENT);
    doc = DEFAULT_CONTENT;
  }
  return doc;
}

async function verifyToken(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return false;
  const db = await getDb();
  const s = await db.collection(SESSIONS).findOne({ token });
  if (!s) return false;
  if (s.expiresAt < Date.now()) {
    await db.collection(SESSIONS).deleteOne({ token });
    return false;
  }
  return true;
}

export async function OPTIONS() {
  return json({});
}

export async function GET(req, { params }) {
  const p = (await params).path || [];
  const route = '/' + p.join('/');
  try {
    if (route === '/' || route === '/content') {
      const c = await getContent();
      return json(c);
    }
    if (route === '/submissions') {
      if (!(await verifyToken(req))) return json({ error: 'unauthorized' }, 401);
      const db = await getDb();
      const items = await db.collection(SUBMISSIONS).find({}).sort({ createdAt: -1 }).limit(200).toArray();
      return json(items);
    }
    return json({ error: 'not found' }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: e.message }, 500);
  }
}

export async function POST(req, { params }) {
  const p = (await params).path || [];
  const route = '/' + p.join('/');
  try {
    if (route === '/admin/login') {
      const { password } = await req.json();
      if (password !== process.env.ADMIN_PASSWORD) {
        return json({ error: 'كلمة المرور غير صحيحة' }, 401);
      }
      const token = crypto.randomBytes(32).toString('hex');
      const db = await getDb();
      await db.collection(SESSIONS).insertOne({
        token,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
      });
      return json({ token });
    }

    if (route === '/contact') {
      const body = await req.json();
      const db = await getDb();
      const doc = { id: uuidv4(), ...body, createdAt: Date.now() };
      await db.collection(SUBMISSIONS).insertOne(doc);
      return json({ ok: true });
    }

    if (route === '/youtube/resolve') {
      // Resolve YouTube URL / playlist / channel to a list of video IDs (using oEmbed / RSS)
      if (!(await verifyToken(req))) return json({ error: 'unauthorized' }, 401);
      const { url } = await req.json();
      const results = await resolveYouTube(url);
      return json(results);
    }

    return json({ error: 'not found' }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: e.message }, 500);
  }
}

export async function PUT(req, { params }) {
  const p = (await params).path || [];
  const route = '/' + p.join('/');
  try {
    if (!(await verifyToken(req))) return json({ error: 'unauthorized' }, 401);
    if (route === '/content') {
      const body = await req.json();
      delete body._id;
      const db = await getDb();
      await db.collection(COLLECTION).updateOne(
        { _id: 'site' },
        { $set: body },
        { upsert: true }
      );
      const doc = await db.collection(COLLECTION).findOne({ _id: 'site' });
      return json(doc);
    }
    return json({ error: 'not found' }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: e.message }, 500);
  }
}

export async function DELETE(req, { params }) {
  const p = (await params).path || [];
  const route = '/' + p.join('/');
  try {
    if (!(await verifyToken(req))) return json({ error: 'unauthorized' }, 401);
    if (route === '/reset') {
      const db = await getDb();
      await db.collection(COLLECTION).deleteOne({ _id: 'site' });
      await db.collection(COLLECTION).insertOne(DEFAULT_CONTENT);
      return json({ ok: true });
    }
    return json({ error: 'not found' }, 404);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// ---------- YouTube resolver ----------
function extractVideoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0];
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const m = u.pathname.match(/\/embed\/([^/?]+)/);
    if (m) return m[1];
    const s = u.pathname.match(/\/shorts\/([^/?]+)/);
    if (s) return s[1];
  } catch (e) {}
  return null;
}

function extractChannelId(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/channel\/([^/?]+)/);
    if (m) return { type: 'channel_id', value: m[1] };
    const hm = u.pathname.match(/^\/@([^/?]+)/);
    if (hm) return { type: 'handle', value: hm[1] };
    const um = u.pathname.match(/\/user\/([^/?]+)/);
    if (um) return { type: 'user', value: um[1] };
  } catch (e) {}
  return null;
}

function extractPlaylistId(url) {
  try {
    const u = new URL(url);
    if (u.searchParams.get('list')) return u.searchParams.get('list');
  } catch (e) {}
  return null;
}

async function resolveYouTube(url) {
  // Single video
  const vid = extractVideoId(url);
  if (vid) return [{ id: uuidv4(), videoId: vid, url: `https://www.youtube.com/watch?v=${vid}`, title: '' }];

  // Playlist
  const pid = extractPlaylistId(url);
  if (pid) {
    try {
      const res = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${pid}`);
      const xml = await res.text();
      return parseYouTubeFeed(xml);
    } catch (e) { return []; }
  }

  // Channel
  const ch = extractChannelId(url);
  if (ch) {
    let channelId = ch.value;
    if (ch.type === 'handle' || ch.type === 'user') {
      // Try to resolve channelId by scraping the channel page
      try {
        const path = ch.type === 'handle' ? `/@${ch.value}` : `/user/${ch.value}`;
        const html = await (await fetch(`https://www.youtube.com${path}`, { headers: { 'accept-language': 'en' } })).text();
        const m = html.match(/\"channelId\":\"([^\"]+)\"/) || html.match(/channel_id=([^\"&]+)/);
        if (m) channelId = m[1];
      } catch (e) {}
    }
    try {
      const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
      const xml = await res.text();
      return parseYouTubeFeed(xml);
    } catch (e) { return []; }
  }

  return [];
}

function parseYouTubeFeed(xml) {
  const items = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const vid = (entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1];
    const title = (entry.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
    const published = (entry.match(/<published>([^<]+)<\/published>/) || [])[1];
    if (vid) {
      items.push({
        id: uuidv4(),
        videoId: vid,
        url: `https://www.youtube.com/watch?v=${vid}`,
        title,
        addedAt: published ? new Date(published).getTime() : Date.now(),
      });
    }
  }
  return items;
}
