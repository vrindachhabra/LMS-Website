//backend framework
import express from 'express'
//to connect backend with any other domain
import cors from 'cors' 
//to use env variables 
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebHooks } from './controllers/webhooks.js'

//initialize express
const app = express()

//connect to database
await connectDB()

//middlewares
app.use(cors())

//Routes
//whenever we hit this route ("/") the following arrow function will be executed
app.get('/', (req, res) => res.send("API working"))
app.post('/clerk', express.json(), clerkWebHooks) 
//req will be passed through this json function

//getting port number from environment
const PORT = process.env.PORT || 5000

//to run the application on this port number->
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})