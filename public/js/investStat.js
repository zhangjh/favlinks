/**
 * Created by jihong.zjh on 2016/12/2.
 */

(function ($) {
  //计算交易记录
  $.ajax({
    url: "/investSelect"
  }).done(function (ret) {
    if(ret.status === 0){
      var data = ret.data;
      var content = "";
      var keys = ["date","name","code","rate","price","sum","total"];
      var codes = [];
      content = "<tr>";
      data.map(function (item) {
        if(codes.indexOf(item.code) == -1){
          codes.push(item.code);
        }
        keys.map(function (key) {
          if(key === "sum" || key === "total"){
            if(parseFloat(item[key]) > 0){
              content += "<td style='color: red'>" + item[key] + "</td>";
            }else {
              content += "<td style='color: green'>" + item[key] + "</td>";
            }
          }else {
            content += "<td>" + item[key] + "</td>";
          }
        });
        content += "</tr>";
      });
      $("#record > tbody").html(content);

      var promise = [];
      codes.map(function (code) {
        var html = "";
        promise.push(new Promise(function (resolve, reject) {
          $.ajax({
            url: "/getSumInfo",
            // async: false,
            data: {code: code}
          }).done(function (ret) {
            var rate = (ret.data.total - ret.data.input) / ret.data.input * 100;
            rate = rate.toFixed(2);
            var rateHtml = "";
            if(rate > 0){
              rateHtml = "<td style='color: red'>" + rate + "%" + "</td>";
            }else {
              rateHtml = "<td style='color: green'>" + rate + "%" + "</td>";
            }
            html += "<tr><td>" + ret.data.name
              + "</td><td>" + code
              + "</td><td>" + ret.data.sum
              + "</td><td>" + ret.data.total
              + "</td><td>" + ret.data.input
              + "</td>" + rateHtml
              + "</tr>";
            resolve(html);
          });
        }));
      });
      Promise.all(promise).then(function (ret) {
        var html = "";
        ret.map(function (item) {
          html += item;
        });
        console.log(html);
        $("#sumStatics > tbody").html(html);
      });
    }
  });
})(jQuery);

