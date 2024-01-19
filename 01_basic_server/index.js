require('dotenv').config()
const express = require('express')
const app = express()

const PORT = process.env.PORT || 3000

app.get('/',(req,res)=>{
    res.send('Hello World')
})

app.get('/login',(req,res)=>{
    res.send('<h2>Login Here</h2>')
})
app.listen(PORT,()=>{
    console.log(`Serving on port ${PORT}`)
})