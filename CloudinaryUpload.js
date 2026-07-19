'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle2, X, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'sonner';

/**
 * CloudinaryUpload - reusable component for uploading images/videos to Cloudinary
 * Props:
 *  - accept: "image/*" | "video/*" | "image/*,video/*"
 *  - onUploaded: (url, publicId, resourceType) => void
 *  - label: string (button label)
 *  - maxSizeMB: default 100
 */
export default function CloudinaryUpload({ accept = 'image/*', onUploaded, label = 'رفع من الجهاز', maxSizeMB = 100, small = false }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`الحد الأقصى ${maxSizeMB} ميجا`);
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', preset);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };
    xhr.onload = () => {
      setUploading(false);
      setProgress(0);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            toast.success('تم الرفع بنجاح ✔');
            onUploaded && onUploaded(data.secure_url, data.public_id, resourceType, data);
          } else {
            toast.error('فشل الرفع');
          }
        } catch (err) {
          toast.error('استجابة غير صالحة من Cloudinary');
        }
      } else {
        let msg = 'فشل الرفع';
        try {
          const err = JSON.parse(xhr.responseText);
          msg = err.error?.message || msg;
        } catch {}
        toast.error(msg);
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      setProgress(0);
      toast.error('خطأ في الشبكة');
    };

    setUploading(true);
    setProgress(0);
    xhr.send(fd);
    // reset input
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
      <Button
        type="button"
        size={small ? 'sm' : 'default'}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="bg-gradient-to-l from-[#B08D3E] to-[#8B6F2C] hover:opacity-90 text-white"
      >
        {uploading ? (
          <><Loader2 className="h-4 w-4 ml-2 animate-spin" />{progress}%</>
        ) : (
          <><Upload className="h-4 w-4 ml-2" />{label}</>
        )}
      </Button>
      {uploading && progress > 0 && (
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-l from-green-500 to-green-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
