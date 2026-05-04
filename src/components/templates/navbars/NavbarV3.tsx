/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, User, Heart, Menu, X, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function NavbarV3() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemsCount = useAppSelector((state) => state.cart.items.reduce((total, item) => total + item.quantity, 0));
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);
  const isAdmin = (session?.user as any)?.role === 'admin';

  const NAV_LINKS = [
    { label: 'Shop', href: '/shop' },
    { label: 'Curated', href: '/categories' },
    { label: 'Journal', href: '/blog' }
  ];

  return (
    <header className="w-full bg-white border-b border-neutral-100 sticky top-0 z-50 animate-in fade-in duration-1000">
      <div className="container mx-auto px-4 lg:px-12">
        {/* Top Minimal Bar */}
        <div className="py-2.5 text-center text-[9px] font-black tracking-[0.4em] uppercase text-neutral-400 border-b border-neutral-50/50">
          Curating the Finest Selections • Worldwide Priority Shipping
        </div>

        {/* Main Nav */}
        <div className="flex items-center justify-between py-6">

          {/* Left: Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-12">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Center: Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-4xl font-serif tracking-widest italic hover:opacity-60 transition-opacity">
              Janopriyo
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => router.push('/shop')}
              className="hover:text-primary transition-colors hidden sm:block"
              aria-label="Open shop search"
            >
              <Search className="h-5 w-5 stroke-[1.5]" />
            </button>

            <Link href="/wishlist" className="relative hidden sm:block group">
              <Heart className={`h-5 w-5 stroke-[1.5] group-hover:fill-primary group-hover:text-primary transition-all ${wishlistCount > 0 ? 'fill-primary text-primary' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-9 w-9 rounded-full border border-neutral-200 overflow-hidden hover:scale-110 transition-transform">
                    <img 
                      src={session.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || "User")}&background=random`} 
                      alt={session.user?.name || "User Profile"} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent("User")}&background=f3f4f6&color=6b7280`;
                      }}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded-xl p-2 bg-white border-neutral-100 shadow-2xl">
                  <DropdownMenuLabel className="px-3 pt-3 pb-1 font-black text-[9px] uppercase tracking-widest text-neutral-400">Authenticated Profile</DropdownMenuLabel>
                  <div className="px-3 pb-3 mb-2 border-b">
                    <p className="text-sm font-bold truncate">{session.user?.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{session.user?.email}</p>
                  </div>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => router.push('/admin')} className="rounded-lg cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Management Console
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push('/account')} className="rounded-lg cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" /> Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="rounded-lg cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> End Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login" className="hidden sm:block">
                <User className="h-5 w-5 stroke-[1.5] hover:text-primary transition-colors" />
              </Link>
            )}

            <Link href="/cart" className="flex items-center gap-3 group">
              <div className="relative">
                <ShoppingBag className="h-5 w-5 stroke-[1.5] group-hover:text-primary transition-all" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 bg-black text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block border-b-2 border-transparent group-hover:border-primary transition-all">Atelier</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white pt-32 lg:hidden animate-in fade-in slide-in-from-top duration-700">
          <div className="flex flex-col items-center gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-4xl font-serif italic tracking-tighter hover:text-primary transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="w-16 h-[1px] bg-neutral-200" />
            <div className="flex gap-12">
              <button onClick={() => { router.push('/shop'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-2">
                <Search className="h-6 w-6" />
                <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Find</span>
              </button>
              <button onClick={() => { router.push('/wishlist'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-2">
                <Heart className="h-6 w-6" />
                <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Saved</span>
              </button>
              {!session && (
                <button onClick={() => { router.push('/auth/login'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-2">
                  <User className="h-6 w-6" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Entry</span>
                </button>
              )}
            </div>
          </div>
          <button
            className="absolute top-10 right-10 p-2 hover:bg-neutral-50 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-8 w-8" />
          </button>
        </div>
      )}
    </header>
  );
}
