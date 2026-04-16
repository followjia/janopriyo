"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    fbqInitialized: boolean;
  }
}

export default function FacebookPixel({ pixelId }: { pixelId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string>("");
  const currentEventId = useRef<string>("");

  const trackPageView = useCallback(
    (eventId: string, url: string) => {
      if (!pixelId) return;

      console.log(`[FB-Pixel] Tracking PageView | ID: ${eventId} | URL: ${url}`);

      const fbq = (window as any).fbq;
      if (typeof fbq === "function") {
        // Facebook automatically captures the URL from window.location.href
        // We only pass the eventID for deduplication
        fbq("track", "PageView", {}, { 
          eventID: eventId 
        });
      }

      fetch("/api/facebook/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "PageView",
          eventUrl: url,
          userAgent: navigator.userAgent,
          eventId,
        }),
      }).catch(() => {});
    },
    [pixelId]
  );

  useEffect(() => {
    if (!pixelId) return;

    // Increased timeout to 500ms to ensure window.location.href is fully settled
    const timeoutId = setTimeout(() => {
      const currentUrl = window.location.origin + pathname + (searchParams.toString() ? "?" + searchParams.toString() : "");
      const trackingKey = pathname + searchParams.toString();

      if (lastTrackedPath.current === trackingKey) return;
      
      lastTrackedPath.current = trackingKey;
      currentEventId.current = crypto.randomUUID();
      trackPageView(currentEventId.current, currentUrl);
    }, 500); 

    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams, trackPageView, pixelId]);

  if (!pixelId) return null;

  return (
    <Script
      id="fb-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          if (!window.fbqInitialized) {
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
              n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            // Disable automatic URL tracking to allow manual control
            if (window._fbq) {
              window._fbq.disablePushState = true;
              window.fbq.allowDuplicatePageViews = true;
            }
            
            fbq('set', 'autoConfig', false, '${pixelId}');
            fbq('init', '${pixelId}');
            window.fbqInitialized = true;
          }
        `,
      }}
    />
  );
}
