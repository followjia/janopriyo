'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
    ShoppingBag, 
    User, 
    Settings, 
    LogOut, 
    Loader2, 
    ChevronRight, 
    Clock, 
    CheckCircle2, 
    Truck, 
    Package 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        } else {
          const error = await res.json().catch(() => ({ message: res.statusText }));
          toast.error(`Failed to fetch orders: ${res.status} ${error.message || ''}`);
        }
      } catch (error) {
        toast.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) {
      fetchOrders();
    }
  }, [session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Processing': return 'default';
      case 'Shipped': return 'default';
      case 'Delivered': return 'default';
      default: return 'outline';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-lg mb-4">
                  <User className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold">{session?.user?.name}</CardTitle>
              <CardDescription>{session?.user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                <Button variant="ghost" className="justify-start px-6 h-12 rounded-none border-l-4 border-primary bg-muted/50">
                  <ShoppingBag className="mr-3 h-4 w-4" /> My Orders
                </Button>
                <Button variant="ghost" className="justify-start px-6 h-12 rounded-none border-l-4 border-transparent">
                  <User className="mr-3 h-4 w-4" /> Profile Info
                </Button>
                <Button variant="ghost" className="justify-start px-6 h-12 rounded-none border-l-4 border-transparent">
                  <Settings className="mr-3 h-4 w-4" /> Account Settings
                </Button>
                <Separator />
                <Button 
                    variant="ghost" 
                    className="justify-start px-6 h-12 rounded-none border-l-4 border-transparent text-destructive hover:bg-destructive/10"
                    onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="mr-3 h-4 w-4" /> Sign Out
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Orders Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black tracking-tight">Order History</h1>
            <p className="text-sm text-muted-foreground">{orders.length} total orders found</p>
          </div>

          <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Order ID</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Items</TableHead>
                  <TableHead className="font-bold">Total</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-2">
                             <Package className="h-8 w-8 text-muted-foreground opacity-20" />
                             <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                        </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</TableCell>
                      <TableCell className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs">{order.items.length} items</TableCell>
                      <TableCell className="font-bold">${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(order.status) as any}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 group"
                          onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                        >
                          Details
                          <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-10">
              <Card className="bg-primary/5 border-none shadow-none">
                  <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                      <Clock className="h-6 w-6 text-primary" />
                      <div className="text-2xl font-black">{orders.filter(o => o.status === 'Pending').length}</div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Pending Orders</div>
                  </CardContent>
              </Card>
              <Card className="bg-primary/5 border-none shadow-none">
                  <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                      <Truck className="h-6 w-6 text-primary" />
                      <div className="text-2xl font-black">{orders.filter(o => o.status === 'Shipped').length}</div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Shipped Orders</div>
                  </CardContent>
              </Card>
              <Card className="bg-primary/5 border-none shadow-none">
                  <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                      <div className="text-2xl font-black">{orders.filter(o => o.status === 'Delivered').length}</div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Delivered Orders</div>
                  </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
