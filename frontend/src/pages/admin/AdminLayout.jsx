import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingBag, Users,
    FolderOpen, Settings, LogOut, Gift, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/products', icon: Package, label: 'Products' },
        { to: '/admin/categories', icon: FolderOpen, label: 'Categories' },
        { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
        { to: '/admin/customers', icon: Users, label: 'Customers' },
    ];

    return (
        <div className="min-h-screen flex" style={{ background: '#faf8f4' }}>
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />

            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 z-40" style={{ background: '#fffdf7', borderRight: '1px solid #ede5d8', boxShadow: '2px 0 20px rgba(200,162,78,0.06)' }}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6" style={{ borderBottom: '1px solid #ede5d8' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-aurora flex items-center justify-center shadow-md">
                                <Gift className="w-5 h-5" style={{ color: '#fff' }} />
                            </div>
                            <div>
                                <span className="font-display text-xl font-bold gradient-text">Lovely</span>
                                <p className="text-xs" style={{ color: '#9a8e7f' }}>Admin Portal</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                    ${isActive ? 'shadow-md' : ''}
                                `}
                                style={({ isActive }) => isActive
                                    ? { background: 'linear-gradient(135deg, #c8a24e, #b8860b, #daa520)', color: '#ffffff' }
                                    : { color: '#6d6051' }
                                }
                                onMouseEnter={(e) => {
                                    if (!e.currentTarget.classList.contains('shadow-md')) {
                                        e.currentTarget.style.background = '#f5f0e8';
                                        e.currentTarget.style.color = '#4a3f33';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!e.currentTarget.classList.contains('shadow-md')) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#6d6051';
                                    }
                                }}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* User & Logout */}
                    <div className="p-4" style={{ borderTop: '1px solid #ede5d8' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full gradient-aurora flex items-center justify-center font-semibold shadow-sm" style={{ color: '#fff' }}>
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate" style={{ color: '#2a241c' }}>{user?.name}</p>
                                <p className="text-xs truncate" style={{ color: '#9a8e7f' }}>{user?.email}</p>
                            </div>
                        </div>

                        <NavLink
                            to="/"
                            className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all mb-2"
                            style={{ color: '#6d6051' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f0e8'; e.currentTarget.style.color = '#4a3f33'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6d6051'; }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>Back to Store</span>
                        </NavLink>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all w-full"
                            style={{ color: '#c54040' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
