'use client';

import dynamic from 'next/dynamic';
import { CSSProperties } from 'react';

const LottieAnimation = dynamic(() => import('./LottieAnimation'), {
  ssr: false,
  loading: () => (
    <div className="w-24 h-24 bg-red-100 rounded-full animate-pulse flex items-center justify-center">
      <div className="w-8 h-8 text-red-600">✕</div>
    </div>
  ),
});

interface ErrorAnimationProps {
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  style?: CSSProperties;
  onComplete?: () => void;
}

export default function ErrorAnimation({
  width = 96,
  height = 96,
  loop = false, // Error animations usually play once
  autoplay = true,
  speed = 1,
  className = '',
  style = {},
  onComplete,
}: ErrorAnimationProps) {
  // Import your error animation JSON here
  const errorAnimationData = require('/public/lottie/truck-delivery-service.json');

  return (
    <LottieAnimation
      animationData={errorAnimationData}
      width={width}
      height={height}
      loop={loop}
      autoplay={autoplay}
      speed={speed}
      className={className}
      style={style}
      onComplete={onComplete}
    />
  );
}