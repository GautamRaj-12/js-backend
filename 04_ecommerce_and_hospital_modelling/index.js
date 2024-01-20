import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
const app = express()

const PORT = process.env.PORT || 5500

app.listen(PORT,()=>{
    console.log(`server running at ${PORT}`)
})