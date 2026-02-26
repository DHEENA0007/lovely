const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected.');
    } catch (error) {
        console.error('Connection Error:', error);
        process.exit(1);
    }
};

const updateProducts = async () => {
    await connectDB();

    try {
        const products = await Product.find({});
        if (products.length === 0) {
            console.log('No products found');
            process.exit(0);
        }

        // Shuffle products randomly
        const shuffled = products.sort(() => 0.5 - Math.random());

        // Take first 8 for featured
        const featuredIds = shuffled.slice(0, Math.min(8, shuffled.length)).map(p => p._id);

        // Take next 8 for new arrivals
        const remaining = shuffled.slice(featuredIds.length);
        const newArrivalIds = remaining.slice(0, Math.min(8, remaining.length)).map(p => p._id);

        // Reset all products first
        await Product.updateMany({}, {
            $set: { isFeatured: false, isNewArrival: false, isBestSeller: false }
        });

        // Update featured
        if (featuredIds.length > 0) {
            await Product.updateMany(
                { _id: { $in: featuredIds } },
                { $set: { isFeatured: true, isBestSeller: true } }
            );
            console.log(`Updated ${featuredIds.length} products to be Featured & Best Sellers.`);
        }

        // Update new arrivals
        if (newArrivalIds.length > 0) {
            await Product.updateMany(
                { _id: { $in: newArrivalIds } },
                { $set: { isNewArrival: true } }
            );
            console.log(`Updated ${newArrivalIds.length} products to be New Arrivals.`);
        }

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating products:', error);
        process.exit(1);
    }
};

updateProducts();
