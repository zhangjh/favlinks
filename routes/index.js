let routes = {};

const fs = require('fs');

//更改操作时校验用户合法性
function validUserCheck(req,user) {
    const sessionUser = req.session.user;
    // console.log(sessionUser);
    return sessionUser === user;
}

routes.index = function(mongoose){
    return function(req,res){
        let findPattern = {user:"default"};
        let cookie = req.headers.cookie || "";
        cookie = cookie.split(";");
        let cookieUser = "default",
            sessionUser = "default";
        for(let i in cookie){
            if(/user/.test(cookie[i])){
                cookieUser = decodeURIComponent(cookie[i].split("=")[1]);
            }
        }
        if(req.session && req.session.user){
            sessionUser = req.session.user;
        }
        //防止伪造cookie登录
        if(cookieUser === sessionUser){
            findPattern = {user: sessionUser};
        }else {
            res.clearCookie("user",{});
            res.cookie("isLogin","false");
        }
        //找出用户定义的网址，否则展示默认的
        mongoose.find("links",findPattern,function(ret){
            let groups = [];
            let group;
            for(let i in ret){
                group = ret[i].group;
                //新的group组名压入groups
                if(group && groups.indexOf(group) === -1){
                    groups.push(group);
                }
            }
            if(groups.length === 0){
                //没有内容时为了可以新增，保留一个默认组
                groups.push("默认");
            }
            res.render("index_min",{
                title: "favLinks--您的私人收藏夹 - 完全私人定制的网址收藏导航",ret: ret,groups: groups
            });
        });
    };
};

routes.add = function (mongoose) {
    return function (req,res) {
        const collection = req.query.collection,
            findPattern = req.query.findPattern || {},
            data = req.query.data,
            user = req.query.user;
        //用户校验
        if(validUserCheck(req,user)){
            findPattern.user = user;
            data.user = user;
            if(!data){
                res.json({status:1,msg:"Error: no data given."});
            }
            mongoose.find(collection,findPattern,function (resu) {
                if(!resu.length){
                    //当前没有则插入
                    mongoose.insert(collection,data,function (ret) {
                        res.json({status: 0,msg: ret});
                    });
                }else {
                    res.json({status: 1,msg: "记录已经存在，请勿重复插入！"});
                }
            });
        }else {
            res.json({status: 1,msg: "Access Denied！请检查是否登录."});
        }
    };
};

routes.update = function (mongoose) {
    return function (req,res) {
      const collection = req.query.collection,
          findPattern = req.query.findPattern,
          data = req.query.data,
          user = req.query.user;
        if(validUserCheck(req,user)){
            findPattern.user = user;
            mongoose.find(collection,findPattern,function (resu) {
                if(!resu.length){
                    res.json({status:1,msg:"Error: no data to update."});
                }else {
                    mongoose.update(collection,findPattern,data,{multi:true},function (ret) {
                        res.json({status: 0,msg: ret});
                    });
                }
            });
        }else {
            res.json({status: 1,msg: "Access Denied！请检查是否登录."});
        }
    };
};

routes.remove  = function (mongoose) {
  return function (req,res) {
      const collection = req.query.collection,
          data = req.query.data,
          user = req.query.user;
      if(validUserCheck(req,user)){
          const findPattern = {user: user};
          mongoose.find(collection,findPattern,function (resu) {
              if(!resu.length){
                  res.json({status:1,msg:"Error: no data to remove."});
              }else {
                  mongoose.remove(collection,data,function (ret) {
                      res.json({status: 0,msg: ret});
                  });
              }
          });
      }else {
          res.json({status: 1,msg: "Access Denied！请检查是否登录."});
      }
  }
};

routes.select = function (mongoose) {
  return function (req, res) {
      const collection = req.query.collection,
          findPattern = req.query.findPattern;
      if(collection){
          mongoose.find(collection,findPattern,function (resu) {
              res.json({status:0,data:resu});
          });
      }
  }
};

// 复制defaul数据给新注册用户
routes.copy = function (mongoose) {
    return function (req, res) {
        const collection = req.query.collection,
            find = req.query.find,
            user = req.query.user;
        let tem = {},
            item = {},
            retu = [];
        if(collection){
            mongoose.find(collection,find,function (resu) {
                for(let i in resu){
                    item = resu[i];
                    tem.user = user;
                    tem.group = item.group;
                    tem.linkName = item.linkName;
                    tem.url = item.url;
                    mongoose.insert(collection,tem,function (e) {
                        retu.push(e);
                        if(retu.length === resu.length){
                            res.json({status:0,msg:"copy succ"});
                        }
                    });
                    tem = {};
                }
            });
        }
    };
};

// 导出url记录
routes.export = function (mongoose) {
    return function (req, res) {
        let sessionUser = undefined;
        let cookieUser = undefined;
        let findPattern = {};

        const cookie = req.headers.cookie || "";

        for(let item of cookie.split(";")){
            if(/user/.test(item)){
                cookieUser = decodeURIComponent(item.split("=")[1]);
                break;
            }
        }

        if(req.session && req.session.user){
            sessionUser = req.session.user;
        }

        //防止伪造cookie登录
        if(cookieUser && sessionUser && cookieUser === sessionUser){
            findPattern = {user: sessionUser};
            mongoose.find("links",findPattern,resu => {
                // 拼装xml格式书签供下载
                const head =
                    `<!DOCTYPE NETSCAPE-Bookmark-file-1>
                    <!-- This is an automatically generated file.
                     It will be read and overwritten.
                     DO NOT EDIT! -->
                    <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
                    <TITLE>藏经阁导出书签</TITLE>
                    <H1><a href="https://favlink.cn">藏经阁</a>导出书签</H1>`;
                let html =
                    head + `
                        <DL><p>
                    `;

                let groups = [];
                resu.map(item => {
                    if(groups.indexOf(item.group) === -1){
                        groups.push(item.group);
                    }
                });

                groups.map(group => {
                    let groupEle = `
                            <DT><H3>${group}</H3>
                            <DL><p>
                            `;
                    let contentEle = "";
                    resu.map(item => {
                        if(item.group === group && item.url && item.linkName){
                            contentEle += `
                               <DT><A HREF="${item.url}">${item.linkName}</A>`;
                        }
                    });
                    html += groupEle + contentEle + `
                        </DL><p>`;
                });
                html += `
                    </DL><p>`;

                if(html){
                    const filePath = 'public/export/' + sessionUser + "_导出.html";
                    fs.writeFile(process.cwd() + "/" + filePath,html,function (err) {
                        if(err){
                            res.json({status: 1,msg: err});
                        }else {
                            res.download(filePath);
                        }
                    });
                }else {
                    res.json({status: 1,msg: "导出失败，内容为空"});
                }
            });
        }else {
            res.clearCookie("user",{});
            res.cookie("isLogin","false");
            res.json({status: 1,msg: "Access Denied！请检查是否登录."});
        }
    }
};

module.exports = routes;

