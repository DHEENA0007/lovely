import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
    ShoppingBag,
    User,
    Menu,
    X,
    Search,
    Heart,
    LogOut,
    Package,
    Settings
} from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, isAuthenticated, logout, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const scrollToSection = (sectionId) => {
        setIsOpen(false);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/', { state: { scrollTo: sectionId } });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowUserMenu(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm" style={{ background: 'rgba(250, 248, 244, 0.95)', borderBottom: '1px solid #ede5d8' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* 1. Logo (Left) */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/Lovely-e1744618992869.webp" alt="Lovely" className="h-16 w-auto" />
                        </Link>
                    </div>

                    {/* 2. Navigation Links (Center) - Hidden on mobile */}
                    <div className="hidden md:flex items-center justify-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
                        <Link to="/" className="text-sm font-medium hover:text-gold-600 transition-colors" style={{ color: '#6d6051' }}>Home</Link>
                        <Link to="/shop" className="text-sm font-medium hover:text-gold-600 transition-colors" style={{ color: '#6d6051' }}>Shop</Link>
                        <Link to="/categories" className="text-sm font-medium hover:text-gold-600 transition-colors" style={{ color: '#6d6051' }}>Categories</Link>
                        <button onClick={() => scrollToSection('about')} className="text-sm font-medium hover:text-gold-600 transition-colors" style={{ color: '#6d6051' }}>About</button>
                        <button onClick={() => scrollToSection('contact')} className="text-sm font-medium hover:text-gold-600 transition-colors" style={{ color: '#6d6051' }}>Contact</button>
                    </div>

                    {/* 3. Right Actions */}
                    <div className="flex items-center gap-6">
                        {/* Auth Links (Desktop) */}
                        {!isAuthenticated ? (
                            <div className="hidden md:flex items-center gap-6 mr-2">
                                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
                                <Link to="/register" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Register</Link>
                            </div>
                        ) : null}

                        {/* Icons */}
                        <div className="flex items-center gap-4">
                            <button className="text-gray-600 hover:text-gray-900 transition-colors">
                                <Search className="w-5 h-5" />
                            </button>

                            <Link to="/wishlist" className="text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
                                <Heart className="w-5 h-5" />
                            </Link>

                            <Link to="/cart" className="text-gray-600 hover:text-gray-900 transition-colors relative">
                                <ShoppingBag className="w-5 h-5" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c8a24e, #b8860b)', color: '#fff' }}>
                                        {itemCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Avatar / Menu (if logged in) */}
                            {isAuthenticated && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <User className="w-5 h-5" />
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50" style={{ border: '1px solid #ede5d8' }}>
                                            <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                            </div>

                                            {isAdmin && (
                                                <Link to="/admin" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">Admin</Link>
                                            )}
                                            <Link to="/orders" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">Orders</Link>
                                            <Link to="/profile" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">Profile</Link>
                                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="md:hidden text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden" style={{ background: '#fffdf7', borderTop: '1px solid #ede5d8' }}>
                    <div className="px-4 py-6 space-y-4">
                        <Link to="/" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-gray-900">Home</Link>
                        <Link to="/shop" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-gray-600">Clothings</Link>
                        <Link to="/categories" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-gray-600">Categories</Link>
                        <button onClick={() => scrollToSection('about')} className="block text-lg font-medium text-gray-600 text-left w-full">About</button>
                        <button onClick={() => scrollToSection('contact')} className="block text-lg font-medium text-gray-600 text-left w-full">Contact</button>
                        {!isAuthenticated && (
                            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-gray-600">Login</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-gray-600">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
