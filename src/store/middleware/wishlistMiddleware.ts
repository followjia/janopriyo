import { Middleware } from '@reduxjs/toolkit';

export const wishlistMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);

  // Define wishlist-related action types
  const wishlistActions = [
    'wishlist/toggleWishlist',
    'wishlist/setWishlist',
    'wishlist/hydrateWishlist'
  ];

  if (wishlistActions.includes(action.type)) {
    const wishlistState = (store.getState() as any).wishlist;
    if (typeof window !== 'undefined' && window.localStorage && wishlistState?.items) {
      try {
        localStorage.setItem('wishlist', JSON.stringify(wishlistState.items));
      } catch (e) {
        console.error('Failed to save wishlist to localStorage:', e);
      }
    }
  }

  return result;
};
