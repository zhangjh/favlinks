var mongoose = require("./mongoose");

/*
mongoose.insert("user",{user:"default",passwd:"",email:""},function(ret){
    console.log(ret);        
});
*/
mongoose.insert("links",{user:"default",group:"默认",linkName:"百度",url:"www.baidu.com"},function(ret){
    console.log(ret);
});

/*
mongoose.find("user",{user:"jihong.zjh"},function(ret){
    console.log(ret);        
});

mongoose.update("user",{"user":"jihong.zjh"},{passwd:"1234567"},{},function(ret){
    console.log(ret);        
});

/*
mongoose.remove("user",{user:"jihong.zjh"},function(ret){
    console.log(ret);        
});
*/
