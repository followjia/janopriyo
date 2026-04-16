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

// PIXEL_ID is now passed as a prop from layout

export default function FacebookPixel({ pixelId }: { pixelId?: string }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Shared eventId across browser pixel and CAPI for deduplication
    // Initialize with a dummy or empty string during SSR
    const currentEventId = useRef<string>("");

    const trackPageView = useCallback((eventId: string) => {
        if (!pixelId) return;
        
        // Ensure window.fbq is handled even if script is not fully loaded
        // The script snippet defines fbq as a queueing function immediately
        const fbq = (window as any).fbq;
        if (typeof fbq === 'function') {
            fbq('track', 'PageView', {}, { eventID: eventId });
        }
        
        // CAPI tracking
        fetch('/api/facebook/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName: 'PageView',
                eventUrl: window.location.href,
                userAgent: navigator.userAgent,
                eventId,
            }),
        }).catch(() => { /* fail silently */ });
    }, [pixelId]);

    useEffect(() => {
        if (!pixelId) return;
        currentEventId.current = crypto.randomUUID();
        trackPageView(currentEventId.current);
    }, [pathname, searchParams, trackPageView]);

    if (!pixelId) return null;

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
