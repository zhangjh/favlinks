var mongoose = require("./mongoose");

/*
mongoose.insert("user",{user:"default",passwd:"",email:""},function(ret){
    console.log(ret);        
});
*/

mongoose.insert("links",{group: 'test2', name: 'test1', url: '//test.com', user: '22'},function(ret){
    console.log(ret);
});


/*
mongoose.find("user",{user:"jihong.zjh"},function(ret){
    console.log(ret);        
});
*/
/*
mongoose.update("links",{"user":"22","url":"www.bilibili.com"},{group:"test22"},{multi:true},function(ret){
    console.log(ret);        
});
*/
/*
mongoose.remove("user",{user:"jihong.zjh"},function(ret){
    console.log(ret);        
});
*/
