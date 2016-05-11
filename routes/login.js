/**
 * Created by jihong.zjh on 2016/5/11.
 */
var nodemailer = require('nodemailer');
var users = {};

function sendMail(to,content) {
    var transport = nodemailer.createTransport("SMTP",{
        host: "smtp.126.com",
        secureConnection: true,
        port: 465,
        auth: {
            user: "favlinks@126.com",
            pass: "qazxsw11111"
        }
    });

    transport.sendMail({
        from: "favlinks@126.com",
        to: to,
        subject: "忘记密码",
        text: "您在favlink.me的注册密码是： " + content
    },function(err,info){
        if(err)console.error("error:",err);
        else console.log("res:",info.message);
    });
}

users.login = function (mongoose) {
    return function (req,res) {
        var user = req.body.user,
            passwd = req.body.passwd;
        mongoose.find("user",{user:user},function (resu) {
            //判断用户名密码
            //登录成功后写入cookie，seession，跳转
            if(resu.length){
                if(passwd == resu[0].passwd){
                    //登录成功
                    console.log("test:"+user);
                    req.session.user = user;
                    console.log(req.session.user);
                    res.json({status: 0,msg: "登录成功."});
                }
            }else {
                res.json({status: 1,msg: "该用户没有注册，请先注册！"});
            }
        });
    }
};

users.signup = function (mongoose) {
    return function (req,res) {
        var user = req.body.user,
            passwd = req.body.passwd,
            email = req.body.email;

        mongoose.find("user",{user:user},function (resu) {
            console.log("res:",resu);
            if(resu.length){
                res.json({status:1,msg:"用户名已经被注册!"});
            }else {
                mongoose.insert("user",{user: user,passwd: passwd,email: email},function () {
                    req.session.user = user;
                    res.clearCookie("user");

                    res.json({status: 0,msg:"注册成功！"});
                });
            }
        });
    }  
};

users.logout = function () {
    return function (req,res) {
        //清除session,cookie
        req.session.destroy(function () {
            res.clearCookie("user");
            res.redirect("/");
        });
    };
};

users.forget = function (mongoose) {
    return function (req, res) {
        var user = req.body.user,
            email = req.body.email;
        mongoose.find("user",{user:user},function (resu) {
            if(!resu.length){
                res.json({status: 1,msg: "该用户未注册！"});
            }else {
                if(resu[0].email !== email){
                    res.json({status: 1,msg: "注册邮箱不匹配！"});
                }else {
                    //发送密码到注册邮箱
                    sendMail(email,resu[0].passwd);
                    res.json({status: 0,msg: "密码已经发送到注册邮箱，请查收！"});
                }
            }
        });
    };
};

module.exports = users;