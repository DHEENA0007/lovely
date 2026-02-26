import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI } from '../../api';
import Loading from '../../components/Loading';

const CategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await categoryAPI.getAll();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) return <Loading />;

    const categoryList = Array.isArray(categories) ? categories : [];
    const standardCategories = categoryList.filter(c => !c.type || c.type === 'category');
    const occasionCategories = categoryList.filter(c => c.type === 'occasion');
    const recipientCategories = categoryList.filter(c => c.type === 'recipient');

    const CategorySection = ({ title, items }) => (
        <div className="mb-12">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((cat) => (
                    <Link key={cat._id} to={`/shop?category=${cat._id}`} className="group block">
                        <div className="card overflow-hidden bg-white border border-gray-100 hover:shadow-lg transition-all duration-300">
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                        <span className="text-4xl">🎁</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                            </div>
                            <div className="p-4 text-center">
                                <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{cat.name}</h3>
                                {cat.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-display text-4xl font-bold text-gray-900 mb-8">All Categories</h1>

                {standardCategories.length > 0 && <CategorySection title="Shop by Category" items={standardCategories} />}
                {occasionCategories.length > 0 && <CategorySection title="Occasions" items={occasionCategories} />}
                {recipientCategories.length > 0 && <CategorySection title="Recipients" items={recipientCategories} />}

                {categories.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No categories found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesList;
