'use client';

import dynamic from 'next/dynamic';
import { CSSProperties } from 'react';

const LottieAnimation = dynamic(() => import('./LottieAnimation'), {
  ssr: false,
  loading: () => (
    <div className="w-24 h-24 bg-green-100 rounded-full animate-pulse flex items-center justify-center">
      <div className="w-8 h-8 text-green-600">✓</div>
    </div>
  ),
});

interface SuccessAnimationProps {
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  style?: CSSProperties;
  onComplete?: () => void;
}

export default function SuccessAnimation({
  width = 96,
  height = 96,
  loop = false, // Success animations usually play once
  autoplay = true,
  speed = 1,
  className = '',
  style = {},
  onComplete,
}: SuccessAnimationProps) {
  // Import your success animation JSON here
  const successAnimationData = require('../../../public/lottie/online-delivery-service.json');

  return (
    <LottieAnimation
      animationData={successAnimationData}
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