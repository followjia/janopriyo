'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrateWishlist, setWishlistHydrated, setWishlist } from '@/store/slices/wishlistSlice';
import { useSession } from 'next-auth/react';

export function WishlistHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { status } = useSession();
  const isHydrated = useAppSelector((state) => state.wishlist.isHydrated);

  // 1. Initial LocalStorage Hydration
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          dispatch(hydrateWishlist(parsedWishlist));
        } else {
          dispatch(setWishlistHydrated());
        }
      } else {
        dispatch(setWishlistHydrated());
      }
    } catch (error) {
      console.error('Failed to hydrate wishlist:', error);
      dispatch(setWishlistHydrated());
    }
  }, [dispatch]);

  const syncAttempted = useRef(false);

  // 2. Auth Sync with Database
  useEffect(() => {
    if (status === 'authenticated' && isHydrated && !syncAttempted.current) {
      const syncWishlist = async () => {
        syncAttempted.current = true;
        try {
          let localIds = [];
          try {
            const saved = localStorage.getItem('wishlist');
            localIds = saved ? JSON.parse(saved) : [];
            if (!Array.isArray(localIds)) localIds = [];
          } catch (e) {
            console.error('Failed to parse local wishlist for sync', e);
            localIds = [];
          }
          
          // Sync local items with DB
          const syncRes = await fetch('/api/wishlist/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: localIds }),
          });

          if (syncRes.ok) {
            const serverWishlist = await syncRes.json();
            // serverWishlist is now guaranteed to be array of IDs as strings
            const finalIds = serverWishlist
                .map((item: any) => typeof item === 'string' ? item : (item._id || item.id))
                .filter((id: any): id is string => typeof id === 'string' && id.length > 0);
            
            dispatch(setWishlist(finalIds));
            // Update localStorage to match server
            localStorage.setItem('wishlist', JSON.stringify(finalIds));
          } else {
            const errorData = await syncRes.json().catch(() => ({}));
            console.error('Failed to sync wishlist with server:', syncRes.status, errorData.message || 'Unknown error');
            // Reset ref on non-auth failures if you want to retry? 
            // Better to keep true to avoid potential infinite failure loops in one session.
          }
        } catch (error) {
          console.error('Failed to sync wishlist with server:', error);
        }
      };

      syncWishlist();
    }
  }, [status, isHydrated, dispatch]);

  return <>{children}</>;
}
