const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const jsdom = require("jsdom")
const jquery = require("jquery")(new jsdom.JSDOM().window)
const session = require("express-session")
const { name } = require("ejs")
const { url } = require("inspector")
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
    "manager":String,
    "inoculate":String
    }
AppointmentSchema = {
    "name": String,
    "age":String,
    "gender":String,
    "company":String,
    "handle":String
    }
var User = mongoose.model("users",UserSchema,"users")
var Appointment = mongoose.model("appointments",AppointmentSchema,"appointments")

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
            if(user.manager=="1"){
                res.render("employer.html",{longinname:username,info:"null"})
                res.sendFile(__dirname+"/views/employer.html")
            }else{
                res.render("frontpage.html",{longinname:username})
                res.sendFile(__dirname+"/views/frontpage.html")
            }
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
    //处理重复账号出现的情况
    User.findOne({"account":account},(err,user)=>{
        if(user!=null){
            res.render("reg.html",{info:"已存在该账号，请更换账号"})
            res.sendFile(__dirname+"/views/reg.html")
        }else{
            User.findOne({"username":username},(err,user)=>{
                if(user!=null){
                    res.render("reg.html",{info:"已存在该用户名，请更换用户名"})
                    res.sendFile(__dirname+"/views/reg.html")
                }else{
                    if(account!=""&&password!=""&&username!=""&&age!=""&&gender!=""){
                        User.insertMany({"account":account,"password": password,"name": username,"age":age,"gender":gender,"manager":0,"inoculate":"0"})
                        res.render("frontpage.html",{longinname:username})
                        res.sendFile(__dirname+"/views/frontpage.html")
                    }else{
                        res.render("reg.html",{info:"请输入完整注册信息"})
                        res.sendFile(__dirname+"/views/reg.html")
                    }
                }
            })
        }
    })
})
//进行密码修改操作
app.get('/change',(req,res)=>{
    username = req.query.username
    old_pass = req.query.old_pass
    new_pass1 = req.query.new_pass1
    new_pass2 = req.query.new_pass2
    User.findOne({"username":username},(err,user)=>{
        if(user.password!=old_pass){
            res.render("change_pass.html",{longinname:username,info:"旧密码错误"})
            res.sendFile(__dirname+"/views/change_pass.html")
        }else if(new_pass1!=new_pass2){
            res.render("change_pass.html",{longinname:username,info:"请确保两次密码一致"})
            res.sendFile(__dirname+"/views/change_pass.html")
        }else{
            User.updateOne({"username":username},{"password":new_pass1},(err, k)=>{
                res.render("change_pass.html",{longinname:username,info:"修改密码成功"})
                res.sendFile(__dirname+"/views/change_pass.html")
            })
        }
    })
})
//提交预约申请
app.get('/appointment',(req,res)=>{
    username = req.query.username
    company = req.query.company
    Appointment.findOne({"name":username},(err,app)=>{
        if(app!=null){
            res.render("employee.html",{longinname:username,info:"您已经预约，请等待处理"})
            res.sendFile(__dirname+"/views/employee.html")
        }else{
            User.findOne({"username":username},(err,user)=>{
                Appointment.insertMany({"name":username ,"age":user.age,"gender":user.gender,"company":company,"handle":"0"})
                res.render("employee.html",{longinname:username,info:"预约成功"})
                res.sendFile(__dirname+"/views/employee.html")
            })
        }
    })
})
//获取所有预约
app.get('/list', (req, res) => {
    username = req.url.split("?")[1]
    var htmlRe = ""
    Appointment.count((err, counts) => {
        if (counts) {
            htmlRe = htmlRe + "<table class='table col-sm-12'><thead><tr><th scope='col'>申请者</th><th scope='col'>年龄</th><th scope='col'>性别</th><th scope='col'>预约公司</th><th scope='col'>申请内容</th><th scope='col'>处理方式</th></tr></thead><tbody>"
            Appointment.find({"company":username}, null, null, (err, result) => {
                result.forEach((value, index) => {
                    htmlRe = htmlRe + "<tr>"
                    htmlRe = htmlRe + "<td height=10% id='name"+index+"'>"+value.name+"</td>"
                    htmlRe = htmlRe + "<td id='number"+index+"'>"+value.age+"</td>"
                    htmlRe = htmlRe + "<td id='lou"+index+"'>"+value.gender+"</td>"
                    htmlRe = htmlRe + "<td id='hu"+index+"'>"+value.company+"</td>"
                    if(value.handle=="0"){
                        htmlRe = htmlRe + "<td id='statu"+index+"'>"+"未处理"+"</td>"
                        htmlRe = htmlRe + "<td id='acc"+index+"'><button class='btn btn-primary' onclick = 'acc("+index+")'>接受预约</td>"
                    }else{
                        htmlRe = htmlRe + "<td id='statu"+index+"'>"+"已处理"+"</td>"
                    }
                })
                htmlRe = htmlRe + "</tbody></table>"
                res.send(htmlRe)
            })
        } else {
            res.send("<p>没有请求</p>")
        }
    })
})
//接受预约操作
app.get('/accept', (req, res) => {
    username = req.url.split("?")[1]
    Appointment.updateOne({"name":username},{"handle":"1"},(err,a)=>{
        res.send("<p id = 'info' style='color:red;margin-bottom: 0%;'>操作成功</p>")
    })
})

//跳转到首页
app.get('/frontpage',(req,res)=>{
    a = req.url.split("?")
    username = a[1].split("=")[1]
    res.render("frontpage.html",{longinname:username})
    res.sendFile(__dirname+"/views/frontpage.html")
})
//跳转到个人信息页面
app.get('/personal',(req,res)=>{
    a = req.url.split("?")
    username = a[1].split("=")[1]
    User.findOne({"username":username},(err,user)=>{
        if(user.inoculate=="0")
            ino = "未预约"
        else
            ino = "已预约"
        res.render("personal.html",{longinname:username,account:user.account,age:user.age,gender:user.gender,inoculate:ino})
        res.sendFile(__dirname+"/views/personal.html")
    })
})

//跳转到疫苗预约页面
app.get('/employee',(req,res)=>{
    a = req.url.split("?")
    username = a[1].split("=")[1]
    res.render("employee.html",{longinname:username,info:"null"})
    res.sendFile(__dirname+"/views/employee.html")
})
//跳转到修改密码界面
app.get('/change_pass',(req,res)=>{
    a = req.url.split("?")
    username = a[1].split("=")[1]
    res.render("change_pass.html",{longinname:username,info:"null"})
    res.sendFile(__dirname+"/views/change_pass.html")
})

app.get('/photo/bg.jpg',(req,res)=>{
    res.sendFile('bg.jpg',{root:path.join(__dirname,"photo")},(err)=>{
        console.log("photo get false")
    })
})

app.listen(10309)