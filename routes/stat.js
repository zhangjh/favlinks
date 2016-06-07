/**
 * Created by jihong.zjh on 2016/6/7.
 * Description: 用户访问统计服务端，接收参数插入数据库
 */
var stat = {};

stat.insertInfo = function (mongoose) {
    return function (req, res) {
        var obj = req.query.obj;
        var ip = obj.ip,
            addr = obj.addr,
            timestamp = obj.timestamp,
            ua = obj.ua,
            referer = obj.referer,
            curUrl = obj.curUrl;

        var clientInfo = {
            timestamp: timestamp,
            ua: ua,
            referer: referer,
            curUrl: curUrl,
            ip: ip,
            addr: addr
        };

        mongoose.insert("statics",clientInfo,function (ret) {
            res.json({status: 0,msg: ret});
        });
    };
};

module.exports = stat;

