/**
 * Created by jihong.zjh on 2016/5/11.
 */
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const config = require("../conf/config");

let users = {};
let secret = config.secret;

function sendMail(to,content) {
    const transport = nodemailer.createTransport("SMTP",{
        host: "smtp.126.com",
        secureConnection: true,
        port: 465,
        auth: {
            user: "favlinks@126.com",
            pass: config.mailPass
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

//加解密
function encrypt(str,secret) {
    const cipher = crypto.createCipher('aes192',secret);
    let enc = cipher.update(str,'utf8','hex');
    enc += cipher.final('hex');
    return enc;
}

function decrypt(str,secret) {
    const decipher = crypto.createDecipher('aes192',secret);
    let dec = decipher.update(str,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}
	
users.login = function (mongoose) {
    return function (req,res) {
        const headers = req.headers;
        let rawPasswd = headers['x-requested-biz'];

        const user = req.body.user,
            passwd = encrypt(rawPasswd, config.secret);

        mongoose.find("user",{user:user},function (resu) {
            //判断用户名密码
            //登录成功后写入cookie，seession，跳转
            if(resu.length){
                if(passwd === resu[0].passwd){
                    //登录成功
                    req.session.user = user;
                    req.session.isLogin = true;
                    res.json({status: 0,msg: "登录成功."});
                }else {
                    res.json({status: 1,msg: "密码错误！"});
                }
            }else {
                res.json({status: 1,msg: "该用户没有注册，请先注册！"});
            }
        });
    }
};

users.signup = function (mongoose) {
    return function (req,res) {
        const user = req.body.user,
            passwd = req.body.passwd,
            email = req.body.email;
        const encPasswd = encrypt(passwd,secret);
        
        mongoose.find("user",{user:user},function (resu) {
            if(resu.length){
                res.json({status:1,msg:"用户名已经被注册!"});
            }else {
                mongoose.insert("user",{user: user,passwd: encPasswd,email: email},function () {
                    req.session.user = user;
                    req.session.isLogin = true;
                    res.clearCookie("user",{});

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
            res.clearCookie("user",{});
            res.cookie("isLogin","false");
            res.redirect("/");
        });
    };
};

users.forget = function (mongoose) {
    return function (req, res) {
        const user = req.body.user,
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
