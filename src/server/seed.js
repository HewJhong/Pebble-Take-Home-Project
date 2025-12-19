const mongoose = require('mongoose');
const { User } = require('./models');
require('dotenv').config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if admin exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
        } else {
            await User.create({
                username: 'admin',
                password: 'admin123',
                name: 'System Admin',
                role: 'admin',
                commissionRate: 0,
            });
            console.log('Created admin user: admin / admin123');
        }

        // Check if sales person exists
        const existingSales = await User.findOne({ username: 'sales1' });
        if (existingSales) {
            console.log('Sales user already exists');
        } else {
            await User.create({
                username: 'sales1',
                password: 'sales123',
                name: 'John Sales',
                role: 'sales_person',
                commissionRate: 10,
            });
            console.log('Created sales user: sales1 / sales123');
        }

        console.log('Seed completed');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedUsers();
