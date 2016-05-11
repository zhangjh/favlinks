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
            $(this).addClass("alert-danger");
        }else {
            $(this).removeClass("alert-danger");
            $("#signupBtn").removeAttr("disabled");
        }
    }
});

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

            window.location.reload();
        }
    });
});

$("#signupBtn").on("click",function () {
    var user = $("#loginPannel .userName").val(),
        passwd = $("#loginPannel .passwd").val(),
        email = $("#loginPannel .email").val();
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
            alert(ret.msg);
            window.location.reload();
        }else {
            alert("注册失败：" + ret.msg);
        }
    });
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