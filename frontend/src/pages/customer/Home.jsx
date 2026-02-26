import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Sparkles,
    Gift,
    Heart,
    Star,
    Truck,
    Shield,
    RefreshCw,
    ChevronRight,
    Mail,
    Phone,
    MapPin,
} from 'lucide-react';
import { productAPI, categoryAPI } from '../../api';
import ProductCard from '../../components/ProductCard';
import Loading from '../../components/Loading';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        fetchData();
        if (location.state?.scrollTo) {
            const element = document.getElementById(location.state.scrollTo);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }

        // Load Facebook SDK
        if (!document.getElementById('fb-sdk')) {
            const script = document.createElement('script');
            script.id = 'fb-sdk';
            script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v21.0';
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';
            document.body.appendChild(script);
        } else if (window.FB) {
            window.FB.XFBML.parse();
        }
    }, [location]);

    const fetchData = async () => {
        try {
            const [featured, arrivals, cats] = await Promise.all([
                productAPI.getFeatured(),
                productAPI.getNewArrivals(),
                categoryAPI.getAll()
            ]);
            setFeaturedProducts(featured.data);
            setNewArrivals(arrivals.data);
            setCategories(cats.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter categories by type safely
    const categoryList = Array.isArray(categories) ? categories : [];
    const standardCategories = categoryList.filter(c => !c.type || c.type === 'category');
    const occasionCategories = categoryList.filter(c => c.type === 'occasion');
    const recipientCategories = categoryList.filter(c => c.type === 'recipient');

    // Hero Grid items
    const heroGridItems = standardCategories.slice(0, 5).map((category, index) => ({
        id: category._id,
        title: category.name,
        image: category.image || [
            "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2670&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1518640165980-d3e0e2aa6c1e?q=80&w=2574&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2670&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?q=80&w=2670&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1456735190827-d1262f71b8a6?q=80&w=2648&auto=format&fit=crop"
        ][index % 5],
        link: `/shop?category=${category._id}`,
        large: index === 0,
        subtitle: index === 0 ? category.description || "Discover our premium collection designed for you." : null
    }));

    const getCategoryStyle = (index) => {
        const styles = [
            { icon: '🎂', color: 'from-pink-500 to-rose-500' },
            { icon: '💕', color: 'from-red-500 to-pink-500' },
            { icon: '💒', color: 'from-purple-500 to-pink-500' },
            { icon: '❤️', color: 'from-rose-500 to-red-500' },
            { icon: '🎄', color: 'from-green-500 to-emerald-500' },
            { icon: '🎓', color: 'from-blue-500 to-indigo-500' },
            { icon: '🎁', color: 'from-amber-500 to-orange-500' },
            { icon: '✨', color: 'from-indigo-500 to-purple-500' },
        ];
        return styles[index % styles.length];
    };

    const getRecipientImage = (index) => {
        const images = [
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1488161628813-99c974fc5bcc?q=80&w=1964&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1887&auto=format&fit=crop",
        ];
        return images[index % images.length];
    }

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-white">
            {/* Background Orbs */}
            <div className="bg-orb bg-orb-1 opacity-10" />
            <div className="bg-orb bg-orb-2 opacity-10" />
            <div className="bg-orb bg-orb-3 opacity-10" />

            {/* Hero Grid Section */}
            {heroGridItems.length > 0 ? (
                <section className="w-full md:h-[600px]">
                    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 h-full w-full">
                        {heroGridItems.map((item) => (
                            <div
                                key={item.id}
                                className={`relative group overflow-hidden ${item.large
                                    ? 'md:col-span-2 md:row-span-2 min-h-[300px] md:min-h-0'
                                    : 'md:col-span-1 md:row-span-1 min-h-[200px] md:min-h-0'
                                    }`}
                            >
                                {/* Background Image */}
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />

                                {/* Content */}
                                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                                    <h2 className={`font-bold mb-4 drop-shadow-xl ${item.large ? 'text-3xl md:text-5xl' : 'text-xl md:text-2xl'}`} style={{ color: '#fff' }}>
                                        {item.title}
                                    </h2>

                                    {item.large && item.subtitle && (
                                        <p className="font-medium text-sm md:text-base mb-8 max-w-md mx-auto drop-shadow-lg hidden md:block" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                            {item.subtitle}
                                        </p>
                                    )}

                                    <Link
                                        to={item.link}
                                        className="px-6 py-2.5 font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg rounded-sm"
                                        style={{ background: '#fff', color: '#2a241c' }}
                                    >
                                        Shop now
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {/* Fill remaining slots */}
                        {heroGridItems.length < 5 && Array.from({ length: 5 - heroGridItems.length }).map((_, i) => (
                            <div
                                key={`placeholder-${i}`}
                                className="relative group overflow-hidden md:col-span-1 md:row-span-1 min-h-[150px] md:min-h-0 flex items-center justify-center"
                                style={{ background: '#f5f0e8', border: '1px solid #ede5d8' }}
                            >
                                <p style={{ color: '#9a8e7f' }} className="font-medium">Coming Soon</p>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                <section className="h-[400px] flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Lovely Gifts</h1>
                        <p className="text-gray-500">Categories not configured yet.</p>
                    </div>
                </section>
            )}

            {/* Shop by Occasion */}
            {occasionCategories.length > 0 && (
                <section className="py-20 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
                                Shop by Occasion
                            </h2>
                            <p className="text-gray-500 max-w-2xl mx-auto">
                                Find the perfect gift for every special moment in life
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {occasionCategories.map((category, i) => {
                                const style = getCategoryStyle(i);
                                return (
                                    <Link
                                        key={category._id}
                                        to={`/shop?category=${category._id}`}
                                        className="group"
                                    >
                                        <div className="card p-6 text-center hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center justify-center bg-white border border-gray-100">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                                                <span className="text-3xl filter drop-shadow-sm">{style.icon}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-800 px-2 leading-tight">{category.name}</h3>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Shop by Recipient */}
            {recipientCategories.length > 0 && (
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
                                Shop by Recipient
                            </h2>
                            <p className="text-gray-500 max-w-2xl mx-auto">
                                Gifts curated for your loved ones
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {recipientCategories.map((category, i) => (
                                <Link
                                    key={category._id}
                                    to={`/shop?category=${category._id}`}
                                    className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-lg hover:shadow-2xl transition-all duration-300"
                                >
                                    <img
                                        src={category.image || getRecipientImage(i)}
                                        alt={category.name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                                        <h3 className="font-display text-2xl font-bold text-white mb-2 drop-shadow-md">
                                            {category.name}
                                        </h3>
                                        <span className="text-white/90 text-sm font-medium flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                                            View Gifts <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}



            {/* Featured Products */}
            {featuredProducts.length > 0 && (
                <section className="py-20 bg-gray-50/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="font-display text-4xl font-bold text-gray-900 mb-2">
                                    Featured Gifts
                                </h2>
                                <p className="text-gray-500">Handpicked favorites just for you</p>
                            </div>
                            <Link to="/shop?featured=true" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors font-medium">
                                View All <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.slice(0, 4).map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="card p-12 text-center relative overflow-hidden bg-white shadow-2xl border-none">
                        <div className="absolute inset-0 gradient-aurora opacity-5" />
                        <div className="relative">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100 text-sm font-medium text-primary-600 mb-6">
                                <Sparkles className="w-4 h-4" />
                                Personalization Available
                            </span>
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Create Something Special
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">
                                Add your personal message or upload photos to make your gift truly one-of-a-kind.
                                Our customization options let you create memories that last forever.
                            </p>
                            <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-lg shadow-xl hover:shadow-2xl">
                                Start Customizing
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Google Reviews Section */}
            <section className="py-20" style={{ background: '#faf8f4' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="font-semibold text-lg" style={{ color: '#6d6051' }}>Google Reviews</span>
                        </div>
                        <h2 className="font-display text-4xl font-bold mb-4" style={{ color: '#2a241c' }}>
                            What Our Customers Say
                        </h2>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className="w-6 h-6" fill={s <= 4 ? '#f59e0b' : (s === 5 ? '#f59e0b' : '#e5e7eb')} style={{ color: '#f59e0b' }} />
                                ))}
                            </div>
                            <span className="font-bold text-2xl" style={{ color: '#2a241c' }}>4.8</span>
                            <span style={{ color: '#9a8e7f' }}>out of 5</span>
                        </div>
                        <p style={{ color: '#9a8e7f' }}>Based on 280+ reviews on Google</p>
                    </div>

                    <div className="flex gap-6 mb-10 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4c4a8 #f5f0e8' }}>
                        {[
                            {
                                name: 'Kausalya Arumugam',
                                rating: 5,
                                time: '3 weeks ago',
                                text: 'Thank you so much lovely frames for the beautiful frame😍...My husband loved it🥰 Safely packed and delivered at the right time👍🙏..Romba thanks next order on the way💥👌'
                            },
                            {
                                name: 'Hemalathaa B',
                                rating: 5,
                                time: '2 months ago',
                                text: 'Seriously worth the buy. I ordered 4 photo frames for ₹350 — two in 6×4 inches and two in 8×6 inches. The quality is really good, and all the frames come with a table stand as well. Very happy with the purchase. Highly recommended!'
                            },
                            {
                                name: 'PRIYANGA VIJAYAN',
                                rating: 5,
                                time: '2 months ago',
                                text: 'The product was perfect! I am so pleased with the quality of your photo frame and service. Also the packing is so good and safety. They are clean, crisp, well-made. Thanks lot to lovely frame and keep it up in the future.'
                            },
                            {
                                name: 'Cambridge Baslin',
                                rating: 5,
                                time: '2 months ago',
                                text: 'Ordered a 12×18 frame and received a 12×12 frame as part of the offer — two frames for the price of one. Both frames are of excellent quality and worth the cost.'
                            },
                            {
                                name: 'Micheal Nicholos Ananth',
                                rating: 5,
                                time: 'a month ago',
                                text: "This page is providing beyond our expectations in low cost but quality you can't say anything. They're making each and everything with love and care. Their product and output is very awesome. Trust worthy page."
                            },
                            {
                                name: 'Ram Kumar',
                                rating: 5,
                                time: '3 months ago',
                                text: 'I recently got a custom photo frame. Frame styles, materials, and finishes matched my photo perfectly. The final product was stunning—high-quality, beautifully detailed, and delivered right on time. Highly recommended for great craftsmanship!'
                            }
                        ].map((review, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 snap-start flex-shrink-0"
                                style={{
                                    background: '#fff',
                                    border: '1px solid #ede5d8',
                                    boxShadow: '0 4px 20px rgba(42,36,28,0.05)',
                                    minWidth: '320px',
                                    maxWidth: '360px'
                                }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                                        style={{ background: 'linear-gradient(135deg, #c8a24e, #b8860b)', color: '#fff' }}
                                    >
                                        {review.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm" style={{ color: '#2a241c' }}>{review.name}</p>
                                        <p className="text-xs" style={{ color: '#9a8e7f' }}>{review.time}</p>
                                    </div>
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="none">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                <div className="flex mb-3">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} className="w-4 h-4" fill={s <= review.rating ? '#f59e0b' : '#e5e7eb'} style={{ color: s <= review.rating ? '#f59e0b' : '#e5e7eb' }} />
                                    ))}
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: '#4a3f33' }}>
                                    "{review.text}"
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <a
                            href="https://www.google.com/maps/place/?q=place_id:ChIJee52eABnUjoRP0Iq4hCjWvQ"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5"
                            style={{ background: '#fff', border: '1px solid #ede5d8', color: '#2a241c', boxShadow: '0 4px 12px rgba(42,36,28,0.06)' }}
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            See All 280+ Reviews on Google
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Facebook Page Section */}
            <section className="py-16" style={{ background: '#f5f0e8' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-10">
                        {/* Left - Text */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                                <svg viewBox="0 0 24 24" className="w-10 h-10" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="font-semibold text-lg" style={{ color: '#6d6051' }}>Facebook</span>
                            </div>
                            <h2 className="font-display text-4xl font-bold mb-4" style={{ color: '#2a241c' }}>
                                Stay Connected With Us
                            </h2>
                            <p className="text-lg mb-6" style={{ color: '#9a8e7f' }}>
                                Follow our Facebook page for the latest products, exclusive offers, customer photos, and behind-the-scenes content from Lovely Gifts Chennai.
                            </p>
                            <a
                                href="https://www.facebook.com/profile.php?id=100083058534634"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5"
                                style={{ background: '#1877F2', color: '#fff', boxShadow: '0 4px 16px rgba(24,119,242,0.3)' }}
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#fff">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Follow Us on Facebook
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>

                        {/* Right - Facebook Embed */}
                        <div className="flex-shrink-0 w-full lg:w-auto">
                            <div className="rounded-2xl overflow-hidden mx-auto lg:mx-0" style={{ border: '1px solid #ede5d8', boxShadow: '0 4px 20px rgba(42,36,28,0.05)', background: '#fff', padding: '12px', maxWidth: '520px' }}>
                                <div
                                    className="fb-page"
                                    data-href="https://www.facebook.com/profile.php?id=100083058534634"
                                    data-tabs="timeline"
                                    data-width="500"
                                    data-height="500"
                                    data-small-header="false"
                                    data-adapt-container-width="true"
                                    data-hide-cover="false"
                                    data-show-facepile="true"
                                >
                                    <blockquote cite="https://www.facebook.com/profile.php?id=100083058534634" className="fb-xfbml-parse-ignore">
                                        <a href="https://www.facebook.com/profile.php?id=100083058534634" target="_blank" rel="noopener noreferrer">
                                            Lovely Gifts
                                        </a>
                                    </blockquote>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20" id="about" style={{ background: '#f5f0e8' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-display text-4xl font-bold mb-8" style={{ color: '#2a241c' }}>About Us</h2>
                    <div className="p-12 rounded-3xl max-w-4xl mx-auto" style={{ background: '#fff', border: '1px solid #ede5d8', boxShadow: '0 4px 20px rgba(42,36,28,0.05)' }}>
                        <p className="mb-6 text-lg leading-relaxed" style={{ color: '#6d6051' }}>
                            Welcome to Lovely, where we believe in the power of thoughtful gifting.
                        </p>
                        <p className="text-lg leading-relaxed" style={{ color: '#6d6051' }}>
                            Our mission is to help you celebrate life's special moments with unique, personalized gifts that speak from the heart.
                        </p>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default Home;
