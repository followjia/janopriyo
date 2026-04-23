"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  LayoutDashboard,
  LogOut,
  Settings,
  Package,
  Truck,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/mode-toggle';
import { useAppSelector } from '@/store/hooks';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { CategoryNav } from '@/components/layout/CategoryNav';
import { AIChatbot } from '@/components/layout/AIChatbot';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blogs' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const { totalQuantity: cartCount, totalAmount } = useAppSelector((state) => state.cart);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const [categories, setCategories] = useState<any[]>([]);
  const isAdmin = (session?.user as any)?.role === 'admin';
  const dashboardHref = isAdmin ? '/admin/dashboard' : '/dashboard';

  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.filter((c: any) => c.isActive));
        }
      } catch (e) {
        console.error('Failed to fetch categories');
      }
    }
    fetchCats();
  }, []);

  const mainCategories = categories.filter(c => !c.parentCategory);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <>
      {/* ── Main Header Bar ─────────────────────────────────────────────────── */}
      {/* Sticky on mobile, static on desktop — scrolls away on desktop so the  */}
      {/* bottom nav can then stick to the top of the viewport.                 */}
      <header className="sticky top-0 z-50 md:relative w-full bg-background border-b md:border-b-0">
        <div className="container mx-auto">
          {/* Middle Main Row: Search | Logo | Icons */}
          <div className="flex h-20 items-center justify-between px-4 md:px-6 border-b border-muted/30">

            {/* Desktop Search (Left) */}
            <div className="hidden md:flex flex-1 items-center max-w-[280px]">
              <form onSubmit={handleSearch} className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-muted/40 border-none rounded-full py-2.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                />
              </form>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex md:hidden items-center mr-4">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle mobile menu</span>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                  <nav className="flex flex-col gap-6 mt-12 px-2">
                    <Link href="/" className="text-xl font-bold font-serif" onClick={() => setOpen(false)}>Janopriyo Shop</Link>
                    <div className="space-y-4 pt-6 border-t font-medium tracking-tight">
                      {navItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                          <React.Fragment key={item.href}>
                            <Link
                              href={item.href}
                              className={`block hover:text-primary transition-colors ${isActive ? 'text-primary font-bold' : ''}`}
                              onClick={() => setOpen(false)}
                            >
                              {item.label}
                            </Link>
                            {/* Insert Categories Accordion after Home (index 0) */}
                            {index === 0 && (
                              <Accordion type="single" collapsible>
                                <AccordionItem value="cats" className="border-none">
                                  <AccordionTrigger className="py-2 hover:no-underline uppercase text-[12px] font-bold tracking-[0.2em] text-left">Categories</AccordionTrigger>
                                  <AccordionContent className="pt-2 pl-4 flex flex-col gap-3">
                                    {mainCategories.map(cat => (
                                      <Link
                                        key={cat._id}
                                        href={`/shop?category=${cat.slug}`}
                                        onClick={() => setOpen(false)}
                                        className="hover:text-primary text-[11px] font-bold uppercase tracking-[0.1em]"
                                      >
                                        {cat.name}
                                      </Link>
                                    ))}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo (Centered in desktop, Left-ish in mobile) */}
            <div className="flex items-center justify-center flex-1 md:flex-initial">
              <Link href="/" className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-serif font-black tracking-tight text-foreground uppercase transition-all hover:opacity-80 leading-none">
                  Janopriyo
                </span>

              </Link>
            </div>

            {/* Icons/Action Row (Right) */}
            <div className="flex items-center justify-end gap-1 flex-1 max-w-[320px]">

              {/* Theme Toggle (Left of group) */}
              <div className="hidden sm:block">
                <ModeToggle />
              </div>

              {/* AI Chatbot */}
              <div className="hidden sm:block">
                <AIChatbot />
              </div>

              {/* Wishlist */}
              <Link href="/wishlist" className="hidden sm:block">
                <Button variant="ghost" size="icon" className="h-10 w-10 relative hover:text-primary transition-all hover:bg-primary/5 active:scale-90">
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 bg-primary text-[8px] font-bold text-white flex items-center justify-center rounded-full shadow-sm animate-in fade-in zoom-in duration-300">
                      {wishlistItems.length}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <CartDrawer>
                <div className="flex items-center gap-2 group cursor-pointer hover:bg-primary/5 px-2 py-1.5 rounded-full transition-all active:scale-95">
                  <div className="relative transition-all group-hover:scale-110 group-hover:text-primary shrink-0">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-primary text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-background">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <div className="hidden lg:block leading-none">
                    <span className="text-xs font-bold font-serif whitespace-nowrap">৳{Math.round(totalAmount)}</span>
                  </div>
                </div>
              </CartDrawer>

              {/* User Account (Right end) */}
              {status === 'authenticated' && session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 rounded-full px-1.5 py-1 hover:bg-primary/5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                    {/* Avatar */}
                    <div className="relative h-8 w-8 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name ?? 'User'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[11px] font-bold text-primary uppercase">
                          {(session.user.name ?? 'U').slice(0, 2)}
                        </span>
                      )}
                    </div>
                    {/* Name — desktop only, max 5 chars */}
                    <span className="hidden md:block text-[11px] font-semibold tracking-wide max-w-[44px] truncate">
                      {(session.user.name ?? '').slice(0, 5)}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-serif">
                        <div className="flex flex-col">
                          <span>{session.user.name}</span>
                          <span className="text-xs font-normal text-muted-foreground truncate">{session.user.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem render={<Link href={dashboardHref} />} nativeButton={false}>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/profile" />} nativeButton={false}>
                        <User className="mr-2 h-4 w-4" /> Profile
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem render={<Link href="/admin/settings" />} nativeButton={false}>
                          <Settings className="mr-2 h-4 w-4" /> Admin Settings
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" className="hidden sm:inline-flex">
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:text-primary transition-colors">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* ── Bottom Navigation Row ────────────────────────────────────────────── */}
      {/* Siblings with <header> so sticky works relative to the viewport,      */}
      {/* not the parent's bounding box. Only visible on desktop (md+).         */}
      <nav className="hidden md:flex sticky top-0 z-40 w-full h-12 items-center justify-center border-b bg-background/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex justify-center">
          <ul className="flex items-center gap-10">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;

              return (
                <React.Fragment key={item.href}>
                  <li className="h-full flex items-center relative">
                    <Link
                      href={item.href}
                      className={`text-[12px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary px-1 ${isActive ? 'text-primary' : ''}`}
                    >
                      {item.label}
                    </Link>
                    {isActive && (
                      <motion.div
                        layoutId="active-underline"
                        className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-primary"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </li>
                  {/* Insert CategoryNav after Home (index 0) */}
                  {index === 0 && (
                    <li className="flex items-center h-full">
                      <CategoryNav />
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
