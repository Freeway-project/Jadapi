'use client';

import { useLottie } from 'lottie-react';
import { CSSProperties, useEffect, useState } from 'react';

interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  className?: string;
  speed?: number;
  onComplete?: () => void;
  onLoopComplete?: () => void;
}

export default function LottieAnimation({
  animationData,
  loop = true,
  autoplay = true,
  width = 300,
  height = 300,
  style = {},
  className = '',
  speed = 1,
  onComplete,
  onLoopComplete,
}: LottieAnimationProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const options = {
    animationData,
    loop,
    autoplay,
  };

  const { View, play, pause, stop, setSpeed } = useLottie(options, {
    width,
    height,
    style: {
      ...style,
    },
  });

  useEffect(() => {
    if (speed !== 1) {
      setSpeed(speed);
    }
  }, [speed, setSpeed]);

  // Don't render anything during SSR
  if (!isMounted) {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: 'transparent',
          ...style
        }}
        className={className}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {View}
    </div>
  );
}