const mongoose = require("mongoose")
//mongoose.connect("mongodb://172.21.2.236:27017/190110910309")
mongoose.connect("mongodb://localhost:27017/finalclass")
UserSchema = {
    "account":String,
    "password": String,
    "name": String,
    "date":{
        "$date": Date
      },
    }
var User = mongoose.model("users",UserSchema,"users")

function login(account,password){
    return new Promise((resolve,reject)=>{
    User.findOne({"account":account,"password":password},(err,user)=>{
        
        if(err==null){ 
            
            username = String(user.name)
            resolve(username)
        }
        else 
        {
            console.log(err)
            resolve("0")
        }
        })
    })
}

module.exports = {login}