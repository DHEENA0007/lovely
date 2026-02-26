const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    await connectDB();

    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@lovelygifts.co.in' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit();
        }

        // Create admin user
        const admin = await User.create({
            name: 'Lovely Admin',
            email: 'admin@lovelygifts.co.in',
            password: 'Admin@123',
            role: 'admin',
            phone: '',
            isActive: true
        });

        console.log(`Admin user created successfully!`);
        console.log(`Email: admin@lovelygifts.co.in`);
        console.log(`Password: Admin@123`);
        process.exit();
    } catch (error) {
        console.error(`Error creating admin: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
