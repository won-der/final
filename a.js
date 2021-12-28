const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const jsdom = require("jsdom")
const jquery = require("jquery")(new jsdom.JSDOM().window)
const session = require("express-session")
const { name } = require("ejs")
var document = new jsdom.JSDOM().window.document
// const db_option = require("./db_option")
const app = express()
app.use(session({
    secret: 'sessiontest',
    resave: true,
    saveUninitialized:true
}))
//链接mongodb
mongoose.connect("mongodb://localhost:27017/finalclass")
UserSchema = {
    "account":String,
    "password": String,
    "name": String,
    "age":String,
    "gender":String,
    }
var User = mongoose.model("users",UserSchema,"users")

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/',express.static('views'))
app.use('/photo',express.static('photo'))


//处理登录的路由
app.get("/login",(req,res)=>{
    account = String(req.query.useraccount)
    password = String(req.query.userpassword)
    User.findOne({"account":account,"password":password},(err,user)=>{
        if(user!=null){ 
            username = String(user.name)
            res.render("frontpage.html",{longinname:username})
            res.sendFile(__dirname+"/views/frontpage.html")

        }
        else 
        {
            res.render("index.html",{info:"账号或密码错误"})
            res.sendFile(__dirname+"/views/index.html")
        }
        })
})

//处理注册的路由
app.get("/reg",(req,res)=>{
    account = String(req.query.account)
    password = String(req.query.password)
    username = String(req.query.username)
    age = String(req.query.age)
    gender = String(req.query.gender)

    if(account!=""&&password!=""&&username!=""&&age!=""&&gender!=""){
        User.insertMany({"account":account,"password": password,"name": username,"age":age,"gender":gender})
        res.render("frontpage.html",{longinname:username})
        res.sendFile(__dirname+"/views/frontpage.html")
    }else{
        res.render("reg.html",{info:"请输入完整注册信息"})
        res.sendFile(__dirname+"/views/reg.html")
    }
})


app.get('/photo/bg.jpg',(req,res)=>{
    res.sendFile('bg.jpg',{root:path.join(__dirname,"photo")},(err)=>{
        console.log("photo get false")
    })
})
app.listen(10309)