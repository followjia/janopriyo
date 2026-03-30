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
  Trash2 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';


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

  const filteredOrders = orders.filter((order) => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success(`Order status updated to ${status}`);
        fetchOrders();
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      toast.error('Error updating order status');
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

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
  };

  const openDetails = (id: string) => {
    setSelectedOrderId(id);
    setIsDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-none">Pending</Badge>;
      case 'Processing': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-none">Processing</Badge>;
      case 'Shipped': return <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-none">Shipped</Badge>;
      case 'Delivered': return <Badge variant="default" className="bg-green-100 text-green-800 border-none">Delivered</Badge>;
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
                        {format(new Date(order.createdAt), 'MMM dd, p')}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold">{order.user?.name || 'Guest User'}</span>
                      <span className="text-muted-foreground">{order.user?.email || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">${(order.totalAmount ?? 0).toFixed(2)}</TableCell>
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
                      
                      {/* Quick Actions */}
                      {order.status === 'Pending' && (
                        <Button variant="ghost" size="icon" title="Processing" onClick={() => updateStatus(order._id, 'Processing')}>
                          <Package className="h-4 w-4" />
                        </Button>
                      )}
                      {order.status === 'Processing' && (
                        <Button variant="ghost" size="icon" title="Shipped" onClick={() => updateStatus(order._id, 'Shipped')}>
                          <Truck className="h-4 w-4" />
                        </Button>
                      )}
                      {order.status === 'Shipped' && (
                        <Button variant="ghost" size="icon" title="Delivered" onClick={() => updateStatus(order._id, 'Delivered')}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteOrder(order._id)}>
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
