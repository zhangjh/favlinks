var changeSize = function(){
    var width = $(".navbar-header").width();
    var scale = 0.54;

    $("#logofont").css({
        width: width * scale
    });
};

$(window).on("resize",function () {
    changeSize();
});

changeSize();

