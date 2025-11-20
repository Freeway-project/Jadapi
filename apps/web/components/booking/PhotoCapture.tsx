'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import toast from 'react-hot-toast';

interface PhotoCaptureProps {
  onPhotoCapture: (photoBase64: string) => void;
  onCancel: () => void;
  title?: string;
  uploadButtonText?: string;
  isUploading?: boolean;
}

export default function PhotoCapture({
  onPhotoCapture,
  onCancel,
  title = 'Upload Photo',
  uploadButtonText = 'Upload Photo',
  isUploading = false
}: PhotoCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image to reduce size
  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');

          // Calculate new dimensions (max 1280px on longest side)
          let { width, height } = img;
          const maxSize = 1280;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 70% quality
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          const base64Data = base64.split(',')[1];

          if (base64Data) {
            resolve(base64Data);
          } else {
            reject(new Error('Failed to compress image'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle file upload with compression
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Allow up to 10MB, will be compressed
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    try {
      setIsCompressing(true);
      toast.loading('Compressing image...', { id: 'compress' });

      const compressedBase64 = await compressImage(file);
      setCapturedPhoto(compressedBase64);

      toast.success('Image ready', { id: 'compress' });
    } catch (error) {
      console.error('Failed to compress image:', error);
      toast.error('Failed to process image', { id: 'compress' });
    } finally {
      setIsCompressing(false);
    }
  }, [compressImage]);

  // Upload photo
  const handleUpload = useCallback(() => {
    if (capturedPhoto) {
      onPhotoCapture(capturedPhoto);
    }
  }, [capturedPhoto, onPhotoCapture]);

  // Choose different photo
  const chooseAnother = useCallback(() => {
    setCapturedPhoto(null);
    fileInputRef.current?.click();
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setCapturedPhoto(null);
    onCancel();
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white text-lg font-semibold">{title}</h2>
        <button
          onClick={handleCancel}
          className="text-white p-2 hover:bg-white/10 rounded-full transition"
          disabled={isUploading || isCompressing}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {!capturedPhoto && (
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              className="flex items-center gap-2"
              disabled={isCompressing}
            >
              <Upload className="w-5 h-5" />
              {isCompressing ? 'Processing...' : 'Select Photo from Gallery'}
            </Button>
            <p className="text-white/70 text-sm text-center">
              Take a photo with your camera app, then select it here
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {capturedPhoto && (
          <div className="w-full max-w-md max-h-[50vh] overflow-hidden flex items-center justify-center">
            <img
              src={`data:image/jpeg;base64,${capturedPhoto}`}
              alt="Selected"
              className="max-w-full max-h-[50vh] rounded-lg object-contain"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-black/50">
        {capturedPhoto && (
          <div className="flex gap-3">
            <Button
              onClick={chooseAnother}
              variant="outline"
              className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
              disabled={isUploading}
            >
              Choose Another
            </Button>
            <Button
              onClick={handleUpload}
              className="flex-1 flex items-center justify-center gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {uploadButtonText}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
