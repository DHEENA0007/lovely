import { Link } from 'react-router-dom';
import { Gift, Heart, Instagram, Twitter, Facebook, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer id="contact" className="mt-20" style={{ background: '#fffdf7', borderTop: '1px solid #ede5d8' }}>
            {/* Newsletter Section */}
            <div className="relative overflow-hidden py-16" style={{ background: '#f5f0e8' }}>
                <div className="absolute inset-0 gradient-aurora opacity-5" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="font-display text-3xl font-bold text-gray-900 mb-4">
                        Join Our Gift Community
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Subscribe for exclusive offers, gift ideas, and be the first to know about new arrivals.
                    </p>
                    <form className="flex max-w-md mx-auto gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="input-field flex-1 bg-white"
                        />
                        <button type="submit" className="btn-primary whitespace-nowrap shadow-md">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center gap-3 mb-4">
                            <img src="/Lovely-e1744618992869.webp" alt="Lovely" className="h-10 w-auto" />
                        </Link>
                        <p className="text-gray-500 text-sm mb-4">
                            Creating moments of joy with personalized gifts that speak from the heart.
                        </p>
                        <div className="flex gap-3">
                            {[Instagram, Facebook, Twitter].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 rounded-full transition-colors" style={{ background: '#f5f0e8', color: '#9a8e7f' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ede5d8'; e.currentTarget.style.color = '#c8a24e'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f0e8'; e.currentTarget.style.color = '#9a8e7f'; }}
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Shop</h4>
                        <ul className="space-y-2">
                            <li><Link to="/shop" className="text-gray-500 hover:text-primary-600 transition-colors">All Gifts</Link></li>
                            <li><Link to="/new-arrivals" className="text-gray-500 hover:text-primary-600 transition-colors">New Arrivals</Link></li>
                            <li><Link to="/best-sellers" className="text-gray-500 hover:text-primary-600 transition-colors">Best Sellers</Link></li>
                            <li><Link to="/categories" className="text-gray-500 hover:text-primary-600 transition-colors">Categories</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link to="/privacy-policy" className="text-gray-500 hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service" className="text-gray-500 hover:text-primary-600 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-gray-500">
                                <Mail className="w-4 h-4" />
                                hello@lovelygifts.com
                            </li>
                            <li className="flex items-center gap-2 text-gray-500">
                                <Heart className="w-4 h-4 text-red-400" />
                                Made with love ❤️
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid #ede5d8' }}>
                    <p className="text-gray-400 text-sm">
                        © 2024 Lovely Gifts. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link to="/privacy-policy" className="text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</Link>
                        <Link to="/terms-of-service" className="text-gray-500 hover:text-gray-900 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
