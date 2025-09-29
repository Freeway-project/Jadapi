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
  width,
  height,
  loop = true,
  autoplay = true,
  speed = 1,
  className = '',
  style = {},
}: DeliveryAnimationProps) {
  // Import your delivery animation JSON here
  // Replace with your actual animation data
  const deliveryAnimationData = require('../../public/global-delivery.json');

  // Responsive width and height based on screen size
  const responsiveWidth = width || 'clamp(150px, 25vw, 300px)';
  const responsiveHeight = height || 'clamp(150px, 20vw, 300px)';

  return (
    <div
      className={`w-full max-w-md mx-auto ${className}`}
      style={{
        ...style
      }}
    >
      <LottieAnimation
        animationData={deliveryAnimationData}
        width={responsiveWidth}
        height={responsiveHeight}
        loop={loop}
        autoplay={autoplay}
        speed={speed}
        className="w-full h-auto  flex justify-center items-center "
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
}