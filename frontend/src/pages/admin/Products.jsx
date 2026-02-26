import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, MoreVertical, Image, Sparkles } from 'lucide-react';
import { productAPI, categoryAPI } from '../../api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [search, selectedCategory, page]);

    const fetchCategories = async () => {
        try {
            const { data } = await categoryAPI.getAllAdmin();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (selectedCategory) params.category = selectedCategory;

            const { data } = await productAPI.getAdmin(params);
            setProducts(data.products);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productAPI.delete(id);
            setProducts(products.filter(p => p._id !== id));
            toast.success('Product deleted');
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-white mb-2">Products</h1>
                    <p className="text-neutral-400">Manage your product catalog</p>
                </div>
                <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Product
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="input-field"
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input-field w-48"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <Loading />
                ) : products.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-4 text-neutral-400 font-medium">Product</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">Category</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">Price</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">Stock</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">Customization</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">Status</th>
                                    <th className="text-right p-4 text-neutral-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.images?.[0] || '/placeholder.jpg'}
                                                    alt={product.name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium text-white">{product.name}</p>
                                                    <p className="text-xs text-neutral-500">{product.sku || 'No SKU'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-neutral-300">
                                            {product.category?.name || '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-white font-medium">₹{product.price.toLocaleString()}</span>
                                            {product.comparePrice > product.price && (
                                                <span className="text-neutral-500 line-through text-sm ml-2">
                                                    ₹{product.comparePrice.toLocaleString()}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                {product.allowTextCustomization && (
                                                    <span className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center" title="Text Customization">
                                                        <Sparkles className="w-3 h-3 text-purple-400" />
                                                    </span>
                                                )}
                                                {product.allowPhotoCustomization && (
                                                    <span className="w-6 h-6 rounded bg-pink-500/20 flex items-center justify-center" title="Photo Customization">
                                                        <Image className="w-3 h-3 text-pink-400" />
                                                    </span>
                                                )}
                                                {!product.allowTextCustomization && !product.allowPhotoCustomization && (
                                                    <span className="text-neutral-500 text-sm">None</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${product.isActive ? 'bg-green-500/20 text-green-400' : 'bg-neutral-500/20 text-neutral-400'
                                                }`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/product/${product._id}`}
                                                    target="_blank"
                                                    className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    to={`/admin/products/${product._id}/edit`}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-neutral-400 mb-4">No products found</p>
                        <Link to="/admin/products/new" className="btn-primary inline-flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Add Your First Product
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center p-4 border-t border-white/10">
                        <div className="flex gap-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-lg transition-all ${page === i + 1
                                        ? 'gradient-aurora text-white'
                                        : 'glass hover:bg-white/10 text-neutral-400'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
