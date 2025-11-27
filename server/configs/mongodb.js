import mongoose from "mongoose";

//Connect to the MongoDB database
const connectDB = async () => {

    //registering the event
    mongoose.connection.on('connected', () => console.log('Database Connected'))

    //connect with database
    await mongoose.connect(`${process.env.MONGODB_URI}/lms`) //this is the mongodb connection string
}

export default connectDB