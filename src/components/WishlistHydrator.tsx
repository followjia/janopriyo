'use client';

import { useEffect } from 'react';
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

  // 2. Auth Sync with Database
  useEffect(() => {
    if (status === 'authenticated' && isHydrated) {
      const syncWishlist = async () => {
        try {
          const localIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
          
          // Sync local items with DB
          const syncRes = await fetch('/api/wishlist/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: localIds }),
          });

          if (syncRes.ok) {
            const serverWishlist = await syncRes.json();
            // serverWishlist can be array of IDs or objects depending on API
            const finalIds = serverWishlist.map((item: any) => 
                typeof item === 'string' ? item : item._id
            );
            dispatch(setWishlist(finalIds));
            // Update localStorage to match server
            localStorage.setItem('wishlist', JSON.stringify(finalIds));
          } else {
            const errorData = await syncRes.json().catch(() => ({}));
            console.error('Failed to sync wishlist with server:', syncRes.status, errorData.message || 'Unknown error');
            // We do NOT dispatch(setWishlist) here to preserve local state on sync failure
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
