/**
 * Created by jihong.zjh on 2016/5/11.
 */
$(document).on("keyup",function () {
    var user = $("#loginPannel .userName").val(),
        passwd = $("#loginPannel .passwd").val(),
        email = $("#loginPannel .email").val();
    if(user && passwd){
        $("#loginBtn").removeAttr("disabled");
    }
    if(user && passwd && email){
        var validPattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
        if(!validPattern.test(email)){
            $("#loginPannel .email").addClass("alert-danger");
            $("#signupBtn").attr("disabled","disabled");
        }else {
            $("#loginPannel .email").removeClass("alert-danger");
            $("#signupBtn").removeAttr("disabled");
        }
    }
});

function getUser() {
    var cookie = document.cookie || "";
    var user = "";
    cookie = cookie.split(";");
    for(var i in cookie){
        if(/user/.test(cookie[i])){
            user = decodeURIComponent(cookie[i].split("=")[1]);
            break;
        }
    }
    return user;
}

$("#loginBtn").on("click",function () {
    const user = $(".userName").val();
    const passwd = $(".passwd").val();
    $.ajax({
        url: "/login",
        type: "POST",
        headers: {
            "X-Requested-Biz": passwd
        },
        data: {
            user:user
        },
        success: ret => {
            if(ret.status === 0){
                $("#loginUser").text(user);
                //cookie 14天
                let expires = new Date();
                expires.setTime(expires.getTime() + 14*24*60*60*1000);
                document.cookie = "user=" + encodeURIComponent(user) + ";expires=" + expires.toGMTString();
                document.cookie = "isLogin=true;expires=" + expires.toGMTString();
                window.location.reload();
            }else {
                notie.alert(3,ret.msg,3);
            }
        }
    });
});

$("#signupBtn").on("click",function () {
    var user = $("#loginPannel .userName").val(),
        passwd = $("#loginPannel .passwd").val(),
        email = $("#loginPannel .email").val();
    if(user && passwd && email){
        $.ajax({
            url: "/signup",
            type: "POST",
            data: {user: user,passwd: passwd, email: email}
        }).done(function (ret) {
            if(ret.status == 0){
                //cookie 14天
                var expires = new Date();
                expires.setTime(expires.getTime() + 14*24*60*60*1000);
                document.cookie = "user=" + encodeURIComponent(user) + ";expires=" + expires.toGMTString();
                document.cookie = "isLogin=true;expires=" + expires.toGMTString();
                $("#loginTips").modal("show");
                window.location.reload();
            }else {
                notie.alert(3,"注册失败：" + ret.msg,3);
            }
        });
    }
});

$("#forgetPasswd").on("click",function () {
    var user = $("#loginPannel .userName").val(),
        email = $("#loginPannel .email").val();
    if(!user || !email){
        notie.alert(2,"请填写用户名和注册邮箱！",3);
    }else {
        $.ajax({
            url: "/forget",
            type: "POST",
            data: {user: user,email: email}
        }).done(function (ret) {
            notie.alert(4,ret.msg,3);
        });
    }
});

$("#loginTipsBtn").on("click",function () {
    var user = getUser();
    $.ajax({
        url: "/copy",
        data: {collection:"links",find:{user:"default"},user: user}
    }).done(function (ret) {
        if(ret.status == 0){
            window.location.reload();
        }
    });
});

$("#cancelTipsBtn").on("click",function () {
    var user = getUser();
    $.ajax({
        url: "/add",
        data: {collection:"links",user:user,data:{group:"常用",user:user}}
    }).done(function (ret) {
        if(ret.status == 0){
            window.location.reload();
        }
    });
});

$("#loginTips").on("click",function () {
    window.location.reload();
});
