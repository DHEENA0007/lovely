import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Gift, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, paymentAPI } from '../../api';
import toast from 'react-hot-toast';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [shippingAddress, setShippingAddress] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || 'India'
    });

    const [paymentMethod, setPaymentMethod] = useState('phonepe');
    const [giftMessage, setGiftMessage] = useState('');
    const [isGiftWrapped, setIsGiftWrapped] = useState(false);

    const { subtotal, customizationTotal, total } = getCartTotal();
    const shippingPrice = total >= 999 ? 0 : 99;
    const giftWrapPrice = isGiftWrapped ? 49 : 0;
    const taxPrice = Math.round(total * 0.18);
    const finalTotal = total + shippingPrice + giftWrapPrice + taxPrice;

    const handleSubmit = async () => {
        if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.street ||
            !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
            toast.error('Please fill in all shipping details');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                items: cart.items.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    customization: item.customization
                })),
                shippingAddress,
                paymentMethod,
                itemsPrice: subtotal,
                customizationPrice: customizationTotal,
                shippingPrice,
                taxPrice,
                totalPrice: finalTotal,
                giftMessage,
                isGiftWrapped,
                giftWrapPrice
            };

            if (paymentMethod === 'phonepe') {
                // PhonePe online payment
                const { data } = await paymentAPI.initiate(orderData);
                if (data.success && data.redirectUrl) {
                    toast.success('Redirecting to PhonePe...');
                    window.location.href = data.redirectUrl;
                } else {
                    toast.error(data.message || 'Payment initialization failed. Please try again.');
                }
            } else {
                // Cash on Delivery
                const { data } = await orderAPI.create(orderData);
                toast.success('Order placed successfully!');
                navigate(`/orders/${data._id}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Cart
                </button>

                <h1 className="font-display text-4xl font-bold text-white mb-8">Checkout</h1>

                {/* Steps */}
                <div className="flex gap-4 mb-12">
                    {[
                        { num: 1, label: 'Shipping', icon: Truck },
                        { num: 2, label: 'Payment', icon: CreditCard },
                        { num: 3, label: 'Review', icon: Check }
                    ].map((s) => (
                        <button
                            key={s.num}
                            onClick={() => setStep(s.num)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${step === s.num
                                ? 'gradient-aurora text-white'
                                : step > s.num
                                    ? 'glass bg-green-500/20 text-green-400'
                                    : 'glass text-neutral-400'
                                }`}
                        >
                            <s.icon className="w-5 h-5" />
                            <span className="font-medium">{s.label}</span>
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Shipping Step */}
                        {step === 1 && (
                            <div className="card p-8">
                                <h2 className="font-semibold text-white text-xl mb-6 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-primary-400" />
                                    Shipping Address
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-neutral-400 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={shippingAddress.name}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                                            className="input-field"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-neutral-400 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={shippingAddress.phone}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                            className="input-field"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-neutral-400 mb-2">Street Address</label>
                                        <input
                                            type="text"
                                            value={shippingAddress.street}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                                            className="input-field"
                                            placeholder="123 Main Street"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-2">City</label>
                                        <input
                                            type="text"
                                            value={shippingAddress.city}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                            className="input-field"
                                            placeholder="Mumbai"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-2">State</label>
                                        <input
                                            type="text"
                                            value={shippingAddress.state}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                                            className="input-field"
                                            placeholder="Maharashtra"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-2">ZIP Code</label>
                                        <input
                                            type="text"
                                            value={shippingAddress.zipCode}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                                            className="input-field"
                                            placeholder="400001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-2">Country</label>
                                        <input
                                            type="text"
                                            value={shippingAddress.country}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                            className="input-field"
                                            placeholder="India"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    className="btn-primary mt-6 w-full"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        )}

                        {/* Payment Step */}
                        {step === 2 && (
                            <div className="card p-8">
                                <h2 className="font-semibold text-white text-xl mb-6 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary-400" />
                                    Payment Method
                                </h2>

                                <div className="space-y-4">
                                    {[
                                        { id: 'phonepe', label: 'Pay Online (PhonePe)', desc: 'UPI, Cards, Net Banking via PhonePe' },
                                        { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order' }
                                    ].map((method) => (
                                        <label
                                            key={method.id}
                                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${paymentMethod === method.id
                                                ? 'glass border border-primary-500'
                                                : 'glass hover:bg-white/5'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment"
                                                value={method.id}
                                                checked={paymentMethod === method.id}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="checkbox-custom"
                                            />
                                            <div>
                                                <p className="font-medium text-white">{method.label}</p>
                                                <p className="text-sm text-neutral-400">{method.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {/* Gift Options */}
                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                        <Gift className="w-5 h-5 text-pink-400" />
                                        Gift Options
                                    </h3>

                                    <label className="flex items-center gap-3 mb-4 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isGiftWrapped}
                                            onChange={(e) => setIsGiftWrapped(e.target.checked)}
                                            className="checkbox-custom"
                                        />
                                        <div>
                                            <span className="text-white">Add Gift Wrapping</span>
                                            <span className="text-primary-400 ml-2">+₹49</span>
                                        </div>
                                    </label>

                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-2">Gift Message (Optional)</label>
                                        <textarea
                                            value={giftMessage}
                                            onChange={(e) => setGiftMessage(e.target.value)}
                                            placeholder="Add a personal message..."
                                            className="input-field resize-none h-24"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                                        Back
                                    </button>
                                    <button onClick={() => setStep(3)} className="btn-primary flex-1">
                                        Review Order
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Review Step */}
                        {step === 3 && (
                            <div className="card p-8">
                                <h2 className="font-semibold text-white text-xl mb-6 flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-400" />
                                    Review Order
                                </h2>

                                {/* Shipping Info */}
                                <div className="mb-6 pb-6 border-b border-white/10">
                                    <h3 className="text-sm font-medium text-neutral-400 mb-2">Shipping To</h3>
                                    <p className="text-white">{shippingAddress.name}</p>
                                    <p className="text-neutral-300">{shippingAddress.street}</p>
                                    <p className="text-neutral-300">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                                    <p className="text-neutral-300">{shippingAddress.phone}</p>
                                </div>

                                {/* Items */}
                                <div className="space-y-4">
                                    {cart.items.map((item) => (
                                        <div key={item._id} className="flex gap-4 p-4 rounded-xl bg-white/5">
                                            <img
                                                src={
                                                    (item.product?.hasVariants && item.customization?.variant && item.product?.variants?.find(v => v.value === item.customization.variant.value)?.image) ||
                                                    item.product?.images?.[0] || '/placeholder.jpg'
                                                }
                                                alt={item.product?.name}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-white">{item.product?.name}</p>
                                                {item.customization?.variant && (
                                                    <p className="text-xs text-neutral-400">
                                                        {item.customization.variant.type}: {item.customization.variant.value}
                                                    </p>
                                                )}
                                                <p className="text-sm text-neutral-400">Qty: {item.quantity}</p>
                                                {(item.customization?.text?.enabled || item.customization?.photo?.enabled) && (
                                                    <p className="text-xs text-primary-400 flex items-center gap-1 mt-1">
                                                        <Sparkles className="w-3 h-3" />
                                                        Personalized
                                                    </p>
                                                )}
                                            </div>
                                            <p className="font-semibold text-white">
                                                ₹{((item.customization?.variant?.price || item.product?.price) * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="btn-primary flex-1"
                                    >
                                        {loading ? 'Placing Order...' : `Place Order - ₹${finalTotal.toLocaleString()}`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="card p-6 sticky top-24">
                            <h2 className="font-semibold text-white text-lg mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex justify-between text-neutral-400">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                {customizationTotal > 0 && (
                                    <div className="flex justify-between text-neutral-400">
                                        <span>Customization</span>
                                        <span>₹{customizationTotal.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-neutral-400">
                                    <span>Shipping</span>
                                    <span className={shippingPrice === 0 ? 'text-green-400' : ''}>
                                        {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                                    </span>
                                </div>
                                {isGiftWrapped && (
                                    <div className="flex justify-between text-neutral-400">
                                        <span>Gift Wrapping</span>
                                        <span>₹{giftWrapPrice}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-neutral-400">
                                    <span>Tax (18%)</span>
                                    <span>₹{taxPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <div className="flex justify-between text-white font-semibold text-lg">
                                    <span>Total</span>
                                    <span className="gradient-text">₹{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
