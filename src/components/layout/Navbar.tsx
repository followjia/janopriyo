"use client";

import { useState, useEffect } from 'react';
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
  Package 
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/mode-toggle';
import { useAppSelector } from '@/store/hooks';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { CategoryNav } from '@/components/layout/CategoryNav';
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
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const cartCount = useAppSelector((state) => state.cart.totalQuantity);

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
                <Link 
                  href="/" 
                  className="text-lg font-semibold hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/shop" 
                  className="text-lg font-semibold hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Shop
                </Link>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="categories" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 text-lg font-semibold h-auto">
                      Categories
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 flex flex-col gap-3 pl-4">
                      {mainCategories.map((cat) => (
                        <div key={cat._id} className="flex flex-col gap-2">
                           <Link 
                            href={`/shop?category=${cat.slug}`}
                            className="font-medium hover:text-primary"
                            onClick={() => setOpen(false)}
                          >
                            {cat.name}
                          </Link>
                          {categories
                            .filter(sub => (sub.parentCategory?._id || sub.parentCategory) === cat._id)
                            .map(sub => (
                              <Link 
                                key={sub._id}
                                href={`/shop?category=${sub.slug}`}
                                className="text-sm text-muted-foreground hover:text-primary pl-2 border-l ml-1"
                                onClick={() => setOpen(false)}
                              >
                                {sub.name}
                              </Link>
                            ))}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Link 
                  href="/contact" 
                  className="text-lg font-semibold hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Contact
                </Link>
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
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
          <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors">Shop</Link>
          <CategoryNav />
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</Link>
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
          {status === 'authenticated' && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger 
                render={
                  <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-primary/5 transition-colors">
                    {session.user.image ? (
                       <img 
                         src={session.user.image} 
                         alt={session.user.name || "Profile"} 
                         className="h-6 w-6 rounded-full object-cover border border-primary/20" 
                         referrerPolicy="no-referrer"
                       />
                    ) : (
                       <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                          <User className="h-4 w-4 text-primary" />
                       </div>
                    )}
                    <span className="hidden md:inline font-medium text-sm">
                      {session.user.name ? session.user.name.split(' ')[0] : 'User'}
                    </span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href={dashboardHref} />}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  variant="destructive"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" className="group">
                <User className="h-5 w-5 group-hover:text-primary transition-colors" />
                <span className="sr-only">User Account</span>
              </Button>
            </Link>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
