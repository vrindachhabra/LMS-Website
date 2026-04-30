import mongoose from "mongoose";

// Connect to the MongoDB database
const connectDB = async () => {
    try {
        //registering the event
        mongoose.connection.on('connected', () => console.log('Database Connected'))
        mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err))

        //connect with database
        const uri = process.env.MONGODB_URI
        if (!uri) throw new Error('Missing MONGODB_URI environment variable')

        await mongoose.connect(uri)
    } catch (error) {
        console.error('Database connection failed:', error)
        process.exit(1)
    }
}

export default connectDB