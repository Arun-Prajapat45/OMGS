import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { startOfMonth, subMonths, format } from 'date-fns';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const sixMonthsAgo = startOfMonth(subMonths(now, 5));

    // 1. KPI Metrics
    // Total Revenue (Only count DELIVERED or PAID, but let's count all non-cancelled for general 'Revenue' or maybe just total where status is not CANCELLED)
    const revenueAgg = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } }
    });
    const totalRevenue = revenueAgg._sum.total || 0;

    const totalOrders = await prisma.order.count({
      where: { status: { not: 'CANCELLED' } }
    });

    const totalUsers = await prisma.user.count();

    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: currentMonthStart } }
    });

    // 2. Order Status Counts
    const orderStatuses = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const statusCounts = {
      PENDING: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      CONFIRMED: 0,
      REFUNDED: 0,
    };
    orderStatuses.forEach((statusGroup) => {
      statusCounts[statusGroup.status] = statusGroup._count.status;
    });

    // 3. Monthly Revenue (Last 6 Months)
    const recentOrdersForChart = await prisma.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { not: 'CANCELLED' }
      },
      select: {
        total: true,
        createdAt: true,
      }
    });

    // Group by month
    const monthlyRevenueMap = {};
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthLabel = format(monthDate, 'MMM yyyy');
      monthlyRevenueMap[monthLabel] = 0;
    }

    recentOrdersForChart.forEach(order => {
      const monthLabel = format(order.createdAt, 'MMM yyyy');
      if (monthlyRevenueMap[monthLabel] !== undefined) {
        monthlyRevenueMap[monthLabel] += Number(order.total);
      }
    });

    const monthlyRevenue = Object.keys(monthlyRevenueMap).map(month => ({
      name: month,
      revenue: monthlyRevenueMap[month]
    }));

    // 4. Recent Orders (Latest 50)
    const recentOrders = await prisma.order.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    });

    // Format recent orders for frontend
    const formattedRecentOrders = recentOrders.map(order => {
      const productName = order.orderItems.length > 0 
        ? order.orderItems[0].product.name + (order.orderItems.length > 1 ? ` +${order.orderItems.length - 1} more` : '')
        : 'Unknown Product';

      return {
        id: order.orderNumber,
        customer: order.user?.name || order.user?.email || 'Guest',
        product: productName,
        amount: Number(order.total),
        status: order.status,
        paymentStatus: order.paymentStatus,
        date: format(order.createdAt, 'yyyy-MM-dd')
      };
    });

    return NextResponse.json({
      kpis: {
        totalRevenue,
        totalOrders,
        totalUsers,
        newUsersThisMonth
      },
      statusCounts,
      monthlyRevenue,
      recentOrders: formattedRecentOrders
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
