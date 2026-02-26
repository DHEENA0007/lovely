import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Sparkles, Image } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    // Safety check for product
    if (!product) return null;

    const hasCustomization = product.allowTextCustomization || product.allowPhotoCustomization;
    const discount = product.comparePrice > product.price
        ? Math.round((1 - product.price / product.comparePrice) * 100)
        : 0;

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            return;
        }
        if (hasCustomization) {
            toast('This product has customization options!', { icon: '✨' });
            return;
        }
        await addToCart(product._id, 1);
    };

    return (
        <Link
            to={`/product/${product._id}`}
            className={`group block card hover:-translate-y-1 transition-all duration-300`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="overflow-hidden rounded-t-[20px]">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                        src={product.images?.[0] || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay for badges visibility if needed, keeps light in light theme */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.isFeatured && (
                            <span className="badge badge-featured shadow-sm">Featured</span>
                        )}
                        {product.isNewArrival && (
                            <span className="badge badge-new shadow-sm">New</span>
                        )}
                    </div>

                    {/* Customization Indicators */}
                    {hasCustomization && (
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {product.allowTextCustomization && (
                                <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center p-1.5" title="Text Customization">
                                    <Sparkles className="w-full h-full text-purple-500" />
                                </div>
                            )}
                            {product.allowPhotoCustomization && (
                                <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center p-1.5" title="Photo Customization">
                                    <Image className="w-full h-full text-pink-500" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <button
                            onClick={handleQuickAdd}
                            className="flex-1 py-2.5 rounded-xl bg-white text-gray-900 shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            {hasCustomization ? 'Customize' : 'Add'}
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsLiked(!isLiked);
                            }}
                            className={`p-2.5 rounded-xl bg-white shadow-lg hover:bg-gray-50 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 bg-white">
                    {/* Category */}
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">
                        {product.category?.name || 'Vibes'}
                    </p>

                    {/* Name */}
                    <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2 text-base leading-tight">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-sm ${i < (product.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
                    </div>

                    {/* Price */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                            ₹{product.price?.toLocaleString()}
                        </span>
                        {product.comparePrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">
                                ₹{product.comparePrice?.toLocaleString()}
                            </span>
                        )}
                        {discount > 0 && (
                            <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                                -{discount}%
                            </span>
                        )}
                    </div>

                    {/* Customization Info */}
                    {hasCustomization && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                <Sparkles className="w-3 h-3 text-primary-500" />
                                Personalization available
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
