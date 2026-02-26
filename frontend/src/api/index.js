import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    adminRegister: (data) => api.post('/auth/admin/register', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    getUsers: (params) => api.get('/auth/users', { params }),
    updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
    deleteUser: (id) => api.delete(`/auth/users/${id}`)
};

// Category API
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getAllAdmin: () => api.get('/categories/all'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/categories/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/categories/${id}`)
};

// Product API
export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getAdmin: (params) => api.get('/products/admin', { params }),
    getFeatured: () => api.get('/products/featured'),
    getFilters: () => api.get('/products/filters'),
    getNewArrivals: () => api.get('/products/new-arrivals'),
    getBestSellers: () => api.get('/products/best-sellers'),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/products/${id}`)
};

// Cart API
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (data) => api.post('/cart', data),
    update: (itemId, data) => api.put(`/cart/${itemId}`, data),
    remove: (itemId) => api.delete(`/cart/${itemId}`),
    clear: () => api.delete('/cart'),
    applyCoupon: (couponCode) => api.put('/cart/coupon', { couponCode })
};

// Order API
export const orderAPI = {
    getMyOrders: (params) => api.get('/orders', { params }),
    getAll: (params) => api.get('/orders/admin', { params }),
    getStats: () => api.get('/orders/stats'),
    getById: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
    updatePayment: (id, data) => api.put(`/orders/${id}/pay`, data),
    cancel: (id) => api.put(`/orders/${id}/cancel`),
    uploadCustomization: (data) => api.post('/orders/upload-customization', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Payment API (PhonePe)
export const paymentAPI = {
    initiate: (data) => api.post('/payment/initiate', data),
    verify: (data) => api.post('/payment/verify', data),
    getStatus: (merchantTransactionId) => api.get(`/payment/status/${merchantTransactionId}`)
};

// Review API
export const reviewAPI = {
    getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
    create: (data) => api.post('/reviews', data),
    delete: (id) => api.delete(`/reviews/${id}`)
};

// Wishlist API
export const wishlistAPI = {
    get: () => api.get('/auth/wishlist'),
    add: (id) => api.post(`/auth/wishlist/${id}`),
    remove: (id) => api.delete(`/auth/wishlist/${id}`)
};

export default api;
