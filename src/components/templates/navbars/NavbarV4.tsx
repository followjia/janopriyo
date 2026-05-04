/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, Heart, LayoutDashboard, Settings, LogOut, MapPin, Phone, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function NavbarV4() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cartItemsCount = useAppSelector((state) => state.cart.items.reduce((total, item) => total + item.quantity, 0));
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);
  const totalAmount = useAppSelector((state) => state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0));
  const isAdmin = (session?.user as any)?.role === 'admin';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const NAV_LINKS = [
    { label: 'Marketplace', href: '/shop' },
    { label: 'Daily Deals', href: '/shop?filter=deals' },
    { label: 'New Arrival', href: '/shop?sort=newest' },
    { label: 'Community', href: '/blog' }
  ];

  return (
    <nav className="bg-[#0f1111] text-white border-b border-white/5 relative shadow-2xl">
      {/* Utility Top Bar */}
      <div className="bg-[#1a1c1c] text-neutral-400 py-2 border-b border-white/5">
        <div className="container mx-auto px-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-8">
            <Link href="/shop" className="flex items-center gap-2 hover:text-white transition-colors" aria-label="Delivery: Global"><MapPin className="h-3 w-3 text-primary" /> Delivery: Global</Link>
            <Link href="/contact" className="flex items-center gap-2 hover:text-white transition-colors" aria-label="Support Core"><Phone className="h-3 w-3 text-primary" /> Support Core</Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
             <Link href="/help" className="hover:text-white flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5" /> Assistance</Link>
             <span className="text-white/20">|</span>
             <Link href="/track" className="hover:text-white">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Main Header Architecture */}
      <div className="container mx-auto px-4 py-5 flex items-center gap-6 lg:gap-12">
        {/* Mobile Menu Icon */}
        <button className="lg:hidden text-white p-1 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-7 w-7" />
        </button>

        {/* Branding */}
        <Link href="/" className="text-2xl md:text-3xl font-black text-white shrink-0 tracking-tighter flex items-center gap-1">
          JANOPRIYO<span className="text-primary italic">SHOP</span>
        </Link>

        {/* Professional Search System */}
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 relative group">
           <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-xl border-2 border-white/10 bg-white/5 pr-24 text-white placeholder:text-neutral-500 focus-visible:ring-offset-0 focus-visible:ring-primary focus-visible:bg-white/10 focus-visible:border-primary transition-all"
              placeholder="Search professional catalog..."
           />
           <Button 
            type="submit"
            className="absolute right-1 top-1 bottom-1 bg-primary text-white hover:bg-white hover:text-black px-6 font-black text-xs uppercase rounded-lg transition-all"
           >
              <Search className="h-4 w-4" />
           </Button>
        </form>

        {/* User & Global Cart Actions */}
        <div className="flex items-center gap-4 md:gap-8 ml-auto lg:ml-0">
          <Link href="/wishlist" className="relative group hidden sm:flex items-center gap-3">
             <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all border border-white/10">
                <Heart className={`h-5 w-5 ${wishlistCount > 0 ? 'fill-primary text-primary' : 'text-white'}`} />
             </div>
             {wishlistCount > 0 && (
               <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#0f1111] animate-in zoom-in">
                 {wishlistCount}
               </span>
             )}
          </Link>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 group">
                <div className="h-11 w-11 rounded-xl border-2 border-white/10 overflow-hidden group-hover:border-primary transition-all relative">
                  <Image 
                    src={session.user?.image || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#E2E8F0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="50" font-weight="bold" fill="#475569">${session.user?.name?.split(' ').map((n:any) => n[0]).join('').toUpperCase() || 'U'}</text></svg>`)}`} 
                    alt={session.user?.name || 'User'} 
                    fill
                    className="object-cover" 
                  />
                </div>
                  <div className="hidden xl:flex flex-col text-left">
                     <span className="text-[9px] opacity-40 uppercase font-black tracking-widest leading-none mb-1">Authenticated</span>
                     <span className="text-xs font-bold leading-none truncate max-w-[100px]">{session.user?.name?.split(' ')[0]}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 bg-[#1a1c1c] text-white border-white/5 shadow-2xl">
                 <DropdownMenuLabel className="px-3 pt-3 pb-2 font-black text-[10px] uppercase tracking-[0.2em] opacity-40">System Access</DropdownMenuLabel>
                 <div className="px-3 pb-4 mb-2 border-b border-white/5">
                    <p className="text-sm font-bold truncate">{session.user?.name}</p>
                    <p className="text-[10px] opacity-40 truncate">{session.user?.email}</p>
                 </div>
                 {isAdmin && (
                   <DropdownMenuItem onClick={() => router.push('/admin')} className="rounded-xl cursor-pointer hover:bg-primary/20 text-primary">
                     <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Console
                   </DropdownMenuItem>
                 )}
                 <DropdownMenuItem onClick={() => router.push('/account')} className="rounded-xl cursor-pointer hover:bg-white/5">
                   <Settings className="mr-2 h-4 w-4" /> User Settings
                 </DropdownMenuItem>
                 <DropdownMenuSeparator className="bg-white/5" />
                 <DropdownMenuItem onClick={() => signOut()} className="rounded-xl cursor-pointer text-red-500 hover:bg-red-500/10">
                   <LogOut className="mr-2 h-4 w-4" /> Terminate Session
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login" className="flex items-center gap-3 group">
              <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all border border-white/10">
                <User className="h-5 w-5" />
              </div>
              <div className="hidden xl:flex flex-col">
                 <span className="text-[9px] opacity-40 uppercase font-black tracking-widest leading-none mb-1">Guest</span>
                 <span className="text-xs font-bold leading-none">Access Store</span>
              </div>
            </Link>
          )}

          <Link href="/cart" className="relative group flex items-center gap-3">
            <div className="relative">
              <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(var(--primary-rgb),0.5)] group-hover:bg-white group-hover:text-black transition-all">
                <ShoppingCart className="h-5 w-5" />
              </div>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#0f1111] animate-bounce">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <div className="hidden md:flex flex-col">
               <span className="text-[9px] opacity-40 uppercase font-black tracking-widest leading-none mb-1">Your Bag</span>
               <span className="text-xs font-bold leading-none">৳{totalAmount.toLocaleString()}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* High-Impact Navigation (Desktop Only) */}
      <div className="bg-[#1a1c1c] border-t border-white/5">
        <div className="container mx-auto px-4 flex items-center gap-12 py-3 overflow-x-auto no-scrollbar">
           <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] opacity-80 shrink-0">
              {NAV_LINKS.map((link) => (
                <Link key={link.label} href={link.href} className="hover:text-primary transition-all relative group py-1">
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full" />
                </Link>
              ))}
           </div>
        </div>
      </div>

      {/* Mobile Drawer Infrastructure */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden animate-in fade-in duration-500" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-[320px] bg-[#0f1111] z-[101] lg:hidden animate-in slide-in-from-left duration-500 shadow-[20px_0_100px_rgba(0,0,0,0.8)] border-r border-white/5">
            <div className="bg-[#1a1c1c] p-8 flex items-center justify-between border-b border-white/5">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><User className="h-6 w-6" /></div>
                  <span className="font-black text-lg uppercase tracking-tighter">Identity Console</span>
               </div>
               <button onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors"><X className="h-7 w-7" /></button>
            </div>
            
            <div className="p-6 space-y-10">
               <form onSubmit={handleSearch} className="relative">
                  <Input 
                    className="w-full h-14 bg-white/5 border-white/10 rounded-xl focus-visible:border-primary text-white font-bold" 
                    placeholder="Search parameters..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="icon" className="absolute right-2 top-2 bottom-2 h-auto px-4 bg-primary rounded-lg"><Search className="h-4 w-4" /></Button>
               </form>

               <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em]">Main Modules</h3>
                  <div className="flex flex-col gap-6">
                    {NAV_LINKS.map(link => (
                      <Link key={link.label} href={link.href} className="text-3xl font-black text-white hover:text-primary transition-all uppercase tracking-tighter" onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
