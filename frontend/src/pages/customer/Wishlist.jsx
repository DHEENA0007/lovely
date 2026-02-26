import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { wishlistAPI } from '../../api';
import ProductCard from '../../components/ProductCard';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            const { data } = await wishlistAPI.get();
            setWishlist(data);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
            toast.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (id) => {
        try {
            await wishlistAPI.remove(id);
            setWishlist(wishlist.filter(item => item._id !== id));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    if (loading) return <Loading />;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
                    <p className="text-gray-500 mb-6">Please sign in to view your wishlist</p>
                    <Link to="/login" className="btn-primary shadow-lg">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50">
            <div className="bg-orb bg-orb-1 opacity-10" />
            <div className="bg-orb bg-orb-2 opacity-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">
                            My Wishlist
                        </h1>
                        <p className="text-gray-500">
                            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
                        </p>
                    </div>
                </div>

                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <div key={product._id} className="relative group">
                                <ProductCard product={product} />
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeFromWishlist(product._id);
                                    }}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-md text-gray-400 hover:text-red-500 transition-colors z-10"
                                    title="Remove from Wishlist"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 card bg-white border-gray-100 shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
                        <p className="text-gray-500 mb-6">Save your favorite items here to find them later!</p>
                        <Link to="/shop" className="btn-primary inline-flex items-center gap-2 shadow-lg">
                            Explore Gifts
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
