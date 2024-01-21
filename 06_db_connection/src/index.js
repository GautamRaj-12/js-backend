import dotenv from 'dotenv'
dotenv.config()
import connectDB from './db/connection.js'

connectDB()

/*import express from 'express'
const app = express()

import dotenv from 'dotenv'
dotenv.config()


;(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERR: ",error);
            throw error;
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    }catch(error){
        console.error("ERROR: ",error);
        throw error;
    }
})()
*/
