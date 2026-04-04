"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, User, Search, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/mode-toggle';
import { useAppSelector } from '@/store/hooks';
import { CartDrawer } from '@/components/layout/CartDrawer';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/categories', label: 'Categories' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const cartCount = useAppSelector((state) => state.cart.totalQuantity);

  const profileHref = status === 'unauthenticated' ? '/login' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile Menu */}
        <div className="flex md:hidden items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger 
              render={<Button variant="ghost" size="icon" className="md:hidden" />}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle mobile menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className="text-lg font-semibold hover:text-primary transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">Janopriyo Shop</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 items-center flex-1 ml-10">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Wishlist</span>
          </Button>
          <CartDrawer>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative group transition-all hover:scale-110"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingCart className="h-5 w-5 group-hover:text-primary transition-colors" />
              <span className="sr-only">Cart</span>
              {cartCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-background ring-offset-background" 
                >
                      {cartCount}
                </span>
              )}
            </Button>
          </CartDrawer>
          <Link href={profileHref}>
            {status === 'authenticated' && session?.user ? (
               <Button variant="ghost" className="flex items-center gap-2 px-2">
                 {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "Profile"} 
                      className="h-6 w-6 rounded-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                 ) : (
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                       <User className="h-4 w-4 text-primary" />
                    </div>
                 )}
                 <span className="hidden md:inline font-medium text-sm">
                   {session.user.name ? session.user.name.slice(0, 5) : 'User'}
                 </span>
               </Button>
            ) : (
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User Account</span>
              </Button>
            )}
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
