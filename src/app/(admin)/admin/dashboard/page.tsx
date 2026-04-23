'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  DollarSign, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  Clock, 
  Wallet,
  ArrowRight,
  Loader2,
  TrendingUp,
  LineChart as LineChartIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CartesianGrid, Line, LineChart, XAxis, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("revenue");

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      if (response.ok) {
        const stats = await response.json();
        setData(stats);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || `Failed to fetch: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const total = useMemo(() => {
    if (!data?.chartData) return { revenue: 0, orders: 0 };
    return {
      revenue: data.chartData.reduce((acc: number, curr: any) => acc + curr.revenue, 0),
      orders: data.chartData.reduce((acc: number, curr: any) => acc + curr.orders, 0),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-8 w-8" />
          <h3 className="text-xl font-bold">Dashboard Error</h3>
        </div>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => fetchStats()}>Retry</Button>
      </div>
    );
  }

  const { stats, recentOrders, lowStockProducts, chartData } = data || {};

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastUpdated || 'Never'}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{stats?.totalRevenue?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.salesCount}</div>
            <p className="text-xs text-muted-foreground">Delivered orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingOrdersCount}</div>
            <p className="text-xs text-muted-foreground">Need fulfillment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Interactive Chart */}
        <Card className="col-span-4 lg:col-span-4">
          <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle>Sales & Analytics</CardTitle>
              <CardDescription>
                Showing performance for the last 6 months
              </CardDescription>
            </div>
            <div className="flex">
              {(["revenue", "orders"] as const).map((key) => (
                <button
                  key={key}
                  data-active={activeChart === key}
                  className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                  onClick={() => setActiveChart(key)}
                >
                  <span className="text-xs text-muted-foreground">
                    {chartConfig[key].label}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-2xl">
                    {key === "revenue" ? "৳" : ""}{total[key].toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[300px] w-full"
            >
              <LineChart
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                    })
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      }}
                    />
                  }
                />
                <Line
                  dataKey={activeChart}
                  type="monotone"
                  stroke={activeChart === "revenue" ? "hsl(var(--primary))" : "hsl(var(--chart-2))"}
                  strokeWidth={3}
                  dot={{ r: 4, fill: activeChart === "revenue" ? "hsl(var(--primary))" : "hsl(var(--chart-2))" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Loyalty & Low Stock */}
        <div className="col-span-3 space-y-4">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Loyalty Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs opacity-70">Active Members</p>
                  <p className="text-xl font-bold">{stats?.activeSubscribers}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs opacity-70">Circulating Tokens</p>
                  <div className="flex items-center gap-1">
                    <Wallet className="h-4 w-4" />
                    <p className="text-xl font-bold">৳{stats?.totalWalletTokens}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts?.map((product: any) => (
                  <div key={product._id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">৳{product.price}</p>
                    </div>
                    <Badge variant="destructive" className="h-5">
                      {product.stock} Left
                    </Badge>
                  </div>
                ))}
                {(lowStockProducts?.length ?? 0) === 0 && (
                  <p className="text-center py-4 text-sm text-muted-foreground">
                    All products are well stocked!
                  </p>
                )}
                {(lowStockProducts?.length ?? 0) > 0 && (
                  <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                    <Link href="/admin/products" className="text-xs">
                      Manage Stock <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Orders Bottom Row */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>You have {stats?.pendingOrdersCount} pending orders to review.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentOrders?.map((order: any) => (
              <div key={order._id} className="flex items-center justify-between border p-4 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">#{order.slug}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.user?.name || 'Guest'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm font-bold text-primary">৳{order.totalAmount}</div>
                  <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          {recentOrders?.length === 0 && (
            <p className="text-center py-10 text-muted-foreground italic">No recent orders yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
