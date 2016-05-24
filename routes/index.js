var routes = {};

//更改操作时校验用户合法性
function validUserCheck(req,user) {
    var sessionUser = req.session.user;
    // console.log(sessionUser);
    if(sessionUser == user)return true;
    else return false;
}

routes.index = function(mongoose){
    return function(req,res){
        var findPattern = {user:"default"};
        var cookie = req.headers.cookie || "";
        cookie = cookie.split(";");
        var cookieUser = "default",
            sessionUser = "default";
        for(var i in cookie){
            if(/user/.test(cookie[i])){
                cookieUser = cookie[i].split("=")[1];
            }
        }
        if(req.session && req.session.user){
            sessionUser = req.session.user;
        }
        //防止伪造cookie登录
        if(cookieUser == sessionUser){
            findPattern = {user: sessionUser};
        }else {
            res.clearCookie("user",{});
            res.cookie("isLogin","false");
        }
        //找出用户定义的网址，否则展示默认的
        mongoose.find("links",findPattern,function(ret){
            var groups = [];
            var group;
            for(var i in ret){
                group = ret[i].group;
                //新的group组名压入groups
                if(group && groups.indexOf(group) == -1){
                    groups.push(group);
                }
            }
            res.render("index",{
                title: "favlinks--您的私人收藏夹",ret: ret,groups: groups   
            });
        });
    };
};

routes.add = function (mongoose) {
    return function (req,res) {
        var collection = req.query.collection,
            findPattern = req.query.findPattern || new Object(),
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
      var collection = req.query.collection,
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
      var collection = req.query.collection,
          data = req.query.data,
          user = req.query.user;
      if(validUserCheck(req,user)){
          var findPattern = {user: user};
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
      var collection = req.query.collection,
          findPattern = req.query.findPattern;
      if(collection){
          mongoose.find(collection,findPattern,function (resu) {
              res.json({status:0,data:resu});
          });
      }
  }
};

//复制defaul数据给新注册用户
routes.copy = function (mongoose) {
    return function (req, res) {
        var collection = req.query.collection,
            find = req.query.find,
            user = req.query.user;
        var tem = {},
            item = {},
            retu = [];
        if(collection){
            mongoose.find(collection,find,function (resu) {
                for(var i in resu){
                    item = resu[i];
                    tem.user = user;
                    tem.group = item.group;
                    tem.linkName = item.linkName;
                    tem.url = item.url;
                    mongoose.insert(collection,tem,function (e) {
                        retu.push(e);
                        if(retu.length == resu.length){
                            res.json({status:0,msg:"copy succ"});
                        }
                    });
                    tem = {};
                }
            });
        }
    };
};

module.exports = routes;
