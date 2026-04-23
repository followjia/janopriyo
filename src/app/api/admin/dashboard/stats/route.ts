import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // 1 & 2. Total Revenue and Sales Count (Delivered Orders)
    const revenueStats = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          salesCount: { $sum: 1 }
        }
      }
    ]);
    const { totalRevenue = 0, salesCount = 0 } = revenueStats[0] || {};

    // 3. Total Users
    const totalUsers = await User.countDocuments();

    // 4. Pending Orders
    const pendingOrdersCount = await Order.countDocuments({ status: 'Order Placed' });

    // 5. Recent Orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('slug totalAmount status createdAt')
      .populate('user', 'name email');

    // 6. Low Stock Products
    const lowStockProducts = await Product.find({ stock: { $lt: 5 } })
      .limit(5)
      .select('name stock price');

    // 7. Loyalty Stats
    const activeSubscribers = await User.countDocuments({ isSubscriptionActive: true });
    const totalWalletBalanceResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$walletBalance' } } }
    ]);
    const totalWalletTokens = totalWalletBalanceResult[0]?.total || 0;

    // 8. Chart Data (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const chartData = await Order.aggregate([
      {
        $match: {
          status: 'Delivered',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: {
                  if: { $lt: ['$_id.month', 10] },
                  then: { $concat: ['0', { $toString: '$_id.month' }] },
                  else: { $toString: '$_id.month' }
                }
              },
              '-01'
            ]
          },
          revenue: 1,
          orders: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    return NextResponse.json({
      stats: {
        totalRevenue,
        salesCount,
        totalUsers,
        pendingOrdersCount,
        activeSubscribers,
        totalWalletTokens
      },
      recentOrders,
      lowStockProducts,
      chartData
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
