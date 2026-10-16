'use client';

import React, { useState, useRef } from 'react';
import Image from '@/components/common/Image';
import { Upload, Link as LinkIcon, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { DataStore } from '@/lib/data-store';

interface ImageFieldManagerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helpText?: string;
  aspectRatio?: 'wide' | 'square' | 'video' | 'contain';
  placeholder?: string;
  required?: boolean;
}

export function ImageFieldManager({
  label,
  value,
  onChange,
  helpText = 'Provide a public HTTP/HTTPS URL or upload an image file from your computer.',
  aspectRatio = 'wide',
  placeholder = 'https://example.com/image.jpg',
  required = false,
}: ImageFieldManagerProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [urlInput, setUrlInput] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal input when external value changes
  React.useEffect(() => {
    setUrlInput(value);
  }, [value]);

  const handleUrlBlur = () => {
    const trimmed = urlInput.trim();
    if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
      setErrorMessage('Image URL must start with http://, https://, or be a valid data URL.');
      return;
    }
    setErrorMessage(null);
    onChange(trimmed);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files (JPEG, PNG, WebP, SVG) are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10 MB.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const publicUrl = await DataStore.uploadImage(file);
      if (publicUrl) {
        setUrlInput(publicUrl);
        onChange(publicUrl);
        toast.success('Image uploaded successfully');
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to upload image file';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    setUrlInput('');
    onChange('');
    setErrorMessage(null);
  };

  const heightClasses = {
    wide: 'h-36 sm:h-44',
    video: 'h-40 sm:h-48',
    square: 'h-32 w-32 sm:h-40 sm:w-40 mx-auto',
    contain: 'h-32 sm:h-40',
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-xs font-bold text-[#081A33] uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {/* Option Toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-200/70 text-xs font-bold w-fit">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'url' ? 'bg-white text-[#081A33] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-[#F5B936]" />
            <span>Image URL</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'upload' ? 'bg-white text-[#081A33] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-[#F5B936]" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {helpText && <p className="text-[11px] text-slate-500 leading-relaxed">{helpText}</p>}

      {/* Option 1: URL Input */}
      {mode === 'url' ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            placeholder={placeholder}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setErrorMessage(null);
            }}
            onBlur={handleUrlBlur}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936] bg-white font-mono"
          />
          {urlInput && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear Image"
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        /* Option 2: File Upload */
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#F5B936] transition-colors bg-white">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-[#081A33] hover:bg-[#122D52] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#F5B936]" />
              ) : (
                <Upload className="w-4 h-4 text-[#F5B936]" />
              )}
              <span>{isUploading ? 'Uploading Image...' : 'Choose Image File'}</span>
            </button>

            <span className="text-[11px] text-slate-500 text-center sm:text-left truncate">
              {isUploading
                ? 'Uploading to secure storage...'
                : 'Select PNG, JPG, WebP, or SVG (up to 10 MB).'}
            </span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Preview Box */}
      {value ? (
        <div className="space-y-1.5 pt-1">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Live Preview
          </span>
          <div
            className={`relative w-full ${heightClasses[aspectRatio]} rounded-xl overflow-hidden bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-2`}
          >
            <Image
              src={value}
              alt="Preview"
              fill
              className={aspectRatio === 'contain' ? 'object-contain p-2' : 'object-cover'}
              sizes="300px"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
