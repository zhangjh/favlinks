/**
 * Created by jihong.zjh on 2016/6/7.
 * Description: 用户访问统计服务端，接收参数插入数据库
 */
var stat = {};

stat.insertInfo = function (mongoose) {
    return function (req, res) {
        var clientInfo = req.query.obj;

        mongoose.insert("statics",clientInfo,function (ret) {
            res.json({status: 0,msg: ret});
        });
    };
};

stat.domdot = function (mongoose) {
    return function (req, res) {
        var domdotInfo = req.query.obj;
        mongoose.insert("domdot",domdotInfo,function (ret) {
            res.json({status: 0,msg:ret});
        });
    }
};

stat.visit = function (mongoose) {
	return function (req, res) {
		var url = req.query.url;
		res.header("Access-Control-Allow-Origin", "http://zhangjh.me");	
		mongoose.find("visit",{url: url}, function(ret) {
			var cnt = 0;
			if(ret.length){
				cnt = parseInt(ret[0].cnt);	
				mongoose.update("visit",{url: url},{cnt: cnt + 1},{},function(ret){
					//console.log(ret);
				});
			}else {
				mongoose.insert("visit",{url: url,cnt: cnt + 1},function(ret){
					//console.log(ret);
				});
			}
			res.json({status: 0,cnt: cnt + 1});
		});
	};
};

module.exports = stat;

