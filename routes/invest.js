/**
 * Created by jihong.zjh on 2016/12/1.
 * Description: 基金定投交易&记录工具
 */
var invest = {};

invest.trade = function () {
  return function (req, res) {
    res.render("trade_min");
  }
};

invest.stat = function (mongoose) {
  return function (req,res) {
    res.render("investStat_min");
  }
};

invest.add = function (mongoose) {
  return function (req, res) {
    var timestamp = new Date();
    var date = [timestamp.getFullYear(),timestamp.getMonth() + 1,timestamp.getDate()].join("-");
    console.log(req.body);
    var data = {
      name: req.body.name,
      code: req.body.code,
      price: req.body.price,
      rate: req.body.rate,
      sum: req.body.sum,
      total: req.body.total,
      date: date
    };
    mongoose.insert("invest",data,function (ret) {
      res.json({status: 0,msg: ret});
    });
  }
};

invest.select = function (mongoose) {
  return function (req, res) {
    var code = req.query.code;
    var findPattern = {};
    if(code){
      findPattern = {code: code};
    }
    mongoose.find("invest",findPattern,function (result) {
      if(result[0]){
        res.json({status:0,data:result});
      }else {
        res.json({status:1,data:"No results found."});
      }
    });
  }
};

invest.update = function (mongoose) {
  return function (req, res) {

  }
};

invest.getSumInfo = function (mongoose) {
  return function (req, res) {
    var code = req.query.code;
    mongoose.find("invest",{code:code},function (result) {
      if(result[0]){
        var object = {
          name: result[0].name,
          sum: 0,
          total: 0,
          input: 0
        };
        result.map(function (item) {
          object.sum += parseFloat(item.sum);
          object.total += parseFloat(item.total);
        });
        mongoose.find("investInput",{code:code},function (resu) {
          console.log(resu);
          if(resu[0]){
            object.input += parseFloat(resu[0].input);
          }
          res.json({status:0,data:object});
        });
      }else {
        res.json({status:1,data:"No results found."});
      }
    });
  }
};

invest.getInput = function (mongoose) {
  return function (req, res) {
    var code = req.query.code;
    var input = req.query.input;
    var token = req.query.token;
    if(!code || !input || token !== "wieldSheep"){
      res.json({status: 1,MSG:"参数缺少，code，input必须或token非法"});
      return;
    }
    mongoose.find("investInput",{code:code},function (result) {
      if(result[0]){
        input = parseFloat(input) + parseFloat(result[0].input);
        mongoose.update("investInput",{code:code},{input:input},{},function (err) {
          console.log(err);
        });
      }else {
        mongoose.insert("investInput",{code:code,input:input},function (err) {
          console.log(err);
        });
      }
      res.json({status:0,data: {code:code,input:input}});
    });
  }
};

module.exports = invest;