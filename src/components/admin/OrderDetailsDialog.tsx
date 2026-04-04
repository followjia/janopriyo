'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, Phone, MapPin, CreditCard, Calendar } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { toast } from 'sonner';

interface OrderDetailsDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export default function OrderDetailsDialog({
  orderId,
  open,
  onOpenChange,
  onUpdate,
}: OrderDetailsDialogProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderId}`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          toast.error('Failed to load order details');
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          toast.error('Error loading order details');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (open && orderId) {
      fetchOrderDetails();
    } else {
      setOrder(null);
    }

    return () => controller.abort();
  }, [open, orderId]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-xl font-bold">
              Order Details
            </DialogTitle>
            {order && (
              <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                {order.status}
              </Badge>
            )}
          </div>
          <DialogDescription>
            {order ? `Order ID: #${String(order._id ?? '').toUpperCase()}` : 'Loading order details...'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : order ? (
          <div className="space-y-6 pt-4">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase text-muted-foreground">Customer</h3>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {order.user?.name?.[0] || 'G'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.user?.name || 'Guest User'}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {order.user?.email || 'No Email'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase text-muted-foreground">Order Date</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {order.createdAt && isValid(new Date(order.createdAt)) 
                      ? format(new Date(order.createdAt), 'MMMM dd, yyyy p')
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Shipping & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Shipping Address
                </h4>
                <div className="text-sm leading-relaxed">
                  {(order.shippingAddress?.fullName || order.user?.name) && (
                    <p>{order.shippingAddress?.fullName || order.user?.name}</p>
                  )}
                  {order.shippingAddress?.street && <p>{order.shippingAddress?.street}</p>}
                  {(order.shippingAddress?.city || order.shippingAddress?.state || order.shippingAddress?.zipCode) && (
                    <p>
                      {[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ')}
                      {([order.shippingAddress?.city, order.shippingAddress?.state].some(Boolean) && order.shippingAddress?.zipCode) ? ' ' : ''}
                      {order.shippingAddress?.zipCode}
                    </p>
                  )}
                  {order.shippingAddress?.country && <p>{order.shippingAddress?.country}</p>}
                  {order.shippingAddress?.phone && (
                    <p className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <Phone className="h-3 w-3" /> {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Payment Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-medium">
                    <span>Method:</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Status:</span>
                    <Badge variant={order.paymentStatus === 'Paid' ? 'default' : 'outline'} className={order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : ''}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  {order.transactionId && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Transaction ID:</span>
                      <code className="bg-muted px-2 py-1 rounded text-[10px] break-all">{order.transactionId}</code>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase text-muted-foreground">Order Items</h4>
              <div className="space-y-3">
                {(order.items || []).map((item: any, i: number) => (
                  <div key={item._id || item.id || i} className="flex items-center justify-between text-sm gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-12 w-12 rounded border overflow-hidden bg-muted flex-shrink-0">
                         {item.image ? (
                             <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                         ) : (
                             <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                         )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium line-clamp-1">{item.name}</span>
                        <span className="text-xs text-muted-foreground">${(Number(item.price) || 0).toFixed(2)} × {item.quantity}</span>
                      </div>
                    </div>
                    <div className="font-bold">
                      ${(Number(item.price || 0) * (item.quantity || 0)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t flex justify-between items-center text-lg">
                <span className="font-bold">Total Amount:</span>
                <span className="font-black text-primary">${(Number(order.totalAmount) || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            No details found for this order.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
