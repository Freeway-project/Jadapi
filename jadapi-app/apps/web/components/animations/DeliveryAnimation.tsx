'use client';

import { CSSProperties } from 'react';
import LottiePlayer from './LottiePlayer';

interface DeliveryAnimationProps {
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  playOnVisible?: boolean;
  className?: string;
  style?: CSSProperties;
  fallbackPngSrc?: string;
}

export default function DeliveryAnimation({
  width = 250,
  height = 250,
  loop = true,
  playOnVisible = true,
  className = '',
  style = {},
  fallbackPngSrc,
}: DeliveryAnimationProps) {
  // Import your delivery animation JSON here
  const deliveryAnimationData = require('../../public/global-delivery.json');

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
        animationData={deliveryAnimationData}
        loop={loop}
        playOnVisible={playOnVisible}
        aspectRatio={1}
        ariaLabel="Delivery animation"
        fallbackPngSrc={fallbackPngSrc}
        className="w-full h-full"
      />
    </div>
  );
}