'use client';

import dynamic from 'next/dynamic';
import { CSSProperties } from 'react';

const LottieAnimation = dynamic(() => import('./LottieAnimation'), {
  ssr: false,
  loading: () => (
    <div className="w-16 h-16 bg-gray-100 rounded-full animate-spin flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

interface LoadingAnimationProps {
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

export default function LoadingAnimation({
  width = 64,
  height = 64,
  loop = true,
  autoplay = true,
  speed = 1,
  className = '',
  style = {},
}: LoadingAnimationProps) {
  // Import your loading animation JSON here
  const loadingAnimationData = require('/public/lottie/worker-packing-the-goods.json');

  return (
    <LottieAnimation
      animationData={loadingAnimationData}
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