const express = require("express")
const mongoose = require("mongoose")

const app = express()

app.use('/',express.static('web'))
app.get("/",(req,res)=>{

    console.log("success")
})
app.listen(10309)