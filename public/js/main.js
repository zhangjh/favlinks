var Listener = {};

Listener.event = function (ele,ev,fn) {
    ele.on(ev,fn);
};

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
                    $(this).find(".glyphicon-edit").show();
                });
                break;
            case "mouseout":
                Listener.event(ele,ev,function () {
                    $(this).css({
                        boxShadow: "none",
                        fontSize: "normal"
                    });
                    $(this).find(".glyphicon-edit").hide();
                });
                break;
        }
    },
    saveGroupCb: function (ele,ev) {
        if(ev == "click"){
            Listener.event(ele,ev,function () {
                var addGroupName = $("#addNewGroupPopup input").val();
                var curGroupNames = [];
                var duplicate = false;
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

                    $(".groupWrap:last").append(insertHtml);
                    $("#addNewGroupPopup").modal("hide");
                    //增加事件
                    effectFuns.addLinkCb($(".addNewLinks"),"mouseover");
                    effectFuns.addLinkCb($(".addNewLinks"),"mouseout");
                    effectFuns.addLinkCb($(".addNewLinks"),"click");
                    //保存新组数据到数据库
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
                var name = $("#addNewLinkPopup .addNewLinksName").val();
                var url = $("#addNewLinkPopup .addNewLinksUrl").val();
                var insertHtml = "<div class='links'><a target='_blank' href='" + url + "'><span class='linkName'>" + name+ "</span></a><span class='glyphicon glyphicon-edit' aria-hidden='true' style='display: none;'></span></div>";
                var index = parseInt($(this).attr("index")) + 1;
                $(".groupWrap:nth-child(" + index + ") .links:last").before(insertHtml);
                $("#addNewLinkPopup").modal('hide');
                //添加事件
                effectFuns.linkCb($(".links"),"mouseover");
                effectFuns.linkCb($(".links"),"mouseout");
                //存到数据库，读取用户信息，存到对应的数据库表

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
    $.ajax({
        url: url,
        data: {collection:collection,data:data}
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
