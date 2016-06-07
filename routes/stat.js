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

module.exports = stat;

