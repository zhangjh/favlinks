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
        mongoose.find("links",findPattern,function(ret){
            res.render("index",{
                title: "favlinks--您的私人收藏夹",ret: ret    
            });
        });
    };
};

module.exports = routes;
