import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
const app = express()

const PORT = process.env.PORT || 4000

app.get('/api/jokes',(req,res)=>{
    const jokes = [
        {
            id:1,
            title:'A joke',
            content:'This is a joke'
        },
        {
            id:2,
            title:'Another joke',
            content:'This is another joke'
        },
        {
            id:3,
            title:'A third joke',
            content:'This is third joke'
        }
    ]
    res.send(jokes)
})

app.listen(PORT,()=>{
    console.log(`Serving at ${PORT}`)
})