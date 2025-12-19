const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Railway uses MONGO_URL, but we support both MONGO_URI and MONGO_URL
        const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

        if (!mongoUri) {
            console.error('MONGO_URI or MONGO_URL is not defined in environment variables');
            console.error('Please set MONGO_URI in your Railway project settings');
            process.exit(1);
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
