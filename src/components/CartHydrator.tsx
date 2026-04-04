'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { hydrateCart, setHydrated } from '@/store/slices/cartSlice';

export function CartHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Important: Ensure the parsed data matches the expected structure
        if (parsedCart && Array.isArray(parsedCart.items)) {
          dispatch(hydrateCart({
            ...parsedCart,
            isHydrated: true
          }));
        } else {
          dispatch(setHydrated());
        }
      } else {
        dispatch(setHydrated());
      }
    } catch (error) {
      console.error('Failed to hydrate cart:', error);
      dispatch(setHydrated());
    }
  }, [dispatch]);

  return <>{children}</>;
}
