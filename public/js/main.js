var changeSize = function(){
    var width = $(".navbar-header").width();
    var scale = 0.54;

    $("#logoFont").css({
        width: width * scale
    });
};

$(window).on("resize",function () {
    changeSize();
});

changeSize();

$(".addGroupBtn").hover(function () {
    $(this).text("添加新组");
},function () {
    $(this).text("");
});

$(".addGroupBtn").on('click',function () {
    $("#addNewGroupPopup").modal({
        keyboard: true,
        show: true
    });
});

$(".addNewLinks").hover(function () {
    $(this).css({
        'box-shadow': "10px 5px 5px #888888"
    });
},function () {
    $(this).css({
        'box-shadow': "none"
    });
});

$(".addNewLinks").on('click',function () {
    $("#addNewLinkPopup").modal({
        keyboard: true,
        show: true
    });
});

$(".links").hover(function () {
    $(this).css({
        boxShadow: "1px 1px 10px 1px lightblue",
        fontSize: "larger"
    });
    $(this).find(".glyphicon-edit").show();
},function () {
    $(this).css({
        boxShadow: "none",
        fontSize: "normal"
    });
    $(this).find(".glyphicon-edit").hide();
});