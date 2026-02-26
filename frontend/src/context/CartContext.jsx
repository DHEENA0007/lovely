import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart({ items: [] });
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const { data } = await cartAPI.get();
            setCart(data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1, customization = {}) => {
        try {
            const { data } = await cartAPI.add({ productId, quantity, customization });
            setCart(data);
            toast.success('Added to cart!');
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
            throw error;
        }
    };

    const updateCartItem = async (itemId, quantity, customization) => {
        try {
            const { data } = await cartAPI.update(itemId, { quantity, customization });
            setCart(data);
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update cart');
            throw error;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const { data } = await cartAPI.remove(itemId);
            setCart(data);
            toast.success('Item removed');
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove item');
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            await cartAPI.clear();
            setCart({ items: [] });
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    const getCartTotal = () => {
        if (!cart.items?.length) return { subtotal: 0, customizationTotal: 0, total: 0 };

        let subtotal = 0;
        let customizationTotal = 0;

        cart.items.forEach(item => {
            const product = item.product;
            if (!product) return;

            let basePrice = product.price;
            if (item.customization?.variant?.price) {
                basePrice = item.customization.variant.price;
            }

            const itemPrice = basePrice * item.quantity;
            subtotal += itemPrice;

            if (item.customization?.text?.enabled && product.allowTextCustomization) {
                customizationTotal += product.textCustomizationPrice * item.quantity;
            }
            if (item.customization?.photo?.enabled && product.allowPhotoCustomization) {
                customizationTotal += product.photoCustomizationPrice * item.quantity;
            }
        });

        return {
            subtotal,
            customizationTotal,
            total: subtotal + customizationTotal
        };
    };

    const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addToCart,
            updateCartItem,
            removeFromCart,
            clearCart,
            fetchCart,
            getCartTotal,
            itemCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
