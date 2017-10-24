/**
 * Created by jihong.zjh on 2016/5/19.
 */

var common = (function ($) {
  //返回指定key的cookie值
  var getCookie = function (key) {
    var cookie = document.cookie || "";
    cookie = cookie.split(";");
    for (var i in cookie) {
      if (new RegExp(key).test(cookie[i])) {
        return decodeURIComponent(cookie[i].split("=")[1]);
      }
    }
  };

  //事件监听器
  var Listener = function (ele, ev, fn) {
    $(ele).on(ev, fn);
  };

  //ajax执行操作增删改查
  var dbOperation = function (url, collection, findPattern, data, fn) {
    var user = common.getCookie("user");

    $.ajax({
      url: url,
      data: {collection: collection, findPattern: findPattern, data: data, user: user}
    }).done(function (ret) {
      if (ret.status == 0) {
        console.log(ret.data);
        if (fn) fn(ret.data);
      }
      if (ret.status != "0") notie.alert(3, ret.msg, 3);
    });
  };

  var displayChange = function (editBtn, display) {
    var l = editBtn.offset().left,
      t = editBtn.offset().top;
    $("#change").css({top: t + 30, left: l});
    $("#change").css({display: display});
  };

  //检查ele的值是否满足提供的正则检查
  var validCheck = function (ele, pattern) {
    var v = $(ele).val();
    if (!pattern.test(v)) {
      $(ele).addClass("alert-danger");
    } else {
      $(ele).removeClass("alert-danger");
    }
  };

  var goTop = function () {
    $(document).scroll(function () {
      var scrollTop = $(document).scrollTop(),
        headerHeight = $("#header").height();
      if (scrollTop > headerHeight) {
        //滚动距离超过了header，则展示返回顶部按钮
        $("#goTop").show();
      } else {
        $("#goTop").hide();
      }
    });
    $("#goTop").click(function () {
      $("body").animate({
        scrollTop: 0
      }, 400);
    });
  };

  var goBottom = function () {
    $("body").animate({
      scrollTop: document.body.scrollHeight
    }, 1000);
  };

  var isMobile = function () {
    var w = $(window).width(),
      h = $(window).height();
    if (w < h) {
      return true;
    }
    return false;
  };

  //非通用trim，只是用来获取组名，去除删除按钮的x字符
  var strTrim = function (ori) {
    return ori.split('×')[0].trim();
  };

  return {
    getCookie: getCookie,
    Listener: Listener,
    dbOperation: dbOperation,
    displayChange: displayChange,
    validCheck: validCheck,
    goTop: goTop,
    goBottom: goBottom,
    isMobile: isMobile,
    strTrim: strTrim
  };
})(jQuery);

var db = (function () {
  var add = function (collection, findPattern, data, fn) {
    common.dbOperation("/add", collection, findPattern, data, fn);
  };
  var update = function (collection, findPattern, data, fn) {
    common.dbOperation("/update", collection, findPattern, data, fn);
  };
  var remove = function (collection, findPattern, data, fn) {
    common.dbOperation("/remove", collection, findPattern, data, fn)
  };
  var find = function (collection, findPattern, fn) {
    common.dbOperation("/select", collection, findPattern, {}, fn)
  };

  return {
    add: add,
    update: update,
    remove: remove,
    find: find
  };
})();

//跟页面相关的操作
var page = (function ($) {
  var showLoginPannel = function () {
    $("#login").on("click", function () {
      $("#loginPannel").modal("show");
    });
  };

  var setUserName = function () {
    var user = common.getCookie("user");
    $("#loginUser").text(user);
  };

  var linkModify = function () {
    $("span.glyphicon.glyphicon-edit").click(function (e) {
      var that = e.target;
      $("#change").attr("linkName", $(this).prev().text().trim());
      if ($("#change").css("display") == "none") {
        $(this).parents(".links").unbind("mouseout");
        common.displayChange($(this), "block");
        //  信息回填
        db.find("links",{
          group: common.strTrim($(that).parent().siblings(".group").children(".groupName").text()),
          linkName: $(that).prev().text().trim()
        },function (ret) {
          console.log(ret);
        });
      } else {
        $(this).parents(".link").bind("mouseout");
        common.displayChange($(this), "none");
      }

      $("#update").click(function () {
        if (!login.isLogin()) {
          notie.alert(2, "请先登录！", 2);
          return;
        }
        $("#updatePannel").modal("show");
        $("#updateBtn").click(function () {
          var name = $("#updatePannel .link").val(),
            url = $("#updatePannel .url").val();
          var updateCondition = {};

          if (url && !/^http/.test(url)) {
            url = "//" + url;
          }
          if (!name && !url) {
            notie.alert(2, "请至少填写一项修改.", 2);
          } else {
            if (name) updateCondition.linkName = name;
            if (url) updateCondition.url = url;
            //更新数据库
            db.update("links", {
              group: common.strTrim($(that).parent().siblings(".group").children(".groupName").text()),
              linkName: $(that).prev().text().trim()
            }, updateCondition, function () {
              $("#updatePannel").modal("hide");
              if (name) $(that).prev().children("span.linkName").text(name);
              if (url) $(that).prev().attr("href", url);
            });
          }
        });
      });


      $("#remove").click(function () {
        if (!login.isLogin()) {
          notie.alert(2, "请先登录！", 2);
          return;
        } else {
          //数据库删除数据
          db.remove("links", {}, {linkName: $(this).parent().attr("linkName")}, function () {
            $("#change").hide();
            $(that).parents(".links").remove();
          });
        }
      });
    });
  };

  var updateGroup = function () {
    $(".groupName").click(function () {
      if (!login.isLogin()) {
        notie.alert(2, "请先登录！", 2);
        return;
      } else {
        var that = $(this);
        var oriGroup = common.strTrim($(this).text());
        $("#updateGroupPannel").modal("show");
        $("#updateGroupBtn").click(function () {
          var newGroup = $(".newGroup").val();
          if (newGroup) {
            $("#updateGroupPannel").modal("hide");
            // 更新数据库
            db.update("links", {group: oriGroup}, {group: newGroup}, function () {
              if (newGroup) that.text(newGroup);
            });
          } else {
            notie.alert(2, "请填写组名！", 2);
          }
        });
      }
    });
  };

  var deleteGroup = function () {
    $(".groupName").hover(function () {
      $(this).children(".close").show();
    }, function () {
      $(this).children(".close").hide();
    });

    $(".group .close").click(function (e) {
      e.stopPropagation();
      if (!login.isLogin()) {
        notie.alert(2, "请先登录！", 2);
        return;
      }
      var groupName = common.strTrim($(this).parents(".groupName").text());
      db.remove("links", {}, {group: groupName}, function () {
        //删除成功后移除该组
        $(e.target).parents(".groupWrap").remove();
      });
    });
  };

  var adjustMobile = function () {
    if (common.isMobile()) {
      var groupW = $(".groupWrap").width();
      var w = (groupW - 30) / 2;
      $(".links").css({width: w});
      $(".addNewLinks > a > span").css({fontSize: "smaller"});
    }
  };

  var asideImgHover = function () {
    $("aside .row img").hover(function (e) {
      e.stopPropagation();
      $(this).animate({height: "180px"}, 200, function () {
        common.goBottom();
      });
    }, function () {
      $(this).animate({height: "100px"});
    });
  };

  var wxDisplay = function () {
    $(".fa-weixin").click(function () {
      $("#wx_img_wrapper").show();
      $(".content").css({opacity: "0.2"});
      if (common.isMobile()) {
        var h = $("#wx_img_wrapper").height() - 20;
        $("#wx_img_wrapper").css({left: "30%"});
        $("body").animate({
          scrollTop: h
        }, 400);
      }

      $("#wx_img_wrapper .close").click(function () {
        $("#wx_img_wrapper").hide();
        $(".content").css({opacity: "1"});
      });
    });
  };

  return {
    showLoginPannel: showLoginPannel,
    setUserName: setUserName,
    linkModify: linkModify,
    updateGroup: updateGroup,
    deleteGroup: deleteGroup,
    adjustMobile: adjustMobile,
    asideImgHover: asideImgHover,
    wxDisplay: wxDisplay
  };
})(jQuery);

var login = (function () {
  var isLogin = function () {
    if (common.getCookie("isLogin") === "true") return true;
    else return false;
  };
  return {
    "isLogin": isLogin,
    "showLoginPannel": page.showLoginPannel,
    "setUserName": page.setUserName
  };
})();

//组相关操作
var group = (function ($) {
  var ev = function () {
    common.Listener(".addGroupBtn", "mouseover", function () {
      $(this).text("添加新组");
    });
    common.Listener(".addGroupBtn", "mouseout", function () {
      $(this).text("");
    });
    common.Listener(".addGroupBtn", "click", function () {
      $("#addNewGroupPopup").modal({
        keyboard: true,
        show: true
      });
    });

    //保存新添加组
    common.Listener(".saveGroupBtn", "click", function () {
      if (!login.isLogin()) {
        notie.alert(2, "请先登录！", 2);
        return;
      }
      var addGroupName = $("#addNewGroupPopup input").val(),
        curGroupNames = [],
        duplicate = false;
      if (addGroupName) {
        $(".groupName").each(function (i, ele) {
          curGroupNames.push($(ele).text());
        });
        for (var i in curGroupNames) {
          if (curGroupNames[i] == addGroupName) {
            duplicate = true;
            break;
          }
        }
        if (duplicate) {
          notie.alert(3, "已经存在组：'" + addGroupName + ",'请输入不重复的组名！", 2);
        } else {
          //页面插入组元素
          var insertHtml = "<div class='groupWrap'><div class='group'><span class='groupName'>" + addGroupName + "<button type='button' class='close'><span aria-hidden='true'>×</span> </button> </span><span class='glyphicon glyphicon-plus addGroupBtn' aria-hidden='true'></span></div>" +
            "<div class='links addNewLinks'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span><a href='javascript:;'><span class='linkName'>添加新链接</span></a></div></div>";

          $("#addNewGroupPopup").modal("hide");
          //增加事件
          common.Listener(".addNewLinks", "mouseover");
          common.Listener(".addNewLinks", "mouseout");
          common.Listener(".addNewLinks", "click");

          common.Listener(".addGroupBtn", "mouseover");
          common.Listener(".addGroupBtn", "mouseout");
          common.Listener(".addGroupBtn", "click");

          // 保存新组数据到数据库
          db.add("links", {group: addGroupName}, {group: addGroupName}, function () {
            $(".contentwrap").append(insertHtml);
            window.location.reload();
          });
        }
      } else {
        notie.alert(2, "请输入组名！", 2);
      }
    });
  };
  return {
    ev: ev
  };
})(jQuery);


//链接相关操作
var links = (function ($) {
  var ev = function () {
    //链接hover效果
    common.Listener(".links", "mouseover", function () {
      $(this).css({
        boxShadow: "1px 1px 10px 1px lightblue"
        // fontSize: "larger"
      });
      var editBtn = $(this).find(".glyphicon-edit");
      editBtn.show();
    });
    common.Listener(".links", "mouseout", function () {
      $(this).removeAttr("style");
      var editBtn = $(this).find(".glyphicon-edit");
      editBtn.hide();
    });

    //添加新链接
    common.Listener(".addNewLinks", "mouseover", function () {
      $(this).css({
        'box-shadow': "10px 5px 5px #888888"
      });
    });
    common.Listener(".addNewLinks", "mouseout", function () {
      $(this).css({
        'box-shadow': "none"
      });
    });
    common.Listener(".addNewLinks", "click", function () {
      var insertPos = $(this).attr("index");       //新链接要添加的位置（insertAfter）
      $("#addNewLinkPopup").modal({
        keyboard: true,
        show: true
      });
      $(".saveLinkBtn").attr("index", insertPos);
    });

    //新加链接的url合法性检查
    common.Listener(".addNewLinksUrl", "change", function (e) {
      var pattern = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;
      common.validCheck(e.target, pattern);
    });

    //保存新链接
    common.Listener(".saveLinkBtn", "click", function () {
      if (!login.isLogin()) {
        notie.alert(2, "请先登录！", 2);
        return;
      }
      var name = $("#addNewLinkPopup .addNewLinksName").val(),
        url = $("#addNewLinkPopup .addNewLinksUrl").val();
      if (name && url) {
        if (!/^http/.test(url)) {
          url = "//" + url;
        }
        var insertHtml = "<div class='links'><a target='_blank' href='" + url + "'><span class='linkName'>" + name + "</span></a><span class='glyphicon glyphicon-edit' aria-hidden='true' style='display: none;'></span></div>";
        var index = parseInt($(this).attr("index")) + 1;

        $("#addNewLinkPopup").modal('hide');
        //添加事件
        common.Listener(".links", "mouseover", function () {
          $(this).css({
            boxShadow: "1px 1px 10px 1px lightblue",
            fontSize: "larger"
          });
          var editBtn = $(this).find(".glyphicon-edit");
          editBtn.show();
        });
        common.Listener(".links", "mouseout", function () {
          $(this).css({
            boxShadow: "none",
            fontSize: "normal"
          });
          var editBtn = $(this).find(".glyphicon-edit");
          editBtn.hide();
        });

        // 存到数据库，读取用户信息，存到对应的数据库表
        var groupName = common.strTrim($(".addNewLinks[index=" + (index - 1) + "]").siblings(".group").children(".groupName").text());
        db.add("links", {group: groupName, linkName: name}, {group: groupName, linkName: name, url: url}, function () {
          $(".groupWrap:nth-child(" + index + ") .links:last").before(insertHtml);
          window.location.reload();
        });
      } else {
        if (!name) $("#addNewLinkPopup .addNewLinksName").addClass("alert-danger");
        else $("#addNewLinkPopup .addNewLinksName").removeClass("alert-danger");
        if (!url) $("#addNewLinkPopup .addNewLinksUrl").addClass("alert-danger");
        else $("#addNewLinkPopup .addNewLinksUrl").removeClass("alert-danger");
      }
    });
  };
  return {
    ev: ev
  };
})(jQuery);

//Main
(function () {
  // http => https
  if (window.location.protocol === "http:") {
    window.location.href = "https://favlink.cn";
  }

  //login
  login.showLoginPannel();
  login.setUserName();

  //group
  group.ev();

  //links
  links.ev();

  //page
  page.linkModify();
  page.updateGroup();
  page.deleteGroup();
  page.adjustMobile();
  page.asideImgHover();
  page.wxDisplay();

  //goTop
  common.goTop();
})();

//彩蛋
(function () {
  console.info("hello 骚年，你都看到这儿来了！");
  console.info("不介意的话，打个赏吧╥﹏╥...服务器好贵。。");
  console.info("你也可以给我推荐便宜的租赁主机服务，欢迎通过页面底部的social link联系我哦。");
  console.info("如果有任何的问题或者建议，都可以通过底部的反馈链接提给我，我会第一时间响应的呢~");
})();