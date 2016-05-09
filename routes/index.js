var routes = function(mongoose){
    return function(req,res){
        //设置一个测试cookie
        /*res.writeHead(200,{
            'Set-Cookie': ['myCookie=test','passwd=*****'],
            'Content-Type': 'text/plan'
        });
        */
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

module.exports = routes;
