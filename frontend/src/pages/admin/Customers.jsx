import { useState, useEffect } from 'react';
import { Search, Users, Mail, ShoppingBag, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { authAPI } from '../../api';
import Loading from '../../components/Loading';

const Customers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        fetchUsers();
    }, [search, page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (search) params.search = search;

            const { data } = await authAPI.getUsers(params);
            setUsers(data.users || data);
            setTotalPages(data.pages || 1);
            setTotalUsers(data.total || (data.users || data).length);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#2a241c' }}>Customers</h1>
                <p style={{ color: '#9a8e7f' }}>Manage your customer accounts</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f5f0e8' }}>
                            <Users className="w-5 h-5" style={{ color: '#c8a24e' }} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold" style={{ color: '#2a241c' }}>{totalUsers}</p>
                            <p className="text-xs" style={{ color: '#9a8e7f' }}>Total Customers</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f0f9f4' }}>
                            <ShoppingBag className="w-5 h-5" style={{ color: '#2d9f6f' }} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold" style={{ color: '#2a241c' }}>Active</p>
                            <p className="text-xs" style={{ color: '#9a8e7f' }}>Status</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#eff6ff' }}>
                            <Mail className="w-5 h-5" style={{ color: '#3b82f6' }} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold" style={{ color: '#2a241c' }}>Registered</p>
                            <p className="text-xs" style={{ color: '#9a8e7f' }}>Accounts</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="rounded-xl p-4 mb-6" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9a8e7f' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-3 rounded-lg text-sm outline-none"
                        style={{ background: '#faf8f4', border: '1px solid #ede5d8', color: '#2a241c' }}
                    />
                </div>
            </div>

            {/* Customer List */}
            {loading ? (
                <Loading />
            ) : users.length > 0 ? (
                <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase" style={{ background: '#faf8f4', color: '#9a8e7f', borderBottom: '1px solid #ede5d8' }}>
                        <div className="col-span-4">Customer</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-2">Phone</div>
                        <div className="col-span-3">Joined</div>
                    </div>

                    {/* Table Rows */}
                    {users.map((user) => (
                        <div
                            key={user._id}
                            className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-[#faf8f4] transition-colors"
                            style={{ borderBottom: '1px solid #f5f0e8' }}
                        >
                            <div className="col-span-4 flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #c8a24e, #b8860b)', color: '#fff' }}
                                >
                                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm" style={{ color: '#2a241c' }}>{user.name}</p>
                                    <p className="text-xs md:hidden" style={{ color: '#9a8e7f' }}>{user.email}</p>
                                </div>
                            </div>
                            <div className="col-span-3 hidden md:block">
                                <p className="text-sm" style={{ color: '#6d6051' }}>{user.email}</p>
                            </div>
                            <div className="col-span-2 hidden md:block">
                                <p className="text-sm" style={{ color: '#6d6051' }}>{user.phone || '—'}</p>
                            </div>
                            <div className="col-span-3 hidden md:flex items-center gap-2">
                                <Calendar className="w-4 h-4" style={{ color: '#9a8e7f' }} />
                                <p className="text-sm" style={{ color: '#6d6051' }}>
                                    {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl p-12 text-center" style={{ background: '#fff', border: '1px solid #ede5d8' }}>
                    <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#d4c4a8' }} />
                    <p style={{ color: '#9a8e7f' }}>No customers found</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
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
    );
};

export default Customers;
