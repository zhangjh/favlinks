/**
 * Created by jihong.zjh on 2016/5/19.
 */

const common = (function ($) {
  // 全局的debug开关
  const debug = false;

  //返回指定key的cookie值
  const getCookie = function (key) {
    const cookie = (document.cookie || "").split(";");
    for (let i in cookie) {
      if (new RegExp(key).test(cookie[i])) {
        return decodeURIComponent(cookie[i].split("=")[1]);
      }
    }
  };

  // 给url添加//前缀
  const handleUrl = function (url) {
    if(url && !/^http/.test(url) && !/\/\//.test(url)) {
      url = "//" + url;
    }
    return url;
  };

  //事件监听器
  const Listener = function (ele, ev, fn) {
    $(ele).on(ev, fn);
  };

  //ajax执行操作增删改查
  const dbOperation = function (jsonParam) {
    const user = common.getCookie("user");

    $.ajax({
      url: jsonParam.url,
      data: {collection: jsonParam.collection, findPattern: jsonParam.findPattern, data: jsonParam.data, user: user}
    }).done(function (ret) {
      if (ret.status === 0) {
        console.log(ret.data);
        if (jsonParam.fn) {
          jsonParam.fn(ret.data);
        }
      }
      if (ret.status !== 0) {
        notie.alert(3, jsonParam.msg || ret.msg, 3);
      }
    });
  };

  const displayChange = function (editBtn, display) {
    const l = editBtn.offset().left,
      t = editBtn.offset().top;
    $("#change").css({top: t + 30, left: l});
    $("#change").css({display: display});
  };

  //检查ele的值是否满足提供的正则检查
  const validCheck = function (ele, pattern) {
    const v = $(ele).val();
    if (!pattern.test(v)) {
      $(ele).addClass("alert-danger");
    } else {
      $(ele).removeClass("alert-danger");
    }
  };

  const goTop = function () {
    $(document).scroll(function () {
      const scrollTop = $(document).scrollTop(),
        headerHeight = $("#header").height();
      if (scrollTop > headerHeight) {
        //滚动距离超过了header，则展示返回顶部按钮
        $("#goTop").show();
      } else {
        $("#goTop").hide();
      }
    });
    $("#goTop").click(function () {
      $("html,body").animate({
        scrollTop: 0
      }, 400);
    });
  };

  const goBottom = function () {
    $("html,body").animate({
      scrollTop: document.body.scrollHeight
    }, 1000);
  };

  const isMobile = function () {
    const w = $(window).width(),
      h = $(window).height();

    return w < h;
  };

  //非通用trim，只是用来获取组名，去除删除按钮的x字符
  const strTrim = function (ori) {
    return ori.split('×')[0].trim();
  };

  return {
    debug: debug,
    getCookie: getCookie,
    handleUrl: handleUrl,
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

const db = (function () {
  const add = function (collection, findPattern, data, fn, msg) {
    common.dbOperation({
      url: "/add",
      collection,
      findPattern,
      data,
      fn,
      msg
    });
  };
  const update = function (collection, findPattern, data, fn, msg) {
    common.dbOperation({
      url: "/update",
      collection,
      findPattern,
      data,
      fn,
      msg
    });
  };
  const remove = function (collection, findPattern, data, fn, msg) {
    common.dbOperation({
      url: "/remove",
      collection,
      findPattern,
      data,
      fn,
      msg
    });
  };
  const find = function (collection, findPattern, fn, msg) {
    common.dbOperation({
      url: "/select",
      collection,
      findPattern,
      fn,
      msg
    });
  };

  return {
    add: add,
    update: update,
    remove: remove,
    find: find
  };
})();

//跟页面相关的操作
const page = (function ($) {
  const showLoginPannel = function () {
    $("#login").on("click", function () {
      $("#loginPannel").modal("show");
    });
  };

  const setUserName = function () {
    const user = common.getCookie("name");
    $("#loginUser").text(user);
  };

  const linkModify = function () {
    $("span.glyphicon.glyphicon-edit").click(function (e) {
      const that = e.target;
      $("#change").attr("linkName", $(this).prev().text().trim());
      if ($("#change").css("display") === "none") {
        $(this).parents(".links").unbind("mouseout");
        common.displayChange($(this), "block");
        //  信息回填
        db.find("links",{
          group: common.strTrim($(that).parent().parent().siblings(".group").children(".groupName").text()),
          linkName: $(that).prev().text().trim()
        },function (ret) {
          const data = ret[0];
          const url = data.url;
          const linkName = data.linkName;
          $(".modal-body .url").val(url);
          $(".modal-body .link").val(linkName);
          $(that).parent().attr("data-id", data._id);
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
          let name = $("#updatePannel .link").val(),
            url = $("#updatePannel .url").val();
          let updateCondition = {};

          url = common.handleUrl(url);
          if (!name && !url) {
            notie.alert(2, "请至少填写一项修改.", 2);
          } else {
            if (name) updateCondition.linkName = name;
            if (url) updateCondition.url = url;
            //更新数据库
            db.update("links", {
              group: common.strTrim($(that).parent().parent().siblings(".group").children(".groupName").text()),
              linkName: $(that).prev().text().trim()
            }, updateCondition, function () {
              notie.alert(1, "更新成功", 2);
              $("#updatePannel").modal("hide");
              $("#change").hide();
              if (name) $(that).prev().children("span.linkName").text(name);
              if (url) $(that).prev().attr("href", url);
            }, "");
          }
        });
      });


      $("#remove").click(function () {
        if (!login.isLogin()) {
          notie.alert(2, "请先登录！", 2);
          return;
        } else {
          //数据库删除数据
          db.remove("links",
              {},
              {linkName: $(this).parent().attr("linkName")},
              function () {
            $("#change").hide();
            $(that).parents(".links").remove();
          },
              "删除成功");
        }
      });
    });
  };

  const linkDrag = function () {
    $(".draggable-container").dad({
      draggable: ".draggable"
    });

    let oriGroup;
    $(".draggable-container").on("dadDragStart", function (e, target) {
      oriGroup = common.strTrim($(target).parent().siblings(".group").children(".groupName").text());
    });

    // e: draggable-container, droppedElement: link
    $(".draggable-container").on("dadDrop", function (e, droppedElement) {
      const newGroup = common.strTrim($(droppedElement).parent().siblings(".group").children(".groupName").text());

      if(newGroup === oriGroup) {
        return false;
      }
      const id = $(e.target).attr("data-id");
      let findPattern;
      if(id) {
        findPattern = {_id: id};
      } else {
        findPattern = {linkName: $(droppedElement).find(".linkName").text()};
      }
      db.update("links", findPattern, {group: newGroup}, function () {
        notie.alert(1, "更新成功", 2);
      }, "");
    });

  };

  const updateGroup = function () {
    $(".groupName").click(function () {
      if (!login.isLogin()) {
        notie.alert(2, "请先登录！", 2);
        return;
      } else {
        const that = $(this);
        const oriGroup = common.strTrim($(this).text());
        $("#updateGroupPannel").modal("show");
        $("#updateGroupBtn").click(function () {
          const newGroup = $(".newGroup").val();
          if (newGroup) {
            $("#updateGroupPannel").modal("hide");
            // 更新数据库
            db.update("links", {group: oriGroup}, {group: newGroup}, function () {
              if (newGroup) that.text(newGroup);
              notie.alert(1, "更新成功", 2);
            }, "");
          } else {
            notie.alert(2, "请填写组名！", 2);
          }
        });
      }
    });
  };

  const deleteGroup = function () {
    $(".groupName").hover(function () {
      $(this).children(".close").show();
    }, function () {
      $(this).children(".close").hide();
    });

    $(".removeGroupBtn").click(function (e) {
      const groupName = common.strTrim($(this).siblings(".groupName").text());
      $("#deleteGroupBtn").click(function () {
        if (!login.isLogin()) {
          notie.alert(2, "请先登录！", 2);
          return;
        } else {
          $("#removeGroupPopup").modal("hide");
          db.remove("links", {}, {group: groupName}, function () {
            //删除成功后移除该组
            $(e.target).parents(".groupWrap").remove();
          },"删除成功");
        }
      });
    });
  };

  const adjustMobile = function () {
    if (common.isMobile()) {
      const groupW = $(".groupWrap").width();
      const w = (groupW - 30) / 2;
      $(".links").css({width: w});
      $(".addNewLinks > a > span").css({fontSize: "smaller"});
    }
  };

  const asideImgHover = function () {
    $("aside .row img").hover(function (e) {
      e.stopPropagation();
      $(this).animate({height: "180px"}, 200, function () {
        common.goBottom();
      });
    }, function () {
      $(this).animate({height: "100px"});
    });
  };
  
  const wxDisplay = function () {
    $(".fa-weixin").click(function () {
      $("#wx_img_wrapper").show();
      $(".content").css({opacity: "0.2"});
      if (common.isMobile()) {
        const h = $("#wx_img_wrapper").height() - 20;
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
    linkDrag: linkDrag,
    updateGroup: updateGroup,
    deleteGroup: deleteGroup,
    adjustMobile: adjustMobile,
    //asideImgHover: asideImgHover,
    wxDisplay: wxDisplay
  };
})(jQuery);

const login = (function () {
  const isLogin = function () {
    return common.getCookie("isLogin") === "true";
  };
  return {
    "isLogin": isLogin,
    "showLoginPannel": page.showLoginPannel,
    "setUserName": page.setUserName
  };
})();

//组相关操作
const group = (function ($) {
  const ev = function () {
    // common.Listener(".addGroupBtn", "mouseover", function () {
    //   $(this).text("添加新组");
    // });
    // common.Listener(".addGroupBtn", "mouseout", function () {
    //   $(this).text("");
    // });
    common.Listener("#addGroup", "click", function () {
      $("#addNewGroupPopup").modal({
        keyboard: true,
        show: true
      });
    });

    common.Listener(".removeGroupBtn", "mouseover", function () {
      $(this).text("删除该组");
    });

    common.Listener(".removeGroupBtn", "mouseout", function () {
      $(this).text("");
    });

    common.Listener(".removeGroupBtn", "click", function () {
      $("#removeGroupPopup").modal({
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
      let addGroupName = $("#addNewGroupPopup input").val(),
        curGroupNames = [],
        duplicate = false;
      if (addGroupName) {
        $(".groupName").each(function (i, ele) {
          curGroupNames.push($(ele).text());
        });
        for (let i in curGroupNames) {
          if (curGroupNames[i] === addGroupName) {
            duplicate = true;
            break;
          }
        }
        if (duplicate) {
          notie.alert(3, "已经存在组：'" + addGroupName + ",'请输入不重复的组名！", 2);
        } else {
          //页面插入组元素
          let insertHtml = "<div class='groupWrap'><div class='group'><span class='groupName'>" + addGroupName + "<button type='button' class='close'><span aria-hidden='true'>×</span> </button> </span><span class='glyphicon glyphicon-plus addGroupBtn' aria-hidden='true'></span></div>" +
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
          db.add("links",
              {group: addGroupName},
              {group: addGroupName},
              function () {
            $(".contentwrap").append(insertHtml);
            window.location.reload();
          }, "保存成功");
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
const links = (function ($) {
  const ev = function () {
    //链接hover效果
    common.Listener(".links", "mouseover", function () {
      $(this).css({
        boxShadow: "1px 1px 10px 1px lightblue"
        // fontSize: "larger"
      });
      const editBtn = $(this).find(".glyphicon-edit");
      editBtn.show();
    });
    common.Listener(".links", "mouseout", function () {
      $(this).removeAttr("style");
      const editBtn = $(this).find(".glyphicon-edit");
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
      const insertPos = $(this).attr("index");       //新链接要添加的位置（insertAfter）
      $("#addNewLinkPopup").modal({
        keyboard: true,
        show: true
      });
      $(".saveLinkBtn").attr("index", insertPos);
    });

    //新加链接的url合法性检查
    common.Listener(".addNewLinksUrl", "change", function (e) {
      const pattern = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;
      common.validCheck(e.target, pattern);
    });

    //保存新链接
    common.Listener(".saveLinkBtn", "click", function () {
      if (!login.isLogin()) {
        notie.alert(2, "请先登录！", 2);
        return;
      }
      let name = $("#addNewLinkPopup .addNewLinksName").val(),
        url = $("#addNewLinkPopup .addNewLinksUrl").val();
      if (name && url) {
        url = common.handleUrl(url);
        let insertHtml = "<div class='links'><a target='_blank' href='" + url + "'><span class='linkName'>" + name + "</span></a><span class='glyphicon glyphicon-edit' aria-hidden='true' style='display: none;'></span></div>";
        let index = parseInt($(this).attr("index")) + 1;

        $("#addNewLinkPopup").modal('hide');
        //添加事件
        common.Listener(".links", "mouseover", function () {
          $(this).css({
            boxShadow: "1px 1px 10px 1px lightblue",
            fontSize: "larger"
          });
          const editBtn = $(this).find(".glyphicon-edit");
          editBtn.show();
        });
        common.Listener(".links", "mouseout", function () {
          $(this).css({
            boxShadow: "none",
            fontSize: "normal"
          });
          const editBtn = $(this).find(".glyphicon-edit");
          editBtn.hide();
        });

        // 存到数据库，读取用户信息，存到对应的数据库表
        const groupName = common.strTrim($(".addNewLinks[index=" + (index - 1) + "]").parent().siblings(".group").children(".groupName").text());
        db.add("links",
            {group: groupName, linkName: name},
            {group: groupName, linkName: name, url: url},
            function () {
          $(".groupWrap:nth-child(" + index + ") .links:last").before(insertHtml);
          window.location.reload();
        },
            "保存成功");
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

//通知
const notice = function () {
  //notie.alert(1,"最近HTTPS证书过期了，网站被Chrome标记为不安全，我暂时还没时间处理，请大家放心，站点不是被黑了...另外随着用户变多了，UI有必要美化美化，后面我会升级一下，敬请期待",5);
	//notie.alert(4,"大侠请放心，您保存在此的数据永远不会丢失，即使哪天网站运行不下去了，数据一样可以导出。新上线导出功能可以试试哦~",3);
	//notie.alert(4,"我太难了o(╥﹏╥)o 最近GFW发威，这几天我的VPS实例已经换了快有五六台了，每次坚挺不到几个小时就又跪了。。建议大家着急使用的尽量导出备份一下以免小站在被封的时候影响了使用",5);
};

const adjustAds = function () {
	let imgPath = "//favlink.cn/img/banner_728x90.png";
	if(common.isMobile()) {
		imgPath = "//favlink.cn/img/banner_300x250.png";
	}

	$("img#banner").attr("src", imgPath);
};

//Main
(function () {
  // http => https, debug模式关闭
  if(!common.debug){
      if (window.location.protocol === "http:") {
          window.location.href = "https://favlink.cn";
      }
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
  page.linkDrag();
  page.updateGroup();
  page.deleteGroup();
  page.adjustMobile();
  //page.asideImgHover();
  page.wxDisplay();

  //goTop
  common.goTop();

  notice();
  adjustAds();
})();

//彩蛋
(function () {
  console.info("hello 骚年，你都看到这儿来了！");
  console.info("不介意的话，打个赏吧╥﹏╥...服务器好贵。。");
  console.info("你也可以给我推荐便宜的租赁主机服务，欢迎通过页面底部的social link联系我哦。");
  console.info("如果有任何的问题或者建议，都可以通过底部的反馈链接提给我，我会第一时间响应的呢~");
})();

