import { useEffect } from 'react';

interface TawkOptions {
  enableLogging?: boolean;
}

/**
 * Custom hook to initialize and manage Tawk.to chat widget
 * Requires NEXT_PUBLIC_TAWK_PROPERTY_ID environment variable
 * 
 * Usage:
 * ```tsx
 * useTawkChat();
 * 
 * // Then use it:
 * window.Tawk_API?.toggle();
 * ```
 */
export const useTawkChat = (options: TawkOptions = {}) => {
  const { enableLogging = false } = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;

    if (!tawkPropertyId) {
      if (enableLogging) {
        console.warn(
          'Tawk chat is not configured. Please set NEXT_PUBLIC_TAWK_PROPERTY_ID in your environment variables.\n' +
          'Format: your_property_id/your_widget_id\n' +
          'Get it from: https://tawk.to'
        );
      }
      return;
    }

    // Initialize Tawk API
    // @ts-ignore
    window.Tawk_API = window.Tawk_API || {};
    // @ts-ignore
    window.Tawk_LoadStart = new Date();

    // Check if script is already loaded
    // @ts-ignore
    if (window.Tawk_API.onLoad) {
      return; // Already loaded
    }

    // Create and append script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${tawkPropertyId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    script.onerror = () => {
      if (enableLogging) {
        console.error('Failed to load Tawk chat widget');
      }
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Optional: Remove script on unmount if needed
      // Note: Tawk typically persists, so we don't remove it
    };
  }, [enableLogging]);
};

/**
 * Toggle the Tawk chat widget
 */
export const toggleTawkChat = () => {
  // @ts-ignore
  if (window.Tawk_API?.toggle) {
    // @ts-ignore
    window.Tawk_API.toggle();
  }
};

/**
 * Hide the Tawk chat widget
 */
export const hideTawkChat = () => {
  // @ts-ignore
  if (window.Tawk_API?.hideWidget) {
    // @ts-ignore
    window.Tawk_API.hideWidget();
  }
};

/**
 * Show the Tawk chat widget
 */
export const showTawkChat = () => {
  // @ts-ignore
  if (window.Tawk_API?.showWidget) {
    // @ts-ignore
    window.Tawk_API.showWidget();
  }
};

/**
 * Set visitor information in Tawk
 */
export const setTawkVisitorInfo = (data: {
  name?: string;
  email?: string;
  phone?: string;
  hash?: string;
}) => {
  // @ts-ignore
  if (window.Tawk_API?.setAttributes) {
    // @ts-ignore
    window.Tawk_API.setAttributes(data);
  }
};
