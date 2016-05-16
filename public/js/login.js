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
        var validPattern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
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
            user = cookie[i].split("=")[1];
            break;
        }
    }
    return user;
}

$("#loginBtn").on("click",function () {
    var user = $(".userName").val();
    var passwd = $(".passwd").val();
    $.ajax({
        url: "/login",
        type: "POST",
        data: {user:user,passwd:passwd}
    }).done(function (ret) {
        if(ret.status == 0){
            $("#loginUser").text(user);
            //cookie 14天
            var expires = new Date();
            expires.setTime(expires.getTime() + 14*24*60*60*1000);
            document.cookie = "user=" + user + ";expires=" + expires.toGMTString();
            document.cookie = "isLogin=true";
            window.location.reload();
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
                document.cookie = "user=" + user + ";expires=" + expires.toGMTString();
                document.cookie = "isLogin=true";
                // alert(ret.msg);
                $("#loginTips").modal("show");
                // window.location.reload();
            }else {
                alert("注册失败：" + ret.msg);
            }
        });
    }
});

$("#forgetPasswd").on("click",function () {
    var user = $("#loginPannel .userName").val(),
        email = $("#loginPannel .email").val();
    if(!user || !email){
        alert("请填写用户名和注册邮箱！");
    }else {
        $.ajax({
            url: "/forget",
            type: "POST",
            data: {user: user,email: email}
        }).done(function (ret) {
            alert(ret.msg);
        });
    }
});

$("#loginTipsBtn").on("click",function () {
    //TODO：复制defaul的数据给当前注册用户
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
    //TODO: 仅生成基本的数据给新注册用户
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