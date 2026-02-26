import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Grid, List, X } from 'lucide-react';
import { productAPI, categoryAPI } from '../../api';
import ProductCard from '../../components/ProductCard';
import Loading from '../../components/Loading';

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        occasion: searchParams.get('occasion') || '',
        recipientType: searchParams.get('recipientType') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'newest',
        page: parseInt(searchParams.get('page')) || 1
    });

    useEffect(() => {
        fetchCategories();
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const { data } = await categoryAPI.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchFilters = async () => {
        try {
            const { data } = await productAPI.getFilters();
            setOccasions(data.occasions || []);
            setRecipients(data.recipients || []);
        } catch (error) {
            console.error('Failed to fetch filters:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params[key] = value;
            });

            const { data } = await productAPI.getAll(params);
            setProducts(data.products);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value, page: 1 };
        setFilters(newFilters);

        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v) params.set(k, v);
        });
        setSearchParams(params);
    };

    const clearFilters = () => {
        const defaultFilters = { category: '', occasion: '', recipientType: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 };
        setFilters(defaultFilters);
        setSearchParams({});
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50">
            <div className="bg-orb bg-orb-1 opacity-10" />
            <div className="bg-orb bg-orb-2 opacity-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Shop Gifts</h1>
                    <p className="text-gray-500">Discover unique gifts for every occasion</p>
                </div>

                <div className="flex gap-8">
                    {/* Filters Sidebar - Desktop */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="card p-6 sticky top-24 bg-white shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5" />
                                    Filters
                                </h3>
                                <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                    Clear All
                                </button>
                            </div>

                            {/* Categories */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Category</h4>
                                <div className="space-y-2">
                                    {categories.map((cat) => (
                                        <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={filters.category === cat._id}
                                                onChange={() => updateFilter('category', cat._id)}
                                                className="checkbox-custom"
                                            />
                                            <span className={`transition-colors ${filters.category === cat._id ? 'text-primary-600 font-medium' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                                {cat.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Occasion */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Occasion</h4>
                                <div className="space-y-2">
                                    {occasions.map((occ) => (
                                        <label key={occ} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="occasion"
                                                checked={filters.occasion === occ}
                                                onChange={() => updateFilter('occasion', occ)}
                                                className="checkbox-custom"
                                            />
                                            <span className={`capitalize transition-colors ${filters.occasion === occ ? 'text-primary-600 font-medium' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                                {occ}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Recipient */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Recipient</h4>
                                <div className="space-y-2">
                                    {recipients.map((rec) => (
                                        <label key={rec} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="recipient"
                                                checked={filters.recipientType === rec}
                                                onChange={() => updateFilter('recipientType', rec)}
                                                className="checkbox-custom"
                                            />
                                            <span className={`capitalize transition-colors ${filters.recipientType === rec ? 'text-primary-600 font-medium' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                                For {rec}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Price Range</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                                        className="input-field text-sm py-2 bg-gray-50 border-gray-200"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                                        className="input-field text-sm py-2 bg-gray-50 border-gray-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-gray-700"
                                >
                                    <Filter className="w-5 h-5" />
                                    Filters
                                </button>
                                <p className="text-gray-500">
                                    {products.length} products found
                                </p>
                            </div>

                            <select
                                value={filters.sort}
                                onChange={(e) => updateFilter('sort', e.target.value)}
                                className="input-field w-48 py-2 text-sm bg-white border-gray-200 text-gray-700"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="rating">Top Rated</option>
                            </select>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <Loading />
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-12 gap-2">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => updateFilter('page', i + 1)}
                                                className={`w-10 h-10 rounded-xl transition-all shadow-sm ${filters.page === i + 1
                                                    ? 'gradient-aurora text-white shadow-md'
                                                    : 'bg-white hover:bg-gray-50 text-gray-500 border border-gray-100'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 card bg-white border-gray-100 shadow-sm">
                                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                    <Filter className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                                <p className="text-gray-500 mb-6">Try adjusting your filters</p>
                                <button onClick={clearFilters} className="btn-primary shadow-lg">
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Mobile Filter Options (Clone of Desktop logic) */}
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Category</h4>
                                <div className="space-y-2">
                                    {categories.map((cat) => (
                                        <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="mobile-category"
                                                checked={filters.category === cat._id}
                                                onChange={() => updateFilter('category', cat._id)}
                                                className="checkbox-custom"
                                            />
                                            <span className="text-gray-600">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Occasion</h4>
                                <div className="space-y-2">
                                    {occasions.map((occ) => (
                                        <label key={occ} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="mobile-occasion"
                                                checked={filters.occasion === occ}
                                                onChange={() => updateFilter('occasion', occ)}
                                                className="checkbox-custom"
                                            />
                                            <span className="text-gray-600 capitalize">{occ}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Recipient</h4>
                                <div className="space-y-2">
                                    {recipients.map((rec) => (
                                        <label key={rec} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="mobile-recipient"
                                                checked={filters.recipientType === rec}
                                                onChange={() => updateFilter('recipientType', rec)}
                                                className="checkbox-custom"
                                            />
                                            <span className="text-gray-600 capitalize">For {rec}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Price Range</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                                        className="input-field text-sm py-2 bg-gray-50 border-gray-200"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                                        className="input-field text-sm py-2 bg-gray-50 border-gray-200"
                                    />
                                </div>
                            </div>

                            <button onClick={clearFilters} className="w-full btn-secondary mt-4">
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;
