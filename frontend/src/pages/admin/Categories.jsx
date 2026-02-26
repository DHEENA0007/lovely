import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { categoryAPI } from '../../api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', image: '', isActive: true, type: 'category' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await categoryAPI.getAllAdmin();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                image: category.image || '',
                isActive: category.isActive,
                type: category.type || 'category'
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '', image: '', isActive: true, type: 'category' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Log the data being sent
            console.log('Submitting form data:', formData);

            // Since we're not dealing with file uploads directly here (yet), just sending JSON is easier, 
            // but the existing code used FormData, probably for future image support. 
            // Let's stick to FormData or JSON. If the backend expects JSON, FormData might be tricky unless handled.
            // Let's assume the API handles JSON if we don't use FormData, OR we append correctly.

            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('description', formData.description || '');
            submitData.append('isActive', formData.isActive);
            submitData.append('type', formData.type);
            if (formData.image) {
                submitData.append('image', formData.image);
            }

            if (editingCategory) {
                await categoryAPI.update(editingCategory._id, submitData);
                toast.success('Category updated successfully');
            } else {
                await categoryAPI.create(submitData);
                toast.success('Category created successfully');
            }

            setShowModal(false);
            fetchCategories();
            setFormData({ name: '', description: '', image: '', isActive: true, type: 'category' }); // Reset form
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await categoryAPI.delete(id);
            setCategories(categories.filter(c => c._id !== id));
            toast.success('Category deleted');
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'occasion': return 'bg-purple-500/20 text-purple-400';
            case 'recipient': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-neutral-500/20 text-neutral-400';
        }
    };

    if (loading) return <Loading />;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-white mb-2">Categories</h1>
                    <p className="text-neutral-400">Manage categories, occasions, and recipients</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <div key={category._id} className="card p-6 relative group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 rounded-xl gradient-aurora flex items-center justify-center text-2xl">
                                {category.type === 'occasion' ? '🎉' : category.type === 'recipient' ? '🎁' : '📁'}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openModal(category)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider ${getTypeColor(category.type)}`}>
                                {category.type}
                            </span>
                        </div>

                        <h3 className="font-semibold text-white text-lg mb-1">{category.name}</h3>
                        <p className="text-neutral-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                            {category.description || 'No description provided'}
                        </p>

                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${category.isActive ? 'bg-green-500/20 text-green-400' : 'bg-neutral-500/20 text-neutral-400'
                            }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="card p-12 text-center">
                    <p className="text-neutral-400 mb-4">No categories found</p>
                    <button onClick={() => openModal()} className="btn-primary inline-flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create Your First Category
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
                    <div className="card p-8 w-full max-w-md shadow-2xl border border-white/10">
                        <h2 className="font-display text-2xl font-bold text-white mb-6">
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="input-field appearance-none"
                                >
                                    <option value="category">Category (General)</option>
                                    <option value="occasion">Occasion</option>
                                    <option value="recipient">Recipient</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g. Birthday, For Her, Electronics"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Category Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setFormData({ ...formData, image: e.target.files[0] });
                                        }
                                    }}
                                    className="input-field"
                                />
                                {formData.image && typeof formData.image === 'string' && (
                                    <div className="mt-2 text-xs text-neutral-500 truncate">
                                        Current: {formData.image}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field resize-none h-24"
                                    placeholder="Optional description"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                                <span className="text-neutral-300">Active Status</span>
                                <div
                                    className={`toggle-switch ${formData.isActive ? 'active' : ''}`}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
