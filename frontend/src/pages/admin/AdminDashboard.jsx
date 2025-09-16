import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import adminApi from '../../services/adminApi';
import {
  RevenueTrendChart,
  OrdersStatusChart,
  UserGrowthChart,
  ProductsCategoryChart,
  StatCardWithChart,
  SalesPerformanceChart
} from '../../components/admin/Charts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0 },
    products: { total: 0, active: 0 },
    orders: { total: 0, pending: 0, completed: 0, processing: 0, shipped: 0, cancelled: 0 },
    revenue: { total: 0, thisMonth: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState({
    revenue: [],
    userGrowth: [],
    productsCategory: [],
    orderStatus: [],
    salesPerformance: []
  });
  const [analytics, setAnalytics] = useState({
    users: { changes: {} },
    products: { changes: {} },
    orders: { changes: {} }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics and analytics
      const [userStats, orderStats, userAnalytics, orderAnalytics, productAnalytics, chartDataResponse] = await Promise.all([
        adminApi.users.getUserStats().catch(() => ({ totalUsers: 0, activeUsers: 0 })),
        adminApi.orders.getOrderStats().catch(() => ({ totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalRevenue: 0, monthlyRevenue: 0 })),
        adminApi.users.getUserAnalytics().catch(() => ({ changes: {} })),
        adminApi.orders.getOrderAnalytics().catch(() => ({ changes: {} })),
        adminApi.products.getProductAnalytics().catch(() => ({ changes: {} })),
        adminApi.orders.getChartData().catch(() => ({ revenue: [], orderStatus: [], userGrowth: [], productCategory: [] }))
      ]);

      // Fetch recent orders
      const ordersData = await adminApi.orders.getAllOrders({ limit: 5, sortBy: 'newest' }).catch(() => ({ orders: [] }));

      setStats({
        users: {
          total: userStats.totalUsers || 0,
          active: userStats.activeUsers || 0
        },
        products: {
          total: productAnalytics.current?.totalProducts || 0,
          active: productAnalytics.current?.activeProducts || 0
        },
        orders: {
          total: orderStats.totalOrders || 0,
          pending: orderStats.pendingOrders || 0,
          completed: orderStats.completedOrders || 0
        },
        revenue: {
          total: orderStats.totalRevenue || 0,
          thisMonth: orderStats.monthlyRevenue || 0
        }
      });

      setAnalytics({
        users: userAnalytics,
        products: productAnalytics,
        orders: orderAnalytics
      });

      setChartData({
        revenue: chartDataResponse.revenue || [],
        userGrowth: chartDataResponse.userGrowth || [],
        productsCategory: chartDataResponse.productCategory || [],
        orderStatus: chartDataResponse.orderStatus || [],
        salesPerformance: chartDataResponse.revenue || [] // Use revenue data for sales performance
      });

      setRecentOrders(ordersData.orders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Enhanced Stats Grid with Mini Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCardWithChart
            title="Total Users"
            value={stats.users.total}
            subtitle={`${stats.users.active} active`}
            color="blue"
            change={analytics.users.dailyChanges?.totalUsers || 0}
            changeType="number"
            changeLabel="users today"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
          />

          <StatCardWithChart
            title="Total Products"
            value={stats.products.total}
            subtitle={`${stats.products.active} active`}
            color="green"
            change={analytics.products.dailyChanges?.totalProducts || 0}
            changeType="number"
            changeLabel="products today"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />

          <StatCardWithChart
            title="Total Orders"
            value={stats.orders.total}
            subtitle={`${stats.orders.pending} pending`}
            color="yellow"
            change={analytics.orders.dailyChanges?.orders || 0}
            changeType="number"
            changeLabel="orders today"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />

          <StatCardWithChart
            title="Revenue"
            value={`₵${stats.revenue.total.toLocaleString()}`}
            subtitle={`₵${stats.revenue.thisMonth.toLocaleString()} this month`}
            color="purple"
            change={analytics.orders.dailyChanges?.revenue || 0}
            changeType="currency"
            changeLabel="revenue today"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <RevenueTrendChart data={chartData.revenue} />
          <OrdersStatusChart data={chartData.orderStatus} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <UserGrowthChart data={chartData.userGrowth} />
          <ProductsCategoryChart data={chartData.productsCategory} />
        </div>

        <SalesPerformanceChart data={chartData.salesPerformance} />

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <div key={order._id} className="p-4 hover:bg-gray-50">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Order ID:</span>
                        <span className="text-sm font-medium text-gray-900">#{order._id?.slice(-8)}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Customer:</span>
                        <span className="text-sm text-gray-900 text-right ml-4 flex-1">{order.user?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total:</span>
                        <span className="text-sm text-gray-900">₵{order.totalPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date:</span>
                        <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No recent orders found
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order._id?.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₵{order.totalPrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

    
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
