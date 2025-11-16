'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
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
  title = 'Capture Photo',
  uploadButtonText = 'Upload Photo',
  isUploading = false
}: PhotoCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);

    // Convert to base64 (JPEG format, 65% quality for smaller size)
    const base64 = canvas.toDataURL('image/jpeg', 0.65).split(',')[1];
    setCapturedPhoto(base64);
    stopCamera();
  }, [stopCamera]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // Remove data:image/...;base64, prefix
      const base64Data = base64.split(',')[1];
      setCapturedPhoto(base64Data);
    };
    reader.readAsDataURL(file);
  }, []);

  // Upload photo
  const handleUpload = useCallback(() => {
    if (capturedPhoto) {
      onPhotoCapture(capturedPhoto);
    }
  }, [capturedPhoto, onPhotoCapture]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    startCamera();
  }, [startCamera]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    stopCamera();
    setCapturedPhoto(null);
    onCancel();
  }, [stopCamera, onCancel]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white text-lg font-semibold">{title}</h2>
        <button
          onClick={handleCancel}
          className="text-white p-2 hover:bg-white/10 rounded-full transition"
          disabled={isUploading}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera/Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {!capturedPhoto && !isCameraActive && (
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={startCamera}
              size="lg"
              className="flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Open Camera
            </Button>
            <p className="text-white/70">or</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <Upload className="w-5 h-5" />
              Upload from Gallery
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {isCameraActive && (
          <div className="w-full max-w-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
          </div>
        )}

        {capturedPhoto && (
          <div className="w-full max-w-2xl">
            <img
              src={`data:image/jpeg;base64,${capturedPhoto}`}
              alt="Captured"
              className="w-full rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-black/50">
        {isCameraActive && (
          <div className="flex gap-3">
            <Button
              onClick={stopCamera}
              variant="outline"
              className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={capturePhoto}
              className="flex-1 flex items-center justify-center gap-2"
              disabled={isUploading}
            >
              <Camera className="w-5 h-5" />
              Capture
            </Button>
          </div>
        )}

        {capturedPhoto && (
          <div className="flex gap-3">
            <Button
              onClick={retakePhoto}
              variant="outline"
              className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
              disabled={isUploading}
            >
              Retake
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
