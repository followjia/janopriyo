'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import OrderDetailsDialog from '@/components/admin/OrderDetailsDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  Trash2,
  XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Swal from 'sweetalert2';


export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders?all=true');
      if (!res.ok) {
        throw new Error(`Failed to load orders: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setOrders(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();
    return (
      (order._id?.toLowerCase() || '').includes(search) ||
      (order.user?.email?.toLowerCase() || '').includes(search) ||
      (order.user?.name?.toLowerCase() || '').includes(search)
    );
  });

  const updateStatus = async (id: string, status: string, extraData: any = {}) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extraData }),
      });

      if (res.ok) {
        toast.success(`Order updated successfully`);
        fetchOrders();
      } else {
        toast.error('Failed to update order');
      }
    } catch (error) {
      toast.error('Error updating order');
    }
  };

  const deleteOrder = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This order will be permanently deleted from the database!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00D1B2',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-lg px-4 py-2 font-bold',
        cancelButton: 'rounded-lg px-4 py-2 font-bold'
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/orders/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          toast.success('Order deleted successfully');
          fetchOrders();
        } else {
          toast.error('Failed to delete order');
        }
      } catch (error) {
        toast.error('Error deleting order');
      }
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: "Are you sure you want to cancel this order?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, cancel it!',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-lg px-4 py-2 font-bold',
        cancelButton: 'rounded-lg px-4 py-2 font-bold'
      }
    });

    if (result.isConfirmed) {
      await updateStatus(orderId, 'Cancelled');
    }
  };

  const openDetails = (id: string) => {
    setSelectedOrderId(id);
    setIsDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Order Placed': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-none">Placed</Badge>;
      case 'Confirmed': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-none">Confirmed</Badge>;
      case 'Paid': return <Badge variant="secondary" className="bg-green-100 text-green-800 border-none text-[10px]">Paid</Badge>;
      case 'Ready for Delivery': return <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-none text-[10px]">Ready</Badge>;
      case 'Released for Delivery': return <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-none text-[10px]">Released</Badge>;
      case 'Delivered': return <Badge variant="default" className="bg-green-600 text-white border-none">Delivered</Badge>;
      case 'Cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-6 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
        <div className="w-full sm:w-72">
          <Input 
            placeholder="Search by ID or Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Info</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <button 
                      type="button"
                      className="flex flex-col cursor-pointer text-left hover:opacity-80 transition-opacity" 
                      onClick={() => openDetails(order._id)}
                      aria-label={`Open order ${order._id.slice(-8).toUpperCase()}`}
                    >
                      <span className="font-bold text-primary hover:underline">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.createdAt && !isNaN(new Date(order.createdAt).getTime()) 
                          ? format(new Date(order.createdAt), 'MMM dd, p')
                          : 'N/A'}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold">{order.user?.name || 'Guest User'}</span>
                      <span className="text-muted-foreground">{order.user?.email || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">৳{Math.round(order.totalAmount ?? 0)}</TableCell>
                  <TableCell>
                    <Badge 
                        variant="outline" 
                        className={order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="text-primary" onClick={() => openDetails(order._id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {/* Sequential Quick Actions */}
                      {order.status === 'Order Placed' && (
                        <Button variant="ghost" size="icon" title="Confirm Order" onClick={() => updateStatus(order._id, 'Confirmed')}>
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      {order.status === 'Confirmed' && (
                        <Button variant="ghost" size="icon" title="Mark as Paid" onClick={() => updateStatus(order._id, 'Paid', { paymentStatus: 'Paid' })}>
                          <div className="h-4 w-4 rounded-full border-2 border-green-600 flex items-center justify-center text-[10px] font-bold text-green-600">৳</div>
                        </Button>
                      )}
                      {order.status === 'Paid' && (
                        <Button variant="ghost" size="icon" title="Ready for Delivery" onClick={() => updateStatus(order._id, 'Ready for Delivery')}>
                          <Package className="h-4 w-4 text-purple-600" />
                        </Button>
                      )}
                      {order.status === 'Ready for Delivery' && (
                        <Button variant="ghost" size="icon" title="Release for Delivery" onClick={() => updateStatus(order._id, 'Released for Delivery')}>
                          <Truck className="h-4 w-4 text-orange-600" />
                        </Button>
                      )}
                      {order.status === 'Released for Delivery' && (
                        <Button variant="ghost" size="icon" title="Mark Delivered" onClick={() => updateStatus(order._id, 'Delivered')}>
                          <CheckCircle className="h-4 w-4 text-green-600 fill-green-600/10" />
                        </Button>
                      )}

                      {/* Cancel Option (Available until Released) */}
                      {!['Released for Delivery', 'Delivered', 'Cancelled'].includes(order.status) && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Cancel Order" 
                          className="text-destructive/50 hover:text-destructive" 
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive" onClick={() => deleteOrder(order._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <OrderDetailsDialog 
        orderId={selectedOrderId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onUpdate={fetchOrders}
      />
    </div>
  );
}
