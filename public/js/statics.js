/**
 * Created by jihong.zjh on 2016/6/7.
 * Description: 客户端用来统计用户访问信息
 */

(function ($) {
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
