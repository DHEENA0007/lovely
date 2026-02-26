import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
    Minus, Plus, Heart, ShoppingBag, Sparkles,
    Image as ImageIcon, Check, ChevronLeft,
    ChevronRight, Star, Truck, Shield, X
} from 'lucide-react';
import { productAPI, reviewAPI, orderAPI } from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);

    // Customization state
    const [customText, setCustomText] = useState('');
    const [enableTextCustomization, setEnableTextCustomization] = useState(false);
    const [enablePhotoCustomization, setEnablePhotoCustomization] = useState(false);
    const [customPhotos, setCustomPhotos] = useState([]);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const [productRes, reviewsRes] = await Promise.all([
                productAPI.getById(id),
                reviewAPI.getProductReviews(id)
            ]);
            setProduct(productRes.data);
            if (productRes.data.hasVariants && productRes.data.variants?.length > 0) {
                setSelectedVariant(productRes.data.variants[0]);
            }
            setReviews(reviewsRes.data.reviews || []);
        } catch (error) {
            console.error('Failed to fetch product:', error);
            toast.error('Product not found');
            navigate('/shop');
        } finally {
            setLoading(false);
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!isAuthenticated) {
            toast.error('Please login to upload photos');
            return;
        }

        if (customPhotos.length + acceptedFiles.length > (product?.maxPhotos || 3)) {
            toast.error(`Maximum ${product?.maxPhotos || 3} photos allowed`);
            return;
        }

        setUploadingPhotos(true);
        try {
            const formData = new FormData();
            acceptedFiles.forEach(file => formData.append('images', file));

            const { data } = await orderAPI.uploadCustomization(formData);
            setCustomPhotos(prev => [...prev, ...data.images]);
            toast.success('Photos uploaded!');
        } catch (error) {
            toast.error('Failed to upload photos');
        } finally {
            setUploadingPhotos(false);
        }
    }, [customPhotos, product, isAuthenticated]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxFiles: product?.maxPhotos || 3
    });

    const removePhoto = (index) => {
        setCustomPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        if (!product) return 0;
        let basePrice = product.price;
        if (selectedVariant && selectedVariant.price) {
            basePrice = selectedVariant.price;
        }
        let total = basePrice * quantity;

        if (enableTextCustomization && product.allowTextCustomization) {
            total += product.textCustomizationPrice * quantity;
        }
        if (enablePhotoCustomization && product.allowPhotoCustomization) {
            total += product.photoCustomizationPrice * quantity;
        }

        return total;
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        const customization = {
            variant: selectedVariant ? {
                type: product.variantType,
                value: selectedVariant.value,
                price: selectedVariant.price
            } : null,
            text: {
                enabled: enableTextCustomization,
                content: customText
            },
            photo: {
                enabled: enablePhotoCustomization,
                images: customPhotos
            }
        };

        try {
            await addToCart(product._id, quantity, customization);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    if (loading) return <Loading />;
    if (!product) return null;

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-neutral-400 mb-8">
                    <button onClick={() => navigate(-1)} className="hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>Shop</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>{product.category?.name}</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white">{product.name}</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Images */}
                    <div>
                        <div className="card overflow-hidden mb-4">
                            <div className="aspect-square relative">
                                <img
                                    src={selectedVariant?.image || product.images?.[selectedImage] || '/placeholder.jpg'}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />

                                {/* Image Navigation */}
                                {product.images?.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}

                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {product.isFeatured && <span className="badge badge-featured">Featured</span>}
                                    {product.isNewArrival && <span className="badge badge-new">New</span>}
                                </div>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {product.images?.length > 1 && (
                            <div className="flex gap-3">
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-primary-500' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        <p className="text-primary-400 text-sm font-medium uppercase tracking-wider mb-2">
                            {product.category?.name}
                        </p>

                        <h1 className="font-display text-4xl font-bold text-white mb-4">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        {product.numReviews > 0 && (
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-600'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-neutral-400">({product.numReviews} reviews)</span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-4xl font-bold gradient-text">
                                ₹{(selectedVariant?.price || product.price).toLocaleString()}
                            </span>
                            {product.comparePrice > (selectedVariant?.price || product.price) && (
                                <>
                                    <span className="text-xl text-neutral-500 line-through">
                                        ₹{product.comparePrice.toLocaleString()}
                                    </span>
                                    <span className="badge badge-sale">
                                        {Math.round((1 - (selectedVariant?.price || product.price) / product.comparePrice) * 100)}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Variants */}
                        {product.hasVariants && product.variants?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                                    Select {product.variantType}
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`px-4 py-2 rounded-xl border-2 transition-all ${selectedVariant?._id === variant._id || selectedVariant?.value === variant.value
                                                    ? 'border-primary-500 bg-primary-500/10 text-white'
                                                    : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                                                }`}
                                        >
                                            {variant.value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-neutral-300 mb-8">
                            {product.description}
                        </p>

                        {/* Stock */}
                        <div className="mb-6">
                            {product.stock > 0 ? (
                                <span className="inline-flex items-center gap-2 text-green-400">
                                    <Check className="w-4 h-4" />
                                    In Stock ({product.stock} available)
                                </span>
                            ) : (
                                <span className="text-red-400">Out of Stock</span>
                            )}
                        </div>

                        {/* Customization Options */}
                        {(product.allowTextCustomization || product.allowPhotoCustomization) && (
                            <div className="card p-6 mb-6">
                                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary-400" />
                                    Personalization Options
                                </h3>

                                {/* Text Customization */}
                                {product.allowTextCustomization && (
                                    <div className="mb-6">
                                        <label className="flex items-center gap-3 cursor-pointer mb-3">
                                            <input
                                                type="checkbox"
                                                checked={enableTextCustomization}
                                                onChange={(e) => setEnableTextCustomization(e.target.checked)}
                                                className="checkbox-custom"
                                            />
                                            <div>
                                                <span className="text-white font-medium">{product.textCustomizationLabel}</span>
                                                {product.textCustomizationPrice > 0 && (
                                                    <span className="text-primary-400 ml-2">+₹{product.textCustomizationPrice}</span>
                                                )}
                                            </div>
                                        </label>

                                        {enableTextCustomization && (
                                            <div>
                                                <textarea
                                                    value={customText}
                                                    onChange={(e) => setCustomText(e.target.value.slice(0, product.textCustomizationMaxLength))}
                                                    placeholder="Enter your message..."
                                                    className="input-field resize-none h-24"
                                                    maxLength={product.textCustomizationMaxLength}
                                                />
                                                <p className="text-xs text-neutral-500 mt-1">
                                                    {customText.length}/{product.textCustomizationMaxLength} characters
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Photo Customization */}
                                {product.allowPhotoCustomization && (
                                    <div>
                                        <label className="flex items-center gap-3 cursor-pointer mb-3">
                                            <input
                                                type="checkbox"
                                                checked={enablePhotoCustomization}
                                                onChange={(e) => setEnablePhotoCustomization(e.target.checked)}
                                                className="checkbox-custom"
                                            />
                                            <div>
                                                <span className="text-white font-medium">{product.photoCustomizationLabel}</span>
                                                {product.photoCustomizationPrice > 0 && (
                                                    <span className="text-primary-400 ml-2">+₹{product.photoCustomizationPrice}</span>
                                                )}
                                            </div>
                                        </label>

                                        {enablePhotoCustomization && (
                                            <div>
                                                <div
                                                    {...getRootProps()}
                                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-white/20 hover:border-white/40'
                                                        }`}
                                                >
                                                    <input {...getInputProps()} />
                                                    <ImageIcon className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                                                    <p className="text-neutral-400">
                                                        {isDragActive ? 'Drop photos here...' : 'Drag & drop or click to upload'}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 mt-1">
                                                        Max {product.maxPhotos} photos (JPG, PNG, WebP)
                                                    </p>
                                                </div>

                                                {/* Uploaded Photos */}
                                                {customPhotos.length > 0 && (
                                                    <div className="flex gap-3 mt-4">
                                                        {customPhotos.map((photo, i) => (
                                                            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                                                                <img src={photo} alt="" className="w-full h-full object-cover" />
                                                                <button
                                                                    onClick={() => removePhoto(i)}
                                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {uploadingPhotos && <Loading size="small" />}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex items-center gap-3 glass rounded-xl px-4">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="p-2 hover:text-primary-400 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-semibold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                    className="p-2 hover:text-primary-400 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Add to Cart - ₹{calculateTotal().toLocaleString()}
                            </button>

                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className={`p-4 rounded-xl glass hover:bg-white/10 transition-colors ${isLiked ? 'text-red-500' : ''}`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="flex gap-6 text-sm text-neutral-400">
                            <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                Free Shipping
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Secure Payment
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16">
                    <h2 className="font-display text-2xl font-bold text-white mb-8">
                        Customer Reviews
                    </h2>

                    {reviews.length > 0 ? (
                        <div className="grid gap-4">
                            {reviews.map((review) => (
                                <div key={review._id} className="card p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full gradient-aurora flex items-center justify-center">
                                            {review.user?.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-white">{review.user?.name}</span>
                                                <div className="flex text-yellow-400 text-sm">
                                                    {'★'.repeat(review.rating)}
                                                    {'☆'.repeat(5 - review.rating)}
                                                </div>
                                            </div>
                                            <p className="text-neutral-300">{review.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral-400">No reviews yet. Be the first to review!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
