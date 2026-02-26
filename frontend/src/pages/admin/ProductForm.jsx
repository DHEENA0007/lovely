import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
    ArrowLeft, Upload, X, Save, Sparkles, Image as ImageIcon,
    DollarSign, Package, Tag, Users, Calendar, Plus
} from 'lucide-react';
import { productAPI, categoryAPI } from '../../api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        deliveryCharge: '50',
        comparePrice: '',
        category: '',
        stock: '',
        sku: '',
        allowTextCustomization: false,
        textCustomizationLabel: 'Add your message',
        textCustomizationMaxLength: '100',
        textCustomizationPrice: '0',
        allowPhotoCustomization: false,
        photoCustomizationLabel: 'Upload your photo',
        photoCustomizationPrice: '0',
        maxPhotos: '1',
        tags: '',
        occasion: [],
        recipientType: [],
        isActive: true,
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        hasVariants: false,
        variantType: 'None',
        variants: []
    });

    const defaultOccasions = ['birthday', 'anniversary', 'wedding', 'valentine', 'christmas', 'graduation', 'baby-shower', 'other'];
    const defaultRecipients = ['him', 'her', 'kids', 'parents', 'friends', 'colleagues', 'unisex'];

    const [occasions, setOccasions] = useState(defaultOccasions);
    const [recipients, setRecipients] = useState(defaultRecipients);
    const [newOccasion, setNewOccasion] = useState('');
    const [newRecipient, setNewRecipient] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchFilters();
        if (isEdit) fetchProduct();
    }, [id]);

    const fetchFilters = async () => {
        try {
            const { data } = await productAPI.getFilters();
            // Merge API values with defaults (no duplicates)
            const mergedOccasions = [...new Set([...defaultOccasions, ...(data.occasions || [])])];
            const mergedRecipients = [...new Set([...defaultRecipients, ...(data.recipients || [])])];
            setOccasions(mergedOccasions);
            setRecipients(mergedRecipients);
        } catch (error) {
            console.error('Failed to fetch filters:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await categoryAPI.getAllAdmin();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data } = await productAPI.getById(id);
            setFormData({
                name: data.name,
                description: data.description,
                shortDescription: data.shortDescription || '',
                price: data.price.toString(),
                deliveryCharge: data.deliveryCharge?.toString() || '50',
                comparePrice: data.comparePrice?.toString() || '',
                category: data.category?._id || '',
                stock: data.stock.toString(),
                sku: data.sku || '',
                allowTextCustomization: data.allowTextCustomization,
                textCustomizationLabel: data.textCustomizationLabel,
                textCustomizationMaxLength: data.textCustomizationMaxLength.toString(),
                textCustomizationPrice: data.textCustomizationPrice.toString(),
                allowPhotoCustomization: data.allowPhotoCustomization,
                photoCustomizationLabel: data.photoCustomizationLabel,
                photoCustomizationPrice: data.photoCustomizationPrice.toString(),
                maxPhotos: data.maxPhotos.toString(),
                tags: data.tags?.join(', ') || '',
                occasion: data.occasion || [],
                recipientType: data.recipientType || [],
                isActive: data.isActive,
                isFeatured: data.isFeatured,
                isNewArrival: data.isNewArrival,
                isBestSeller: data.isBestSeller,
                hasVariants: data.hasVariants || false,
                variantType: data.variantType || 'None',
                variants: data.variants ? data.variants.map(v => ({
                    value: v.value || '',
                    price: v.price ? v.price.toString() : '0',
                    existingImage: v.image,
                    imageFile: null
                })) : []
            });
            setExistingImages(data.images || []);
        } catch (error) {
            toast.error('Failed to load product');
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        const newImages = [...images, ...acceptedFiles].slice(0, 5);
        setImages(newImages);

        const newPreviews = newImages.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviews);
    }, [images]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxFiles: 5
    });

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        setPreviewUrls(newImages.map(file => URL.createObjectURL(file)));
    };

    const removeExistingImage = (index) => {
        setExistingImages(existingImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.category) {
            toast.error('Please fill in required fields');
            return;
        }

        setSaving(true);
        try {
            const submitData = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'variants') return; // Handled separately
                if (Array.isArray(value)) {
                    submitData.append(key, value.join(','));
                } else if (typeof value === 'boolean') {
                    submitData.append(key, value.toString());
                } else {
                    submitData.append(key, value);
                }
            });

            images.forEach(img => submitData.append('images', img));
            submitData.append('existingImages', JSON.stringify(existingImages));

            if (formData.hasVariants) {
                let variantImagesCount = 0;
                const formattedVariants = formData.variants.map((v) => {
                    const mapped = { value: v.value, price: Number(v.price) };
                    if (v.imageFile) {
                        submitData.append('variantImages', v.imageFile);
                        mapped.imageIndex = variantImagesCount++;
                    } else if (v.existingImage) {
                        mapped.existingImage = v.existingImage;
                    }
                    return mapped;
                });
                submitData.append('variants', JSON.stringify(formattedVariants));
            }

            if (isEdit) {
                await productAPI.update(id, submitData);
                toast.success('Product updated!');
            } else {
                await productAPI.create(submitData);
                toast.success('Product created!');
            }

            navigate('/admin/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const toggleArray = (field, value) => {
        const current = formData[field];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        setFormData({ ...formData, [field]: updated });
    };

    const addVariant = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, { value: '', price: '0', imageFile: null, existingImage: null }]
        });
    };

    const removeVariant = (index) => {
        const newVariants = [...formData.variants];
        newVariants.splice(index, 1);
        setFormData({ ...formData, variants: newVariants });
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData({ ...formData, variants: newVariants });
    };

    const handleVariantImageChange = (index, e) => {
        if (e.target.files && e.target.files[0]) {
            const newVariants = [...formData.variants];
            newVariants[index].imageFile = e.target.files[0];
            setFormData({ ...formData, variants: newVariants });
        }
    };

    if (loading) return <Loading />;

    return (
        <div>
            <button
                onClick={() => navigate('/admin/products')}
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Products
            </button>

            <h1 className="font-display text-3xl font-bold text-white mb-8">
                {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card p-6">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary-400" />
                                Basic Information
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-neutral-400 mb-2">Short Description</label>
                                    <input
                                        type="text"
                                        value={formData.shortDescription}
                                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                        className="input-field"
                                        placeholder="Brief description for cards"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-neutral-400 mb-2">Full Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input-field resize-none h-32"
                                        placeholder="Detailed product description"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-2">Category *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="input-field"
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-2">SKU</label>
                                        <input
                                            type="text"
                                            value={formData.sku}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                            className="input-field"
                                            placeholder="Product SKU"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="card p-6">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-primary-400" />
                                Product Images
                            </h2>

                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-white/20 hover:border-white/40'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
                                <p className="text-neutral-300 mb-1">Drag & drop images here</p>
                                <p className="text-neutral-500 text-sm">or click to browse (max 5 images)</p>
                            </div>

                            {/* Image Previews */}
                            {(existingImages.length > 0 || previewUrls.length > 0) && (
                                <div className="flex flex-wrap gap-4 mt-4">
                                    {existingImages.map((img, i) => (
                                        <div key={`existing-${i}`} className="relative w-24 h-24 rounded-xl overflow-hidden">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(i)}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {previewUrls.map((url, i) => (
                                        <div key={`new-${i}`} className="relative w-24 h-24 rounded-xl overflow-hidden">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Variants */}
                        <div className="card p-6">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-400" />
                                Sizes / Frames (Variants)
                            </h2>

                            <label className="flex items-center gap-3 cursor-pointer mb-6">
                                <input
                                    type="checkbox"
                                    checked={formData.hasVariants}
                                    onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })}
                                    className="checkbox-custom"
                                />
                                <span className="text-white font-medium">Enable Sizes or Frames</span>
                            </label>

                            {formData.hasVariants && (
                                <div className="space-y-6 pl-8 border-l border-white/10">
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-2">Variant Type</label>
                                        <select
                                            value={formData.variantType}
                                            onChange={(e) => setFormData({ ...formData, variantType: e.target.value })}
                                            className="input-field"
                                        >
                                            <option value="None">None</option>
                                            <option value="Size">Size</option>
                                            <option value="Frame">Frame</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.variants.map((variant, index) => (
                                            <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 relative">
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(index)}
                                                    className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                                    <div>
                                                        <label className="block text-xs text-neutral-400 mb-1">Value (e.g. 5x7 or Standard)</label>
                                                        <input
                                                            type="text"
                                                            value={variant.value}
                                                            onChange={(e) => handleVariantChange(index, 'value', e.target.value)}
                                                            className="input-field"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-neutral-400 mb-1">Price (₹)</label>
                                                        <input
                                                            type="number"
                                                            value={variant.price}
                                                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                                            className="input-field"
                                                        />
                                                    </div>
                                                    <div className="lg:col-span-2">
                                                        <label className="block text-xs text-neutral-400 mb-1">Variant Image</label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleVariantImageChange(index, e)}
                                                                className="input-field block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                                            />
                                                        </div>
                                                        {(variant.imageFile || variant.existingImage) && (
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <span className="text-xs text-green-400">✓ Image selected</span>
                                                                {variant.existingImage && !variant.imageFile && (
                                                                    <img src={variant.existingImage} alt="Variant" className="w-8 h-8 rounded object-cover" />
                                                                )}
                                                                {variant.imageFile && (
                                                                    <span className="text-xs text-neutral-400 truncate w-32">{variant.imageFile.name}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={addVariant}
                                            className="btn-secondary w-full"
                                        >
                                            + Add Variant
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Customization Options */}
                        <div className="card p-6">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary-400" />
                                Customization Options
                            </h2>

                            {/* Text Customization */}
                            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                                <label className="flex items-center gap-3 cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        checked={formData.allowTextCustomization}
                                        onChange={(e) => setFormData({ ...formData, allowTextCustomization: e.target.checked })}
                                        className="checkbox-custom"
                                    />
                                    <span className="text-white font-medium">Allow Text Customization</span>
                                </label>

                                {formData.allowTextCustomization && (
                                    <div className="space-y-4 pl-8">
                                        <div>
                                            <label className="block text-sm text-neutral-400 mb-2">Label</label>
                                            <input
                                                type="text"
                                                value={formData.textCustomizationLabel}
                                                onChange={(e) => setFormData({ ...formData, textCustomizationLabel: e.target.value })}
                                                className="input-field"
                                                placeholder="Add your message"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Max Characters</label>
                                                <input
                                                    type="number"
                                                    value={formData.textCustomizationMaxLength}
                                                    onChange={(e) => setFormData({ ...formData, textCustomizationMaxLength: e.target.value })}
                                                    className="input-field"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Additional Price (₹)</label>
                                                <input
                                                    type="number"
                                                    value={formData.textCustomizationPrice}
                                                    onChange={(e) => setFormData({ ...formData, textCustomizationPrice: e.target.value })}
                                                    className="input-field"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Photo Customization */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <label className="flex items-center gap-3 cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        checked={formData.allowPhotoCustomization}
                                        onChange={(e) => setFormData({ ...formData, allowPhotoCustomization: e.target.checked })}
                                        className="checkbox-custom"
                                    />
                                    <span className="text-white font-medium">Allow Photo Customization</span>
                                </label>

                                {formData.allowPhotoCustomization && (
                                    <div className="space-y-4 pl-8">
                                        <div>
                                            <label className="block text-sm text-neutral-400 mb-2">Label</label>
                                            <input
                                                type="text"
                                                value={formData.photoCustomizationLabel}
                                                onChange={(e) => setFormData({ ...formData, photoCustomizationLabel: e.target.value })}
                                                className="input-field"
                                                placeholder="Upload your photo"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Max Photos</label>
                                                <input
                                                    type="number"
                                                    value={formData.maxPhotos}
                                                    onChange={(e) => setFormData({ ...formData, maxPhotos: e.target.value })}
                                                    className="input-field"
                                                    min="1"
                                                    max="5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-neutral-400 mb-2">Additional Price (₹)</label>
                                                <input
                                                    type="number"
                                                    value={formData.photoCustomizationPrice}
                                                    onChange={(e) => setFormData({ ...formData, photoCustomizationPrice: e.target.value })}
                                                    className="input-field"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pricing */}
                        <div className="card p-6">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary-400" />
                                Pricing & Stock
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-2">Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="input-field"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-2">Compare at Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.comparePrice}
                                        onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                                        className="input-field"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-2">Delivery Charge (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.deliveryCharge}
                                        onChange={(e) => setFormData({ ...formData, deliveryCharge: e.target.value })}
                                        className="input-field"
                                        placeholder="50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-2">Stock *</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="input-field"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="card p-6">
                            <h2 className="font-semibold text-white mb-4">Status</h2>

                            <div className="space-y-3">
                                {[
                                    { key: 'isActive', label: 'Active' },
                                    { key: 'isFeatured', label: 'Featured' },
                                    { key: 'isNewArrival', label: 'New Arrival' },
                                    { key: 'isBestSeller', label: 'Best Seller' }
                                ].map((item) => (
                                    <label key={item.key} className="flex items-center justify-between cursor-pointer">
                                        <span className="text-neutral-300">{item.label}</span>
                                        <div
                                            onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key] })}
                                            className={`toggle-switch ${formData[item.key] ? 'active' : ''}`}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Occasion */}
                        <div className="card p-6">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary-400" />
                                Occasions
                            </h2>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {occasions.map((occ) => (
                                    <button
                                        key={occ}
                                        type="button"
                                        onClick={() => toggleArray('occasion', occ)}
                                        className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${formData.occasion.includes(occ)
                                            ? 'gradient-aurora text-white'
                                            : 'glass text-neutral-400 hover:text-white'
                                            }`}
                                    >
                                        {occ}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newOccasion}
                                    onChange={(e) => setNewOccasion(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = newOccasion.trim().toLowerCase();
                                            if (val && !occasions.includes(val)) {
                                                setOccasions([...occasions, val]);
                                                toggleArray('occasion', val);
                                            }
                                            setNewOccasion('');
                                        }
                                    }}
                                    className="input-field text-sm py-2 flex-1"
                                    placeholder="Type new occasion..."
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const val = newOccasion.trim().toLowerCase();
                                        if (val && !occasions.includes(val)) {
                                            setOccasions([...occasions, val]);
                                            toggleArray('occasion', val);
                                        }
                                        setNewOccasion('');
                                    }}
                                    className="btn-secondary px-3 py-2 flex items-center gap-1 text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                        </div>

                        {/* Recipients */}
                        <div className="card p-6">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-400" />
                                Recipients
                            </h2>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {recipients.map((rec) => (
                                    <button
                                        key={rec}
                                        type="button"
                                        onClick={() => toggleArray('recipientType', rec)}
                                        className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${formData.recipientType.includes(rec)
                                            ? 'gradient-aurora text-white'
                                            : 'glass text-neutral-400 hover:text-white'
                                            }`}
                                    >
                                        For {rec}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newRecipient}
                                    onChange={(e) => setNewRecipient(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = newRecipient.trim().toLowerCase();
                                            if (val && !recipients.includes(val)) {
                                                setRecipients([...recipients, val]);
                                                toggleArray('recipientType', val);
                                            }
                                            setNewRecipient('');
                                        }
                                    }}
                                    className="input-field text-sm py-2 flex-1"
                                    placeholder="Type new recipient..."
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const val = newRecipient.trim().toLowerCase();
                                        if (val && !recipients.includes(val)) {
                                            setRecipients([...recipients, val]);
                                            toggleArray('recipientType', val);
                                        }
                                        setNewRecipient('');
                                    }}
                                    className="btn-secondary px-3 py-2 flex items-center gap-1 text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="card p-6">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-primary-400" />
                                Tags
                            </h2>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="input-field"
                                placeholder="tag1, tag2, tag3"
                            />
                            <p className="text-xs text-neutral-500 mt-2">Separate tags with commas</p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
