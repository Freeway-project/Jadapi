'use client';

import { CSSProperties } from 'react';
import LottiePlayer from './LottiePlayer';

interface BaseAnimationProps {
  animationFile: string; 
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  playOnVisible?: boolean;
  className?: string;
  style?: CSSProperties;
  fallbackPngSrc?: string;
  ariaLabel?: string;
  aspectRatio?: number;
}

export default function BaseAnimation({
  animationFile,
  width = 250,
  height = 250,
  loop = true,
  playOnVisible = true,
  className = '',
  style = {},
  fallbackPngSrc,
  ariaLabel = 'Animation',
  aspectRatio = 1,
}: BaseAnimationProps) {
  // Import animation JSON dynamically
  const animationData = require(`../../public/${animationFile}`);

  return (
    <div
      className={`inline-block ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style
      }}
    >
      <LottiePlayer
        animationData={animationData}
        loop={loop}
        playOnVisible={playOnVisible}
        aspectRatio={aspectRatio}
        ariaLabel={ariaLabel}
        fallbackPngSrc={fallbackPngSrc}
        className="w-full h-full"
      />
    </div>
  );
}