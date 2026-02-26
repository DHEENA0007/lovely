import { useState, useEffect } from 'react';
import { Search, Eye, ChevronDown, ChevronLeft, ChevronRight, Package, Truck, CheckCircle, XCircle, Clock, CreditCard, IndianRupee, ShoppingBag, Filter } from 'lucide-react';
import { orderAPI } from '../../api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [search, status, page]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (status) params.status = status;

            const { data } = await orderAPI.getAll(params);
            setOrders(data.orders);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await orderAPI.updateStatus(orderId, { status: newStatus });
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            toast.success('Order status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: Clock,
            confirmed: Package,
            processing: Package,
            shipped: Truck,
            delivered: CheckCircle,
            cancelled: XCircle
        };
        return icons[status] || Clock;
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending: { bg: '#fef9e7', color: '#b8860b', border: '#f0e3a1' },
            confirmed: { bg: '#eef4ff', color: '#3b6fe0', border: '#c7d9f7' },
            processing: { bg: '#fff5eb', color: '#d48825', border: '#f5dbb8' },
            shipped: { bg: '#eef0ff', color: '#5b5fc7', border: '#c7c9f0' },
            delivered: { bg: '#edf9f0', color: '#2d9f6f', border: '#b3e6c8' },
            cancelled: { bg: '#fdf0f0', color: '#c54040', border: '#f0baba' }
        };
        return styles[status] || styles.pending;
    };

    const getPaymentBadge = (order) => {
        if (order.paymentMethod === 'phonepe') {
            return {
                label: order.isPaid ? 'Paid (PhonePe)' : 'Pending (PhonePe)',
                style: order.isPaid
                    ? { bg: '#edf9f0', color: '#2d9f6f', border: '#b3e6c8' }
                    : { bg: '#fef9e7', color: '#b8860b', border: '#f0e3a1' }
            };
        }
        return {
            label: order.isPaid ? 'Paid (COD)' : 'COD - Unpaid',
            style: order.isPaid
                ? { bg: '#edf9f0', color: '#2d9f6f', border: '#b3e6c8' }
                : { bg: '#fff5eb', color: '#d48825', border: '#f5dbb8' }
        };
    };

    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    // Calculate summary stats from current orders
    const totalRevenue = orders.reduce((sum, o) => sum + (o.isPaid ? o.totalPrice : 0), 0);
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const shippedCount = orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length;

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#2a241c' }}>Orders</h1>
                <p style={{ color: '#9a8e7f' }}>Manage and track all customer orders</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f5f0e8' }}>
                            <ShoppingBag className="w-5 h-5" style={{ color: '#c8a24e' }} />
                        </div>
                        <div>
                            <p className="text-xl font-bold" style={{ color: '#2a241c' }}>{orders.length}</p>
                            <p className="text-xs" style={{ color: '#9a8e7f' }}>Total Orders</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#edf9f0' }}>
                            <IndianRupee className="w-5 h-5" style={{ color: '#2d9f6f' }} />
                        </div>
                        <div>
                            <p className="text-xl font-bold" style={{ color: '#2a241c' }}>₹{totalRevenue.toLocaleString()}</p>
                            <p className="text-xs" style={{ color: '#9a8e7f' }}>Revenue (Paid)</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#fef9e7' }}>
                            <Clock className="w-5 h-5" style={{ color: '#b8860b' }} />
                        </div>
                        <div>
                            <p className="text-xl font-bold" style={{ color: '#2a241c' }}>{pendingCount}</p>
                            <p className="text-xs" style={{ color: '#9a8e7f' }}>Pending</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#eef4ff' }}>
                            <Truck className="w-5 h-5" style={{ color: '#3b6fe0' }} />
                        </div>
                        <div>
                            <p className="text-xl font-bold" style={{ color: '#2a241c' }}>{shippedCount}</p>
                            <p className="text-xs" style={{ color: '#9a8e7f' }}>Shipped/Delivered</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl p-4 mb-6" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9a8e7f' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search by order #, customer name..."
                                className="w-full pl-12 pr-4 py-3 rounded-lg text-sm outline-none"
                                style={{ background: '#faf8f4', border: '1px solid #ede5d8', color: '#2a241c' }}
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9a8e7f' }} />
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            className="pl-9 pr-8 py-3 rounded-lg text-sm outline-none appearance-none cursor-pointer"
                            style={{ background: '#faf8f4', border: '1px solid #ede5d8', color: '#2a241c', minWidth: '160px' }}
                        >
                            <option value="">All Status</option>
                            {statuses.map((s) => (
                                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9a8e7f' }} />
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading ? (
                    <Loading />
                ) : orders.length > 0 ? (
                    orders.map((order) => {
                        const StatusIcon = getStatusIcon(order.status);
                        const statusStyle = getStatusStyle(order.status);
                        const payment = getPaymentBadge(order);
                        const isExpanded = expandedOrder === order._id;

                        return (
                            <div
                                key={order._id}
                                className="rounded-xl overflow-hidden transition-all duration-200"
                                style={{ background: '#fff', border: '1px solid #ede5d8', boxShadow: isExpanded ? '0 4px 20px rgba(42,36,28,0.08)' : 'none' }}
                            >
                                {/* Main Row */}
                                <div className="p-5">
                                    <div className="flex flex-wrap gap-4 items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div
                                                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: statusStyle.bg, border: `1px solid ${statusStyle.border}` }}
                                            >
                                                <StatusIcon className="w-5 h-5" style={{ color: statusStyle.color }} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                    <h3 className="font-bold text-sm" style={{ color: '#2a241c' }}>{order.orderNumber}</h3>
                                                    <span
                                                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                                                        style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
                                                    >
                                                        {order.status}
                                                    </span>
                                                    <span
                                                        className="px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                                                        style={{ background: payment.style.bg, color: payment.style.color, border: `1px solid ${payment.style.border}` }}
                                                    >
                                                        <CreditCard className="w-3 h-3" />
                                                        {payment.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm" style={{ color: '#6d6051' }}>
                                                    {order.user?.name || 'Unknown'} • {order.user?.email || ''}
                                                </p>
                                                <p className="text-xs mt-1" style={{ color: '#9a8e7f' }}>
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="font-bold text-lg" style={{ color: '#2a241c' }}>₹{order.totalPrice?.toLocaleString()}</p>
                                                <p className="text-xs" style={{ color: '#9a8e7f' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                                            </div>

                                            <div className="relative">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order._id, e.target.value)}
                                                    className="pl-3 pr-7 py-2 rounded-lg text-xs font-medium appearance-none cursor-pointer outline-none"
                                                    style={{ background: '#faf8f4', border: '1px solid #ede5d8', color: '#2a241c' }}
                                                >
                                                    {statuses.map((s) => (
                                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: '#9a8e7f' }} />
                                            </div>

                                            <button
                                                onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                                className="p-2 rounded-lg transition-colors"
                                                style={{ background: isExpanded ? '#f5f0e8' : 'transparent', color: '#6d6051' }}
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Product Thumbnails */}
                                    <div className="mt-3 flex gap-2 overflow-x-auto">
                                        {order.items?.slice(0, 5).map((item, i) => (
                                            <div key={i} className="flex-shrink-0">
                                                <img
                                                    src={item.image || '/placeholder.jpg'}
                                                    alt={item.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                    style={{ border: '1px solid #ede5d8' }}
                                                />
                                            </div>
                                        ))}
                                        {order.items?.length > 5 && (
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium" style={{ background: '#f5f0e8', color: '#9a8e7f', border: '1px solid #ede5d8' }}>
                                                +{order.items.length - 5}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div style={{ borderTop: '1px solid #ede5d8', background: '#faf8f4' }}>
                                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Order Items */}
                                            <div>
                                                <h4 className="font-semibold text-sm mb-3" style={{ color: '#2a241c' }}>Order Items</h4>
                                                <div className="space-y-3">
                                                    {order.items?.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                                                            <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-14 h-14 rounded-lg object-cover" style={{ border: '1px solid #ede5d8' }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate" style={{ color: '#2a241c' }}>{item.name}</p>
                                                                <p className="text-xs" style={{ color: '#9a8e7f' }}>Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                                                                {item.customization?.text?.enabled && (
                                                                    <p className="text-xs mt-1" style={{ color: '#c8a24e' }}>✏️ Text: "{item.customization.text.content}"</p>
                                                                )}
                                                                {item.customization?.variant?.value && (
                                                                    <p className="text-xs" style={{ color: '#3b6fe0' }}>🎨 {item.customization.variant.type}: {item.customization.variant.value}</p>
                                                                )}
                                                            </div>
                                                            <p className="font-semibold text-sm" style={{ color: '#2a241c' }}>₹{item.itemTotal?.toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Shipping & Price Breakdown */}
                                            <div className="space-y-4">
                                                {/* Shipping Address */}
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-3" style={{ color: '#2a241c' }}>Shipping Address</h4>
                                                    <div className="p-4 rounded-lg" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                                                        <p className="font-medium text-sm" style={{ color: '#2a241c' }}>{order.shippingAddress?.name}</p>
                                                        <p className="text-sm" style={{ color: '#6d6051' }}>{order.shippingAddress?.phone}</p>
                                                        <p className="text-sm mt-1" style={{ color: '#6d6051' }}>
                                                            {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Price Breakdown */}
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-3" style={{ color: '#2a241c' }}>Price Breakdown</h4>
                                                    <div className="p-4 rounded-lg space-y-2" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                                                        <div className="flex justify-between text-sm">
                                                            <span style={{ color: '#6d6051' }}>Items Total</span>
                                                            <span style={{ color: '#2a241c' }}>₹{order.itemsPrice?.toLocaleString()}</span>
                                                        </div>
                                                        {order.customizationPrice > 0 && (
                                                            <div className="flex justify-between text-sm">
                                                                <span style={{ color: '#6d6051' }}>Customization</span>
                                                                <span style={{ color: '#2a241c' }}>₹{order.customizationPrice?.toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between text-sm">
                                                            <span style={{ color: '#6d6051' }}>Shipping</span>
                                                            <span style={{ color: order.shippingPrice === 0 ? '#2d9f6f' : '#2a241c' }}>
                                                                {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice?.toLocaleString()}`}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span style={{ color: '#6d6051' }}>Tax (GST)</span>
                                                            <span style={{ color: '#2a241c' }}>₹{order.taxPrice?.toLocaleString()}</span>
                                                        </div>
                                                        {order.discountAmount > 0 && (
                                                            <div className="flex justify-between text-sm">
                                                                <span style={{ color: '#2d9f6f' }}>Discount</span>
                                                                <span style={{ color: '#2d9f6f' }}>-₹{order.discountAmount?.toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {order.isGiftWrapped && (
                                                            <div className="flex justify-between text-sm">
                                                                <span style={{ color: '#6d6051' }}>Gift Wrap 🎁</span>
                                                                <span style={{ color: '#2a241c' }}>₹{order.giftWrapPrice?.toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between font-bold pt-2 text-sm" style={{ borderTop: '1px solid #ede5d8' }}>
                                                            <span style={{ color: '#2a241c' }}>Total</span>
                                                            <span style={{ color: '#c8a24e' }}>₹{order.totalPrice?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Gift Message */}
                                                {order.giftMessage && (
                                                    <div>
                                                        <h4 className="font-semibold text-sm mb-2" style={{ color: '#2a241c' }}>Gift Message</h4>
                                                        <div className="p-3 rounded-lg text-sm italic" style={{ background: '#fff', border: '1px solid #ede5d8', color: '#6d6051' }}>
                                                            "{order.giftMessage}"
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-xl p-12 text-center" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                        <ShoppingBag className="w-12 h-12 mx-auto mb-4" style={{ color: '#d4c4a8' }} />
                        <p style={{ color: '#9a8e7f' }}>No orders found</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-4">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg transition-colors disabled:opacity-30"
                            style={{ background: '#fff', border: '1px solid #ede5d8', color: '#2a241c' }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className="w-10 h-10 rounded-lg text-sm font-medium transition-all"
                                style={page === i + 1
                                    ? { background: 'linear-gradient(135deg, #c8a24e, #b8860b)', color: '#fff' }
                                    : { background: '#fff', border: '1px solid #ede5d8', color: '#6d6051' }
                                }
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg transition-colors disabled:opacity-30"
                            style={{ background: '#fff', border: '1px solid #ede5d8', color: '#2a241c' }}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
