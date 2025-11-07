"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "react-hot-toast"
import { LoadScript } from "@react-google-maps/api"

const GOOGLE_MAPS_LIBRARIES: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"]

export function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let audio: HTMLAudioElement | null = null;

    function handleSWMessage(event: MessageEvent) {
      try {
        const data = event.data || {};
        if (data?.type === 'play-sound' && data?.sound) {
          // Create or reuse audio element
          try {
            if (!audio) {
              audio = new Audio(data.sound);
              audio.preload = 'auto';
            } else {
              audio.src = data.sound;
            }
            // Attempt to play; browsers may block autoplay unless user interacted
            audio.play().catch((err) => {
              // Ignore autoplay errors; optional: show UI alert instead
              console.debug('Audio play prevented by browser autoplay policy', err);
            });
          } catch (err) {
            console.error('Failed to play notification sound', err);
          }
        }

        if (data?.type === 'route' && data?.url) {
          // When service worker asks client to route, use client-side navigation
          try {
            window.location.href = data.url;
          } catch (e) {
            console.error('Failed to route to', data.url, e);
          }
        }
      } catch (e) {
        console.error('Error handling service worker message', e);
      }
    }

    navigator.serviceWorker.addEventListener('message', handleSWMessage as any);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleSWMessage as any);
      audio = null;
    };
  }, []);
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
        libraries={GOOGLE_MAPS_LIBRARIES}
        loadingElement={<div />}
      >
        {children}
      </LoadScript>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
            },
            iconTheme: {
              primary: '#16a34a',
              secondary: '#ffffff',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            },
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
          loading: {
            style: {
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
            },
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </NextThemesProvider>
  )
}
