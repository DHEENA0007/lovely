import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { paymentAPI } from '../../api';
import toast from 'react-hot-toast';

const PaymentCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, failed, pending

    const orderId = searchParams.get('orderId');
    const txnId = searchParams.get('txnId');

    useEffect(() => {
        if (orderId && txnId) {
            verifyPayment();
        } else {
            setStatus('failed');
        }
    }, [orderId, txnId]);

    const verifyPayment = async () => {
        try {
            const { data } = await paymentAPI.verify({
                orderId,
                merchantTransactionId: txnId
            });

            if (data.success) {
                setStatus('success');
                toast.success('Payment successful! Your order has been confirmed.');
                setTimeout(() => {
                    navigate(`/orders/${orderId}`);
                }, 3000);
            } else if (data.status === 'PENDING') {
                setStatus('pending');
            } else {
                setStatus('failed');
                toast.error('Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setStatus('failed');
            toast.error('Unable to verify payment. Please contact support.');
        }
    };

    const getStatusContent = () => {
        switch (status) {
            case 'verifying':
                return {
                    icon: <Loader2 className="w-16 h-16 animate-spin" style={{ color: '#c8a24e' }} />,
                    title: 'Verifying Payment',
                    message: 'Please wait while we confirm your payment with PhonePe...',
                    color: '#c8a24e'
                };
            case 'success':
                return {
                    icon: <CheckCircle className="w-16 h-16" style={{ color: '#2d9f6f' }} />,
                    title: 'Payment Successful!',
                    message: 'Your order has been confirmed. Redirecting to order details...',
                    color: '#2d9f6f'
                };
            case 'pending':
                return {
                    icon: <Clock className="w-16 h-16" style={{ color: '#d4a937' }} />,
                    title: 'Payment Pending',
                    message: 'Your payment is being processed. We will update the status shortly.',
                    color: '#d4a937'
                };
            case 'failed':
                return {
                    icon: <XCircle className="w-16 h-16" style={{ color: '#c54040' }} />,
                    title: 'Payment Failed',
                    message: 'Your payment could not be processed. Please try again or choose a different payment method.',
                    color: '#c54040'
                };
            default:
                return {};
        }
    };

    const content = getStatusContent();

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#faf8f4' }}>
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />

            <div className="card p-12 max-w-md w-full text-center">
                <div className="mb-6 flex justify-center">
                    {content.icon}
                </div>

                <h1 className="font-display text-2xl font-bold mb-3" style={{ color: '#2a241c' }}>
                    {content.title}
                </h1>

                <p className="mb-8" style={{ color: '#6d6051' }}>
                    {content.message}
                </p>

                {status === 'success' && (
                    <button
                        onClick={() => navigate(`/orders/${orderId}`)}
                        className="btn-primary w-full"
                        style={{ color: '#fff' }}
                    >
                        View Order Details
                    </button>
                )}

                {status === 'failed' && (
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn-primary w-full"
                            style={{ color: '#fff' }}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/cart')}
                            className="btn-secondary w-full"
                        >
                            Back to Cart
                        </button>
                    </div>
                )}

                {status === 'pending' && (
                    <div className="space-y-3">
                        <button
                            onClick={() => verifyPayment()}
                            className="btn-primary w-full"
                            style={{ color: '#fff' }}
                        >
                            Check Status Again
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-secondary w-full"
                        >
                            Go to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;
