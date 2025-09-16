// Note: This component requires Recharts to be installed
// Run: npm install recharts
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Color palette for charts
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  indigo: '#6366F1',
  pink: '#EC4899',
  gray: '#6B7280'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.warning, COLORS.danger, COLORS.purple];

// Revenue Trend Chart
export const RevenueTrendChart = ({ data = [] }) => {
  // Generate sample data if no data provided
  const sampleData = data.length > 0 ? data : [
    { month: 'Jan', revenue: 4000, orders: 24 },
    { month: 'Feb', revenue: 3000, orders: 18 },
    { month: 'Mar', revenue: 5000, orders: 32 },
    { month: 'Apr', revenue: 4500, orders: 28 },
    { month: 'May', revenue: 6000, orders: 40 },
    { month: 'Jun', revenue: 5500, orders: 35 }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={sampleData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value, name) => [`₵${value}`, name === 'revenue' ? 'Revenue' : 'Orders']}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke={COLORS.primary} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Orders Status Chart
export const OrdersStatusChart = ({ data = [] }) => {
  // If data is an array (from API), use it directly, otherwise use the old format
  const chartData = Array.isArray(data) && data.length > 0 ? data.map(item => ({
    name: item.name,
    value: item.value,
    color: getStatusColor(item.name)
  })) : [
    { name: 'Pending', value: data.pending || 5, color: COLORS.warning },
    { name: 'Processing', value: data.processing || 8, color: COLORS.primary },
    { name: 'Shipped', value: data.shipped || 12, color: COLORS.indigo },
    { name: 'Delivered', value: data.delivered || data.completed || 15, color: COLORS.secondary },
    { name: 'Cancelled', value: data.cancelled || 2, color: COLORS.danger }
  ];

  function getStatusColor(status) {
    switch (status.toLowerCase()) {
      case 'pending': return COLORS.warning;
      case 'processing': return COLORS.primary;
      case 'shipped': return COLORS.indigo;
      case 'delivered': return COLORS.secondary;
      case 'cancelled': return COLORS.danger;
      default: return COLORS.gray;
    }
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value) => [`${value} orders`, 'Count']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color, fontSize: '12px' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// User Growth Chart
export const UserGrowthChart = ({ data = [] }) => {
  // If data is an array from API, use it directly, otherwise use sample data
  const sampleData = data.length > 0 ? data.map(item => ({
    month: item.month,
    users: item.totalUsers,
    active: item.activeUsers
  })) : [
    { month: 'Jan', users: 100, active: 85 },
    { month: 'Feb', users: 120, active: 102 },
    { month: 'Mar', users: 150, active: 128 },
    { month: 'Apr', users: 180, active: 155 },
    { month: 'May', users: 220, active: 190 },
    { month: 'Jun', users: 250, active: 215 }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sampleData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="users" 
            stroke={COLORS.primary} 
            strokeWidth={3}
            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
            name="Total Users"
          />
          <Line 
            type="monotone" 
            dataKey="active" 
            stroke={COLORS.secondary} 
            strokeWidth={3}
            dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 4 }}
            name="Active Users"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Products by Category Chart
export const ProductsCategoryChart = ({ data = [] }) => {
  // If data is an array from API, format it for the chart
  const sampleData = data.length > 0 ? data.map((item, index) => ({
    category: item.name,
    count: item.value,
    color: PIE_COLORS[index % PIE_COLORS.length]
  })) : [
    { category: 'Men', count: 45, color: COLORS.primary },
    { category: 'Women', count: 52, color: COLORS.secondary },
    { category: 'Kids', count: 28, color: COLORS.warning },
    { category: 'Accessories', count: 35, color: COLORS.purple },
    { category: 'Shoes', count: 42, color: COLORS.indigo }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Products by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sampleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="category" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value) => [`${value} products`, 'Count']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {sampleData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Compact Stat Card with Mini Chart
export const StatCardWithChart = ({ title, value, subtitle, icon, color = 'blue', trend = [], change, changeType = 'percentage', changeLabel = '' }) => {
  const trendData = trend.length > 0 ? trend : [
    { value: 20 }, { value: 25 }, { value: 22 }, { value: 30 }, { value: 28 }, { value: 35 }, { value: value }
  ];

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const formatChange = () => {
    if (change === undefined || change === null) return '';
    
    const prefix = isPositive ? '+' : isNegative ? '-' : '';
    const absValue = Math.abs(change);
    
    if (changeType === 'currency') {
      return `${prefix}₵${absValue.toLocaleString()}`;
    } else if (changeType === 'number') {
      return `${prefix}${absValue}`;
    } else {
      return `${prefix}${absValue}%`;
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-8 h-8 bg-${color}-500 rounded-md flex items-center justify-center`}>
              {icon}
            </div>
            <div className="ml-4">
              <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-base sm:text-lg font-semibold text-gray-900 truncate">{value}</dd>
              {subtitle && <dd className="text-xs sm:text-sm text-gray-500 truncate">{subtitle}</dd>}
            </div>
          </div>
          
          {/* Mini trend chart */}
          <div className="flex flex-col items-end">
            <div className="w-16 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={`var(--color-${color}-500)`}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {change !== undefined && change !== null && (
              <div className={`flex items-center text-xs ${
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
              }`}>
                <span className="flex items-center">
                  {isPositive ? '↗' : isNegative ? '↘' : '→'} {formatChange()}
                  {changeLabel && <span className="ml-1 text-gray-500">today</span>}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sales Performance Chart
export const SalesPerformanceChart = ({ data = [] }) => {
  const sampleData = data.length > 0 ? data : [
    { day: 'Mon', sales: 1200, visitors: 320 },
    { day: 'Tue', sales: 1900, visitors: 450 },
    { day: 'Wed', sales: 800, visitors: 280 },
    { day: 'Thu', sales: 1600, visitors: 380 },
    { day: 'Fri', sales: 2200, visitors: 520 },
    { day: 'Sat', sales: 2800, visitors: 680 },
    { day: 'Sun', sales: 2100, visitors: 580 }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sampleData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
          <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
          <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value, name) => [
              name === 'sales' ? `₵${value}` : `${value}`, 
              name === 'sales' ? 'Sales' : 'Visitors'
            ]}
          />
          <Legend />
          <Bar 
            yAxisId="left" 
            dataKey="sales" 
            fill={COLORS.primary} 
            name="Sales"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            yAxisId="right" 
            dataKey="visitors" 
            fill={COLORS.secondary} 
            name="Visitors"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
