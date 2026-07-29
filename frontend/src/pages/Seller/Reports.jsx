import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const SellerReports = () => {
  const navigate = useNavigate();
  const [kpis, setKPIs] = useState({
    total_sales: 0,
    completed_orders: 0,
    active_products: 0,
    pending_orders: 0,
    monthly_revenue: 0,
  });
  const [salesTrends, setSalesTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch all data in parallel
      const [kpisResponse, trendsResponse, topProductsResponse, lowStockResponse] = await Promise.all([
        api.get('/seller/reports/kpis', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        api.get('/seller/reports/sales-trends?period=daily', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        api.get('/seller/reports/top-products?limit=10', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        api.get('/seller/reports/low-stock?threshold=5', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
      ]);

      console.log('KPIs Response:', kpisResponse.data);
      console.log('Trends Response:', trendsResponse.data);
      console.log('Top Products Response:', topProductsResponse.data);
      console.log('Low Stock Response:', lowStockResponse.data);

      setKPIs(kpisResponse.data);
      setSalesTrends(trendsResponse.data || []);
      setTopProducts(topProductsResponse.data || []);
      setLowStock(lowStockResponse.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('فشل في جلب بيانات التقارير');
      setLoading(false);
    }
  };

  const handlePeriodChange = async (newPeriod) => {
    try {
      setPeriod(newPeriod);
      const token = localStorage.getItem('token');
      const response = await api.get(`/seller/reports/sales-trends?period=${newPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSalesTrends(response.data);
    } catch (err) {
      console.error('Error fetching sales trends:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
  };

  // Simple SVG Line Chart Component
  const LineChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    console.log('LineChart Data:', data);

    const maxValue = Math.max(...data.map(d => d.total || 0));
    const minValue = Math.min(...data.map(d => d.total || 0));
    const range = maxValue - minValue || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.total - minValue) / range) * 80 - 10;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          points={points}
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((d.total - minValue) / range) * 80 - 10;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill="#f59e0b"
            />
          );
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">التقارير والإحصائيات</h1>
          <p className="text-gray-600">نظرة شاملة على أداء متجرك</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.total_sales || 0)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">الطلبات المكتملة</p>
                <p className="text-2xl font-bold text-gray-900">{kpis.completed_orders || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">المنتجات النشطة</p>
                <p className="text-2xl font-bold text-gray-900">{kpis.active_products || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <CubeIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إيراد هذا الشهر</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.monthly_revenue || 0)}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <ArrowTrendingUpIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Trends Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-900">المبيعات بمرور الوقت</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handlePeriodChange('daily')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'daily'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                يومي
              </button>
              <button
                onClick={() => handlePeriodChange('weekly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'weekly'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                أسبوعي
              </button>
              <button
                onClick={() => handlePeriodChange('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'monthly'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                شهري
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-80">
            {salesTrends.length > 0 ? (
              <LineChart data={salesTrends} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                لا توجد بيانات
              </div>
            )}
          </div>

          {salesTrends.length > 0 && (
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
              {salesTrends.map((trend, index) => (
                <div key={index} className="flex-shrink-0 text-center">
                  <p className="text-xs text-gray-500">{formatDate(trend.date)}</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(trend.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Selling Products */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-amber-600" />
              المنتجات الأكثر مبيعاً
            </h2>

            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.product_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-amber-600">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {product.total_quantity || 0} قطعة • {formatCurrency(product.total_revenue || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">لا توجد بيانات</div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              تنبيهات المخزون
            </h2>

            {lowStock.length > 0 ? (
              <div className="space-y-3">
                {lowStock.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        الكمية: {product.stock || 0} • {formatCurrency(product.price || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">لا توجد تنبيهات</div>
            )}
          </div>
        </div>

        {/* Pending Orders Alert */}
        {kpis.pending_orders > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <ShoppingBagIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">لديك {kpis.pending_orders || 0} طلب معلق</h3>
                <p className="text-sm text-gray-600">قم بمراجعة الطلبات المعلقة وتأكيد الشحن</p>
              </div>
              <button
                onClick={() => navigate('/seller/orders')}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                مراجعة الطلبات
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerReports;
