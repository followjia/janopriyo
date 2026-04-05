'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Provider as ReduxProvider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { store } from '@/store/store';

import { AnimationProvider } from './animation-provider';
import { CartHydrator } from './CartHydrator';
import { WishlistHydrator } from './WishlistHydrator';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnimationProvider>
            <CartHydrator>
              <WishlistHydrator>
                {children}
              </WishlistHydrator>
            </CartHydrator>
          </AnimationProvider>
        </NextThemesProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
