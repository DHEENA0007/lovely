import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles, Image } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
    const { cart, updateCartItem, removeFromCart, getCartTotal, itemCount } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const { subtotal, customizationTotal, total } = getCartTotal();
    const shippingFree = total >= 999;
    const shippingCost = shippingFree ? 0 : 99;
    const finalTotal = total + shippingCost;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-neutral-500" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white mb-2">Sign In Required</h2>
                    <p className="text-neutral-400 mb-6">Please sign in to view your cart</p>
                    <Link to="/login" className="btn-primary">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    if (itemCount === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-neutral-500" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
                    <p className="text-neutral-400 mb-6">Add some gifts to get started!</p>
                    <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                        Start Shopping
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-display text-4xl font-bold text-white mb-8">
                    Shopping Cart
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item) => {
                            const product = item.product;
                            if (!product) return null;

                            let basePrice = product.price;
                            if (item.customization?.variant?.price) {
                                basePrice = item.customization.variant.price;
                            }
                            let itemPrice = basePrice * item.quantity;
                            if (item.customization?.text?.enabled && product.allowTextCustomization) {
                                itemPrice += product.textCustomizationPrice * item.quantity;
                            }
                            if (item.customization?.photo?.enabled && product.allowPhotoCustomization) {
                                itemPrice += product.photoCustomizationPrice * item.quantity;
                            }

                            return (
                                <div key={`${item._id}-${item.customization?.variant?.value || 'base'}`} className="card p-6">
                                    <div className="flex gap-6">
                                        {/* Image */}
                                        <Link to={`/product/${product._id}`} className="flex-shrink-0">
                                            <img
                                                src={
                                                    (product.hasVariants && item.customization?.variant && product.variants?.find(v => v.value === item.customization.variant.value)?.image) ||
                                                    product.images?.[0] || '/placeholder.jpg'
                                                }
                                                alt={product.name}
                                                className="w-28 h-28 rounded-xl object-cover"
                                            />
                                        </Link>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <div>
                                                    <Link to={`/product/${product._id}`} className="font-semibold text-white hover:text-primary-300 transition-colors">
                                                        {product.name}
                                                    </Link>
                                                    <p className="text-neutral-400 text-sm">
                                                        {product.category?.name}
                                                        {item.customization?.variant && ` • ${item.customization.variant.type}: ${item.customization.variant.value}`}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item._id)}
                                                    className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Customization Info */}
                                            {(item.customization?.text?.enabled || item.customization?.photo?.enabled) && (
                                                <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                                    <p className="text-xs text-primary-400 font-medium mb-2 flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3" />
                                                        Personalization
                                                    </p>
                                                    {item.customization?.text?.enabled && (
                                                        <p className="text-sm text-neutral-300">
                                                            Text: "{item.customization.text.content}"
                                                        </p>
                                                    )}
                                                    {item.customization?.photo?.enabled && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Image className="w-4 h-4 text-pink-400" />
                                                            <span className="text-sm text-neutral-300">
                                                                {item.customization.photo.images?.length || 0} photo(s)
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Quantity & Price */}
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-3 glass rounded-lg px-3 py-1">
                                                    <button
                                                        onClick={() => updateCartItem(item._id, item.quantity - 1)}
                                                        className="p-1 hover:text-primary-400 transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-6 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateCartItem(item._id, item.quantity + 1)}
                                                        className="p-1 hover:text-primary-400 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="font-semibold gradient-text text-lg">
                                                    ₹{itemPrice.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="card p-6 sticky top-24">
                            <h2 className="font-semibold text-white text-lg mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-neutral-400">
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                {customizationTotal > 0 && (
                                    <div className="flex justify-between text-neutral-400">
                                        <span className="flex items-center gap-1">
                                            <Sparkles className="w-4 h-4 text-primary-400" />
                                            Customization
                                        </span>
                                        <span>₹{customizationTotal.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-neutral-400">
                                    <span>Shipping</span>
                                    <span className={shippingFree ? 'text-green-400' : ''}>
                                        {shippingFree ? 'FREE' : `₹${shippingCost}`}
                                    </span>
                                </div>
                                {!shippingFree && (
                                    <p className="text-xs text-neutral-500">
                                        Add ₹{(999 - total).toLocaleString()} more for free shipping
                                    </p>
                                )}
                            </div>

                            <div className="border-t border-white/10 pt-4 mb-6">
                                <div className="flex justify-between text-white font-semibold text-lg">
                                    <span>Total</span>
                                    <span className="gradient-text">₹{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <Link to="/shop" className="block text-center text-sm text-primary-400 hover:text-primary-300 mt-4">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
