var routes = function(mongoose){
    return function(req,res){
        //设置一个测试cookie
        /*res.writeHead(200,{
            'Set-Cookie': ['myCookie=test','passwd=*****'],
            'Content-Type': 'text/plan'
        });
        */
        //读取cookie (密码通过加密存储在cookie里:)
        var cookie = req.cookies;
        console.log(cookie.passwd);

        /*
        mongoose.find("links",{},function(ret){
            if(ret.length){
                res.send(ret);
            }        
        });
        */
        mongoose.find("link",{},function(ret){
            res.send("index",{
                title: "favlinks--您的私人收藏夹",ret: ret    
            });
        });
    };
};

module.exports = routes;
