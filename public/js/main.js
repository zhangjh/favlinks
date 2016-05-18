var Listener = {};

Listener.event = function (ele,ev,fn) {
    ele.on(ev,fn);
};

function isLogin() {
    var cookie = document.cookie || "";
    cookie = cookie.split(";");
    for(var i in cookie){
        if(/isLogin/.test(cookie[i])){
            if(cookie[i].split("=")[1] === "true")return true;
            else return false;
        }
    }
    return false;
}

function displayChange(editBtn,display) {
    var l = editBtn.offset().left,
        t = editBtn.offset().top;
    $("#change").css({top: t+30,left: l});
    $("#change").css({display: display});
}

var effectFuns = {
    addGroupCb: function (ele,ev) {
      switch (ev){
          case "mouseover":
              Listener.event(ele,ev,function () {
                  $(ele).text("添加新组");
              });
              break;
          case "mouseout":
              Listener.event(ele,ev,function () {
                  $(ele).text("");
              });
              break;
          case "click":
              Listener.event(ele,ev,function () {
                  $("#addNewGroupPopup").modal({
                      keyboard: true,
                      show: true
                  });
              });
              break
      }
    },
    addLinkCb: function (ele,ev) {
      switch  (ev){
          case "mouseover":
              Listener.event(ele,ev,function () {
                  $(this).css({
                      'box-shadow': "10px 5px 5px #888888"
                  });
              });
              break;
          case "mouseout":
              Listener.event(ele,ev,function () {
                  $(this).css({
                      'box-shadow': "none"
                  });
              });
              break;
          case "click":
              Listener.event(ele,ev,function () {
                  var insertPos = $(this).attr("index");       //新链接要添加的位置（insertAfter）
                  $("#addNewLinkPopup").modal({
                      keyboard: true,
                      show: true
                  });
                  $(".saveLinkBtn").attr("index",insertPos);
              });
              break;
      }
    },
    linkCb: function (ele,ev) {
        switch (ev){
            case "mouseover":
                Listener.event(ele,ev,function () {
                    $(this).css({
                        boxShadow: "1px 1px 10px 1px lightblue",
                        fontSize: "larger"
                    });
                    var editBtn = $(this).find(".glyphicon-edit");
                    editBtn.show();
                    // displayChange(editBtn,"block");
                });
                break;
            case "mouseout":
                Listener.event(ele,ev,function () {
                    $(this).css({
                        boxShadow: "none",
                        fontSize: "normal"
                    });
                    var editBtn = $(this).find(".glyphicon-edit");
                    editBtn.hide();
                    // displayChange(editBtn,"none");
                });
                break;
        }
    },
    saveGroupCb: function (ele,ev) {
        if(ev == "click"){
            Listener.event(ele,ev,function () {
                if(!isLogin()){
                    alert("请先登录！");
                    return;
                }
                var addGroupName = $("#addNewGroupPopup input").val();
                var curGroupNames = [];
                var duplicate = false;
                if(addGroupName){
                    $(".groupName").each(function (i,ele) {
                        curGroupNames.push($(ele).text());
                    });
                    var i = 0;
                    for(i in curGroupNames){
                        if(curGroupNames[i] == addGroupName){
                            duplicate = true;
                            break;
                        }
                    }
                    if(duplicate){
                        alert("已经存在组：'" + addGroupName + ",'请输入不重复的组名！");
                    }else {
                        //页面插入组元素
                        var insertHtml = "<div class='groupWrap'><div class='group'><span class='groupName'>" + addGroupName + "</span><span class='glyphicon glyphicon-plus addGroupBtn' aria-hidden='true'></span></div>" +
                            "<div class='links addNewLinks'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span><a href='javascript:;'><span class='linkName'>添加新链接</span></a></div></div>";

                        $(".contentwrap").append(insertHtml);
                        $("#addNewGroupPopup").modal("hide");
                        //增加事件
                        effectFuns.addLinkCb($(".addNewLinks"),"mouseover");
                        effectFuns.addLinkCb($(".addNewLinks"),"mouseout");
                        effectFuns.addLinkCb($(".addNewLinks"),"click");
                        effectFuns.addGroupCb($(".addGroupBtn"),"mouseover");
                        effectFuns.addGroupCb($(".addGroupBtn"),"mouseout");
                        effectFuns.addGroupCb($(".addGroupBtn"),"click");
                        //TODO: 保存新组数据到数据库
                    }
                }else {
                    $("#addNewGroupPopup input").addClass("alert-danger");
                }
            });
        }
    },
    addNewLinkValidCheckCb: function (ele,ev) {
        if(ev == "keyup"){
            Listener.event(ele,ev,function () {
                var url = $(this).val();
                var urlPattern = new RegExp("((https?|ftp|mms):\/\/)?([A-z0-9]+[_\-]?[A-z0-9]+\.)*[A-z0-9]+\-?[A-z0-9]+\.[A-z]{2,}(\/.*)*\/?");
                if(!urlPattern.test(url)){
                    $(this).addClass("alert-danger");
                }else {
                    $(this).removeClass("alert-danger");
                }
            })
        }

    },
    saveLinkCb: function (ele,ev) {
        if(ev == "click"){
            Listener.event(ele,ev,function () {
                if(!isLogin()){
                    alert("请先登录！");
                    return;
                }
                var name = $("#addNewLinkPopup .addNewLinksName").val();
                var url = $("#addNewLinkPopup .addNewLinksUrl").val();
                if(name && url){
                    if(!/^http/.test(url)){
                        url = "//" + url;
                    }
                    var insertHtml = "<div class='links'><a target='_blank' href='" + url + "'><span class='linkName'>" + name+ "</span></a><span class='glyphicon glyphicon-edit' aria-hidden='true' style='display: none;'></span></div>";
                    var index = parseInt($(this).attr("index")) + 1;
                    $(".groupWrap:nth-child(" + index + ") .links:last").before(insertHtml);
                    $("#addNewLinkPopup").modal('hide');
                    //添加事件
                    effectFuns.linkCb($(".links"),"mouseover");
                    effectFuns.linkCb($(".links"),"mouseout");
                    //TODO: 存到数据库，读取用户信息，存到对应的数据库表
                }else {
                    if(!name)$("#addNewLinkPopup .addNewLinksName").addClass("alert-danger");
                    else $("#addNewLinkPopup .addNewLinksName").removeClass("alert-danger");
                    if(!url)$("#addNewLinkPopup .addNewLinksUrl").addClass("alert-danger");
                    else $("#addNewLinkPopup .addNewLinksUrl").removeClass("alert-danger");
                }
            });
        }
    }
};

effectFuns.addGroupCb($(".addGroupBtn"),"mouseover");
effectFuns.addGroupCb($(".addGroupBtn"),"mouseout");
effectFuns.addGroupCb($(".addGroupBtn"),"click");

effectFuns.linkCb($(".links"),"mouseover");
effectFuns.linkCb($(".links"),"mouseout");

effectFuns.addLinkCb($(".addNewLinks"),"mouseover");
effectFuns.addLinkCb($(".addNewLinks"),"mouseout");
effectFuns.addLinkCb($(".addNewLinks"),"click");

effectFuns.saveGroupCb($(".saveGroupBtn"),"click");

effectFuns.addNewLinkValidCheckCb($(".addNewLinksUrl"),"keyup");

effectFuns.saveLinkCb($(".saveLinkBtn"),"click");

function dbOperation(url,collection,data) {
    var cookies = document.cookie.split(";");
    var user = "";
    for(var i in cookies){
        if(/user/.test(cookies[i])){
            user = cookies[i].split("=")[1];
            break;
        }
    }

    $.ajax({
        url: url,
        data: {collection:collection,data:data,user:user}
    }).done(function (ret) {
        alert(ret);
    });
}

function add(collection,data) {
    dbOperation("/add",collection,data);
}

function update(collection,data) {
    dbOperation("/update",collection,data);
}

function remove() {
    dbOperation("/remove",collection,data);
}

$("#login").on("click",function () {
    $("#loginPannel").modal("show");
});

//设置用户名
(function () {
    var cookie = document.cookie.split(";");
    for(var i in cookie){
        if(!/user/.test(cookie[i])){
            continue;
        }
        $("#loginUser").text(cookie[i].split("=")[1]);
    }
})();

(function () {
    $("span.glyphicon.glyphicon-edit").click(function () {
        var that = $(this);
        if ($("#change").css("display") == "none") {
            $(this).parents(".links").unbind("mouseout");
            displayChange($(this), "block");
        } else {
            $(this).parents(".link").bind("mouseout");
            displayChange($(this), "none");
        }

        $("#update").click(function () {
            if(!isLogin()){
                alert("请先登录！");
                return;
            }
            $("#updatePannel").modal("show");
        });

        $("#updateBtn").click(function () {
            var name = $("#updatePannel .link").val(),
                url = $("#updatePannel .url").val();
            if(!/^http/.test(url)){
                url = "//" + url;
            }
            if(!name && !url){
                alert("请至少填写一项修改.");
            }else {
                if(name)that.prev().children("span.linkName").text(name);
                if(url)that.prev().attr("href",url);
                //更新数据库

                $("#updatePannel").modal("hide");
            }
        });
        
        $("#remove").click(function () {
            if(!isLogin()){
                alert("请先登录！");
                return;
            }
            that.hide();
            $("#change").hide();
            that.parents(".links").remove();

        });
    });
})();

(function () {
    $(".groupName").click(function () {
        var that = $(this);
        $("#updateGroupPannel").modal("show");
        $("#updateGroupBtn").click(function () {
            var newGroup = $(".newGroup").val();
            if(newGroup)that.text(newGroup);
            $("#updateGroupPannel").modal("hide");
            //TODO：更新数据库
        });
    });
})();

function adjustMobile() {
    var groupW = $(".groupWrap").width();
    var w = (groupW - 30)/2;
    $(".links").css({width: w});
    $(".addNewLinks > a > span").css({fontSize: "smaller"});
}

(function () {
    var w = $(window).width(),
        h = $(window).height();
    if(h > w){
        adjustMobile();
    }
})();

(function () {
    $(document).scroll(function () {
        var scrollTop = $(document).scrollTop(),
            headerHeight = $("#header").height();
        if(scrollTop > headerHeight){
            //滚动距离超过了header，则展示返回顶部按钮
            $("#goTop").show();
        }else {
            $("#goTop").hide();
        }
    });
    $("#goTop").click(function () {
        $("body").animate({
            scrollTop: 0
        },400);
    });
})();

function goBottom() {
    $("body").animate({
        scrollTop: document.body.scrollHeight
    },1000);
}

(function () {
    $("aside .row img").hover(function (e) {
        e.stopPropagation();
        $(this).animate({height: "180px"},200,function () {
            goBottom();
        });

    },function () {
        $(this).animate({height: "100px"});
    });

    $(".fa-weixin").click(function () {

        $("#wx_img_wrapper").show();
        $(".content").css({opacity: "0.2"});

        $("#wx_img_wrapper .close").click(function () {
            $("#wx_img_wrapper").hide();
            $(".content").css({opacity: "1"});
        });
    });
})();

