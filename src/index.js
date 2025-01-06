import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from 'dotenv'
dotenv.config()

console.log(process.env.MONGODB_URI)


connectDB()
.then(()=>{

    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port: ${process.env.PORT}`)
    })

    app.on("error",(error)=>{
        console.log('error occur',error)
        throw error
    })
})
.catch((error) =>{
    console.log("Mongodb connection failed ", error)
})