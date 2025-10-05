'use client';

import { CSSProperties } from 'react';
import LottiePlayer from './LottiePlayer';

interface ErrorAnimationProps {
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

export default function ErrorAnimation({
  width = 96,
  height = 96,
  loop = false, // Error animations usually play once
  className = '',
  style = {},
  ariaLabel = 'Error animation',
}: ErrorAnimationProps) {
  // Import your error animation JSON here
  const errorAnimationData = require('../../../public/lottie/truck-delivery-service.json');

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
        animationData={errorAnimationData}
        loop={loop}
        playOnVisible={true}
        ariaLabel={ariaLabel}
        className="w-full h-full"
      />
    </div>
  );
}