//backend framework
import express from 'express'
//to connect backend with any other domain
import cors from 'cors' 
//to use env variables 
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebHooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoutes.js'

//initialize express
const app = express()

//connect to database
await connectDB()
await connectCloudinary()

//middlewares
app.use(cors())
app.use(clerkMiddleware())

//Routes
//whenever we hit this route ("/") the following arrow function will be executed
app.get('/', (req, res) => res.send("API working"))
app.post('/clerk', express.json(), clerkWebHooks) 
//req will be passed through this json function
app.use('/api/educator', express.json(), educatorRouter)
app.use('/api/course', express.json(), courseRouter)
app.use('/api/user', express.json(), userRouter)
app.post('/stripe', express.raw({ type: 'application/json'}), stripeWebhooks)

//getting port number from environment
const PORT = process.env.PORT || 5000

//to run the application on this port number->
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})