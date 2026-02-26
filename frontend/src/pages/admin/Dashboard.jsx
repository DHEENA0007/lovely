import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, ShoppingBag, Users, TrendingUp,
    DollarSign, Eye, Clock, CheckCircle,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { orderAPI, productAPI, authAPI } from '../../api';
import Loading from '../../components/Loading';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, ordersRes] = await Promise.all([
                orderAPI.getStats(),
                orderAPI.getAll({ limit: 5 })
            ]);
            setStats(statsRes.data);
            setRecentOrders(ordersRes.data.orders);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    const statCards = [
        {
            title: 'Total Revenue',
            value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-500',
            iconBg: '#f0fdf4',
            iconColor: '#16a34a',
            change: '+12.5%',
            up: true
        },
        {
            title: 'Total Orders',
            value: stats?.totalOrders || 0,
            icon: ShoppingBag,
            color: 'from-blue-500 to-indigo-500',
            iconBg: '#eff6ff',
            iconColor: '#2563eb',
            change: '+8.2%',
            up: true
        },
        {
            title: 'Pending Orders',
            value: stats?.pendingOrders || 0,
            icon: Clock,
            color: 'from-orange-500 to-amber-500',
            iconBg: '#fff7ed',
            iconColor: '#ea580c',
            change: '-3.1%',
            up: false
        },
        {
            title: 'Delivered',
            value: stats?.deliveredOrders || 0,
            icon: CheckCircle,
            color: 'from-purple-500 to-violet-500',
            iconBg: '#f5f0ff',
            iconColor: '#7c3aed',
            change: '+15.3%',
            up: true
        }
    ];

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-orange-100 text-orange-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#2a241c' }}>Dashboard</h1>
                <p style={{ color: '#9a8e7f' }}>Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, i) => (
                    <div key={i} className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: stat.iconBg }}>
                                <stat.icon className="w-6 h-6" style={{ color: stat.iconColor }} />
                            </div>
                            <span className={`flex items-center gap-1 text-sm font-medium ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
                                {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold mb-1" style={{ color: '#2a241c' }}>{stat.value}</p>
                        <p className="text-sm" style={{ color: '#9a8e7f' }}>{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Recent Orders & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid #ede5d8' }}>
                            <h2 className="font-semibold text-lg" style={{ color: '#2a241c' }}>Recent Orders</h2>
                            <Link to="/admin/orders" className="text-sm font-medium" style={{ color: '#c8a24e' }}>
                                View All
                            </Link>
                        </div>
                        <div>
                            {recentOrders.map((order) => (
                                <Link
                                    key={order._id}
                                    to={`/admin/orders/${order._id}`}
                                    className="flex items-center justify-between p-4 transition-colors"
                                    style={{ borderBottom: '1px solid #f5f0e8' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#faf8f4'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full gradient-aurora flex items-center justify-center text-sm font-semibold" style={{ color: '#fff' }}>
                                            {order.user?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium" style={{ color: '#2a241c' }}>{order.orderNumber}</p>
                                            <p className="text-sm" style={{ color: '#9a8e7f' }}>{order.user?.name || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium" style={{ color: '#2a241c' }}>₹{order.totalPrice.toLocaleString()}</p>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                            {recentOrders.length === 0 && (
                                <p className="p-6 text-center" style={{ color: '#9a8e7f' }}>No orders yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h2 className="font-semibold text-lg mb-4" style={{ color: '#2a241c' }}>Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                to="/admin/products/new"
                                className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#faf8f4'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#fef7ed' }}>
                                    <Package className="w-5 h-5" style={{ color: '#c8a24e' }} />
                                </div>
                                <div>
                                    <p className="font-medium" style={{ color: '#2a241c' }}>Add Product</p>
                                    <p className="text-xs" style={{ color: '#9a8e7f' }}>Create a new product</p>
                                </div>
                            </Link>
                            <Link
                                to="/admin/categories"
                                className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#faf8f4'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#eff6ff' }}>
                                    <TrendingUp className="w-5 h-5" style={{ color: '#2563eb' }} />
                                </div>
                                <div>
                                    <p className="font-medium" style={{ color: '#2a241c' }}>Manage Categories</p>
                                    <p className="text-xs" style={{ color: '#9a8e7f' }}>Edit categories</p>
                                </div>
                            </Link>
                            <Link
                                to="/admin/orders"
                                className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#faf8f4'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#fff7ed' }}>
                                    <ShoppingBag className="w-5 h-5" style={{ color: '#ea580c' }} />
                                </div>
                                <div>
                                    <p className="font-medium" style={{ color: '#2a241c' }}>Process Orders</p>
                                    <p className="text-xs" style={{ color: '#9a8e7f' }}>
                                        {stats?.pendingOrders || 0} pending
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Order Status Summary */}
                    <div className="card p-6">
                        <h2 className="font-semibold text-lg mb-4" style={{ color: '#2a241c' }}>Order Status</h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Pending', value: stats?.pendingOrders || 0, color: '#eab308' },
                                { label: 'Processing', value: stats?.processingOrders || 0, color: '#ea580c' },
                                { label: 'Shipped', value: stats?.shippedOrders || 0, color: '#6366f1' },
                                { label: 'Delivered', value: stats?.deliveredOrders || 0, color: '#16a34a' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                        <span style={{ color: '#6d6051' }}>{item.label}</span>
                                    </div>
                                    <span className="font-semibold" style={{ color: '#2a241c' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
