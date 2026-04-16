"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export default function FacebookPixel({ pixelId }: { pixelId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Shared eventId across browser pixel and CAPI for deduplication
  const currentEventId = useRef<string>("");

  const trackPageView = useCallback(
    (eventId: string, url: string) => {
      if (!pixelId) return;

      // 1. Browser-side tracking (with precise URL parameters)
      const fbq = (window as any).fbq;
      if (typeof fbq === "function") {
        fbq("track", "PageView", {
          page_location: url,
          page_path: pathname,
        }, { 
          eventID: eventId 
        });
      }

      // 2. Server-side (CAPI) tracking
      fetch("/api/facebook/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "PageView",
          eventUrl: url,
          userAgent: navigator.userAgent,
          eventId,
        }),
      }).catch(() => {
        /* fail silently */
      });
    },
    [pixelId, pathname]
  );

  useEffect(() => {
    if (!pixelId) return;

    // Use a small timeout to ensure the browser has updated history/location state
    const timeoutId = setTimeout(() => {
      const currentUrl = window.location.origin + pathname + (searchParams.toString() ? "?" + searchParams.toString() : "");
      
      currentEventId.current = crypto.randomUUID();
      trackPageView(currentEventId.current, currentUrl);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams, trackPageView, pixelId]);

  if (!pixelId) {
    return null;
  }

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
              n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('set', 'autoConfig', false, '${pixelId}');
            fbq('init', '${pixelId}');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
