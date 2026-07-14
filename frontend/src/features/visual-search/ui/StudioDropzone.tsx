import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type StudioDropzoneProps = {
  /** Navigate to /studio with the selected file (home page teaser). */
  redirectOnSelect?: boolean;
  preview?: string | null;
  onFileSelect?: (file: File) => void;
  className?: string;
  compact?: boolean;
};

export function StudioDropzone({
  redirectOnSelect = false,
  preview,
  onFileSelect,
  className,
  compact = false,
}: StudioDropzoneProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const shownPreview = preview ?? localPreview;

  const handleFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    if (redirectOnSelect) {
      navigate('/studio', { state: { file, autoSearch: true } });
      return;
    }

    setLocalPreview(URL.createObjectURL(file));
    onFileSelect?.(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => fileRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        'grid w-full cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-border text-center transition hover:border-primary',
        compact ? 'p-6' : 'p-10',
        className,
      )}
    >
      {shownPreview ? (
        <img src={shownPreview} alt="Upload preview" className="max-h-64 rounded-xl object-contain" />
      ) : (
        <div className="text-muted-foreground">
          {redirectOnSelect ? (
            <Camera className="mx-auto mb-3 h-10 w-10 text-primary" />
          ) : (
            <Upload className="mx-auto mb-3 h-10 w-10 text-primary" />
          )}
          <p className="font-medium text-foreground">
            {redirectOnSelect ? 'Drop an image to find your match' : 'Drop an image or click to upload'}
          </p>
          <p className="text-sm">PNG, JPG up to 10MB</p>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
