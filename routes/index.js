var routes = {};
routes.index = function(mongoose){
    return function(req,res){
        var findPattern = {user:"default"};
        if(req.session && req.session.user){
            findPattern = {user:req.session.user};
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
            data = req.query.data,
            user = req.query.user;
        console.log(typeof data);
        var findPattern = {user:user};
        if(!data){
            res.json({status:1,msg:"Error: no data given."});
        }
        console.log("collect:",collection,"data:",data);
        mongoose.find(collection,findPattern,function (resu) {
            if(!resu.length){
                //当前没有则插入
                mongoose.insert(collection,data,function (ret) {
                    res.send(ret);
                });
            }
        });
    };
};

routes.update = function (mongoose) {
    return function (req,res) {
      var collection = req.query.collection,
          data = req.query.data,
          user = req.query.user;
        var findPattern = {user: user};
        mongoose.find(collection,findPattern,function (resu) {
            if(!resu.length){
                res.json({status:1,msg:"Error: no data to update."});
            }else {
                mongoose.update(collection,findPattern,data,{},function (ret) {
                    res.send(ret);
                });
            }
        });
    };
};

routes.remove  = function (mongoose) {
  return function (req,res) {
      var collection = req.query.collection,
          data = req.query.data,
          user = req.query.user;
      var findPattern = {user: user};
      mongoose.find(collection,findPattern,function (resu) {
          if(!resu.length){
              res.json({status:1,msg:"Error: no data to remove."});
          }else {
              mongoose.remove(collection,data,function (ret) {
                  res.send(ret);

              });
          }
      });
  }
};

routes.signup = function (mongoose) {
  return function (req,res) {
      var user = req.query.username,
          passwd = req.query.passwd,
          email = req.query.email;

      mongoose.find("user",{user:user},function (resu) {
          if(resu.length){
              res.json({status:1,msg:"用户名已经被注册!"});
          }else {
              mongoose.insert("user",{user:user,passwd:passwd,email:email},function (ret) {
                  //写cookie，session
                  res.writeHead(200,{
                      'Set-Cookie': 'user=' + user,
                      'Content-Type': 'text/plan'
                  });
                  req.session.user = user;
                  res.json({status:0,msg:"注册成功！"});
              });
          }
      });
  }
};

routes.login = function (mongoose) {
  return function (req,res) {
      var user = req.query.username,
          passwd = req.query.passwd;
      mongoose.find("user",{user:user},function (resu) {
          //判断用户名密码
          //登录成功后写入cookie，seession，跳转
      });

  }
};

module.exports = routes;
