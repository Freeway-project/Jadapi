'use client';

import { useEffect, useRef, useState } from 'react';

const useReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Props = {
  animationData: object;          // import JSON
  loop?: boolean;
  playOnVisible?: boolean;        // default true
  className?: string;             // apply width rules from parent
  ariaLabel?: string;
  fallbackPngSrc?: string;        // optional static fallback
  aspectRatio?: number;           // e.g., 1 (square), 16/9, 4/3. Default 1
};

export default function LottiePlayer({
  animationData,
  loop = true,
  playOnVisible = true,
  className,
  ariaLabel = 'Animation',
  fallbackPngSrc,
  aspectRatio = 1,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canPlay, setCanPlay] = useState(!playOnVisible);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!playOnVisible || reduced) return;

    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setCanPlay(true);
          io.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [playOnVisible, reduced]);

  useEffect(() => {
    if (reduced || !canPlay || !containerRef.current) return;

    let anim: any;
    (async () => {
      // dynamic import to keep bundle lean
      const lottie = (await import('lottie-web')).default;
      anim = lottie.loadAnimation({
        container: containerRef.current!,
        renderer: 'svg',
        loop,
        autoplay: true,
        animationData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet', // keeps it centered & responsive
          progressiveLoad: true,
          hideOnTransparent: true,
        },
      });
    })();

    return () => {
      if (anim) anim.destroy();
    };
  }, [animationData, loop, canPlay, reduced]);

  // Reduced motion fallback
  if (reduced && fallbackPngSrc) {
    return (
      <img
        src={fallbackPngSrc}
        alt={ariaLabel}
        className={className}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    );
  }

  // Responsive wrapper using aspect-ratio
  return (
    <div
      aria-label={ariaLabel}
      className={className}
      style={{
        width: '100%',
        position: 'relative',
        aspectRatio: String(aspectRatio),
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          // Lottie will size to its container
        }}
      />
    </div>
  );
}