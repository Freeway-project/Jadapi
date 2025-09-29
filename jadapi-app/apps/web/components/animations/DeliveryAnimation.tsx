'use client';

import dynamic from 'next/dynamic';
import { CSSProperties } from 'react';

// Dynamically import Lottie to avoid SSR issues
const LottieAnimation = dynamic(() => import('./LottieAnimation'), {
  ssr: false,
  loading: () => (
    <div className="w-72 h-72 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-400">Loading animation...</div>
    </div>
  ),
});

interface DeliveryAnimationProps {
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

export default function DeliveryAnimation({
  width = 300,
  height = 300,
  loop = true,
  autoplay = true,
  speed = 1,
  className = '',
  style = {},
}: DeliveryAnimationProps) {
  // Import your delivery animation JSON here
  // Replace with your actual animation data
  const deliveryAnimationData = require('/public/lottie/global-delivery.json');

  return (
    <LottieAnimation
      animationData={deliveryAnimationData}
      width={width}
      height={height}
      loop={loop}
      autoplay={autoplay}
      speed={speed}
      className={className}
      style={style}
    />
  );
}