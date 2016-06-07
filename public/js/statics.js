/**
 * Created by jihong.zjh on 2016/6/7.
 * Description: 客户端用来统计用户访问信息
 */

(function ($) {
    //访问统计信息
    $(document).ready(function () {
        var timestamp = new Date().toLocaleString(),
            ua = navigator.userAgent,
            referer = document.referrer,
            curUrl = window.location.href;
        var obj = {};

        //依赖sohu接口，要引入http://pv.sohu.com/cityjson?ie=utf-8文件
        var ip = returnCitySN['cip'];
        var addr = returnCitySN['cname'];

        obj.timestamp = timestamp;
        obj.ua = ua;
        obj.referer = referer;
        obj.curUrl = curUrl;
        obj.ip = ip;
        obj.addr = addr;

        $.ajax({
            url: "/insertInfo",
            data: {obj: obj},
            type: "get"
        }).done(function (ret) {
            if(ret.status == 0){
                // console.log("Insert clientInfo ok.");
            }else {
                console.error("Insert clientInfo error: " + ret.msg);
            }
        });
    });
})(jQuery);

(function ($) {
    //点击行为统计
    document.addEventListener("click",function (e) {
        var type = "";
        var ua = navigator.userAgent,
            ip = returnCitySN['cip'];
        var obj = {};
        //只对有domdot属性的元素进行打点信息记录
        if($(e.target).attr("domdot")){
            type = $(e.target).attr("domdot");
            obj.ip = ip;
            obj.ua = ua;
            obj.type = type;
            $.ajax({
                url: "/domdot",
                data: {obj: obj}
            }).done(function (ret) {
                if(ret.status == 0){
                    //插入成功
                }else {
                    console.error("Insert domdot data failed: " + ret.msg);
                }
            });
        }
    });
})(jQuery);
