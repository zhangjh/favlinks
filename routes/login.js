/**
 * Created by jihong.zjh on 2016/5/11.
 */
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const config = require("../conf/config");
const request = require('request');

let users = {};
const secret = config.secret;

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
        text: "您在favlink.cn的注册密码是： " + content +
            "，\n\nfavlink.cn只存储密文，该密码明文由程序在传输过程中自动计算得出，任何人都不会获知，请放心使用。"
    },function(err,info){
        if(err)console.error("error:",err);
        else console.log("res:",info.message);
    });
}

//加解密
function encrypt(str) {
    const cipher = crypto.createCipher('aes192',secret);
    let enc = cipher.update(str,'utf8','hex');
    enc += cipher.final('hex');
    return enc;
}

function decrypt(str) {
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
            passwd = encrypt(rawPasswd);

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
                    sendMail(email,decrypt(resu[0].passwd));
                    res.json({status: 0,msg: "密码已经发送到注册邮箱，请查收！"});
                }
            }
        });
    };
};

// github登录回调
users.oauth = function (mongoose) {
    return function (req, res) {
        const code = req.query.code;
        if(!code) {
            res.json({status: 1, msg: "参数错误"});
            return;
        }

        // 拿code换取token，再换取用户信息
        const url = "https://github.com/login/oauth/access_token?client_id="
            + config.clientId + "&client_secret="
            + config.clientSecret + "&code="
            + code;
        const options = {
            headers: {
                accept: 'application/json'
            },
        };

        request.post(url, options, (e, r, body) => {
            if(e) {
                res.json({status: 1,msg: e});
                return;
            }

            let accessToken = JSON.parse(body).access_token;

            let url = "https://api.github.com/user";
            let options = {
                headers: {
                    accept: 'application/json',
                    Authorization: `token ${accessToken}`,
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.108 Safari/537.36"
                }
            };

            request.get(url, options, (e, r, body) => {
                if(e) {
                    res.json({status: 1,msg: e});
                    return;
                }
                const bodyJson = JSON.parse(body);
                const user = bodyJson.login;
                const email = bodyJson.email;
                const data = JSON.stringify(body);

                if(!user || !email) {
                    res.json({status: 1,msg: "未获取到用户信息"});
                    return;
                }

                afterLogin(req, res, mongoose, {
                    user, email, data
                });
            });
        });
    }
};

// 微博登录回调
users.wbRedirect = function (mongoose) {
    return function (req, res) {
        const code = req.query.code;

        url = "https://api.weibo.com/oauth2/access_token?client_id="
            + config.appLogin.weibo.clientId + "&client_secret="
            + config.appLogin.weibo.clientSecret + "&grant_type=authorization_code"
            + "&redirect_uri=" + config.appLogin.weibo.redirect_uri
            + "&code=" + code;

        console.log("url:" + url);

        request.post({
            url: url,
        }, (e, r, body) => {
            console.log(e);
            if(e) {
                res.json({status: 1,msg: e});
                return;
            }
            let accessToken = JSON.parse(body).access_token;

            const url = "https://api.weibo.com/oauth2/get_token_info?access_token=" + accessToken;
            let getUserUrl = "https://api.weibo.com/2/users/show.json?access_token=" + accessToken +
                "&appKey=" + config.appLogin.weibo.clientId;

            request.post(url, (e,r,body) => {
                if(e) {
                    res.json({status: 1,msg: e});
                    return;
                }
                const bodyJson = JSON.parse(body);
                const uid = bodyJson.uid;
                getUserUrl += "&uid=" + uid;
                request.get(getUserUrl, (e,r,body) => {
                    if(e) {
                        res.json({status: 1,msg: e});
                        return;
                    }
                    const userInfo = JSON.parse(body);
                    const user = userInfo.name;
                    const email = "";
                    const data = JSON.stringify(body);

                    afterLogin(req, res, mongoose, {
                        user, email, data
                    })
                });
            });
        });
    }
};

/** 第三方登录成功后的处理
 * @param req
 * @param res
 * @param mongoose
 * @param userInfo，必须包含user、email、data
 */
let afterLogin = function (req, res, mongoose, userInfo) {
    mongoose.find("user",{user: userInfo.user},function (resu) {
        if(!resu.length){
            mongoose.insert("user", userInfo, () => {
                console.info("注册成功");
            });
        }
        req.session.user = userInfo.user;
        req.session.isLogin = true;
        res.clearCookie("user",{});

        // 操作写入cookie
        let expires = new Date();
        let expiresTime = expires.getTime() + 14*24*60*60*1000;

        res.cookie("user", encodeURIComponent(userInfo.user), {maxAge: expiresTime});
        res.cookie("isLogin", true, {maxAge: expiresTime});
        res.redirect("/");
    });
};

module.exports = users;
