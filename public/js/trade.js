/**
 * Created by jihong.zjh on 2016/12/1.
 */

var inputEles = (function () {
  var nameEle = $("input[name='name']");
  var codeEle = $("input[name='code']");
  var priceEle = $("input[name='price']");
  var sumEle = $("input[name='sum']");
  var rateEle = $("input[name='rate']");

  var empty = /.+/;
  var digit = /^\d{6}$/;
  var digitDot = /^\d+\.?\d+$/;

  var inputEles = [
    {ele:nameEle,rule:empty},
    {ele:codeEle,rule:digit},
    {ele:priceEle,rule:digitDot},
    {ele:sumEle,rule:digitDot},
    {ele:rateEle,rule:digitDot}];

  return inputEles;
})();

function isEmpty(value) {
  if(value.toString().length){
    return false;
  }
  return true;
}

function showButton(inputEles) {
  var flag = true;
  inputEles.map(function (item) {
    if(isEmpty(item.ele.val())){
      flag = false;
    }
  });
  if(flag){
    $("#buy").removeAttr("disabled");
    $("#sell").removeAttr("disabled");
  }
}

function inputCheck() {
  var checkFum = function (ele,rule) {
    if(!rule.test($(ele).val())){
      $(ele).addClass("alert-danger");
    }else {
      $(ele).removeClass("alert-danger");
    }
  };

  inputEles.map(function (item) {
    item.ele.keyup(function () {
      checkFum($(this),item.rule);
      showButton(inputEles);
    });
  });
}

function buyOrsell(name,code,price,rate,sum,total) {
  var p = [];
  p.push(new Promise(function (resolve, reject) {
    $.ajax({
      url: "/investAdd",
      type: "post",
      data: {
        name: name,
        code: code,
        price: price,
        rate: rate,
        sum: sum,
        total: total
      }
    }).done(function (ret) {
      resolve(ret.status);
    }).fail(function () {
      reject("write invest fail");
    });
  }));

  p.push(new Promise(function (resolve, reject) {
    $.ajax({
      url: "/getInput",
      data: {
        code: code,
        input: total,
        token: "wieldSheep"
      }
    }).done(function (ret) {
      resolve(ret.status);
    }).fail(function () {
      reject("write investInput failed");
    });
  }));

  Promise.all(p).then(function (ret) {
    var flag = true;
    ret.map(function (item) {
      //状态不为0代表失败
      if(item)flag = false;
    });
    if(flag)alert("提交成功");
    else {
      alert("提交失败");
    }
  }).catch(function (ret) {
    alert(ret);
  });
}

(function ($) {
  inputCheck();

  $("#sell").on("click",function () {
    var name = $("input[name='name']").val();
    var code = $("input[name='code']").val();
    var price = $("input[name='price']").val();
    var rate = $("input[name='rate']").val();
    var sum = $("input[name='sum']").val();
    var total = -(parseFloat(sum) * parseFloat(price)).toFixed(2);
    buyOrsell(name,code,price,rate,sum,total);
  });

  $("#buy").on("click",function () {
    var name = $("input[name='name']").val();
    var code = $("input[name='code']").val();
    var price = $("input[name='price']").val();
    var rate = $("input[name='rate']").val();
    var sum = $("input[name='sum']").val();
    var total = (parseFloat(sum) * parseFloat(price)).toFixed(2);
    buyOrsell(name,code,price,rate,sum,total);
  });
})(jQuery);