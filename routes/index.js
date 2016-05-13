var routes = {};

//更改操作时校验用户合法性
function validUserCheck(req,user) {
    var sessionUser = req.session.user;
    console.log(sessionUser);
    if(sessionUser == user)return true;
    else return false;
}

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
        //用户校验
        if(validUserCheck(req,user)){
            var findPattern = {user:user};
            if(!data){
                res.json({status:1,msg:"Error: no data given."});
            }
            console.log("collect:",collection,"data:",data);
            mongoose.find(collection,findPattern,function (resu) {
                if(!resu.length){
                    //当前没有则插入
                    mongoose.insert(collection,data,function (ret) {
                        res.json({status: 0,msg: ret});
                    });
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
          data = req.query.data,
          user = req.query.user;
        if(validUserCheck(req,user)){
            var findPattern = {user: user};
            mongoose.find(collection,findPattern,function (resu) {
                if(!resu.length){
                    res.json({status:1,msg:"Error: no data to update."});
                }else {
                    mongoose.update(collection,findPattern,data,{},function (ret) {
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

module.exports = routes;
