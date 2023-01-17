/**
 * Created by jihong.zjh on 2023/1/16.
 * Description: 给拼音工具生成使用码
 */
const codeEles = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q',
  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

let pycode = {};

pycode.generate = function (mongoose) {
  return function (req, res) {
    let code = "";
    const total = codeEles.length;
    for (let i = 0; i < 6; i++) {
      const pos = Math.round(Math.random() * (total - 1));
      code += codeEles[pos];
    }
    const data = {
      code: code,
      mac: "",
      used: false,
      user: ""
    };
    mongoose.insert("registeredCode", data, function () {
      res.json({code});
    });
  }
};

// 后台代码
pycode.select = function (mongoose) {
  return function (req, res) {
    const code = req.query.code;
    const user = req.query.user;
    const passwd = req.query.passwd;
    // 普通查询只允许查询具体code
    if(!code && user !== "admin" && passwd !== "zhangjh") {
      return res.json("您没有权限");
    }
    const findPattern = {};
    if(code) {
      findPattern.code = code;
    }
    mongoose.find("registeredCode", findPattern, function (result) {
      if(result[0]){
        res.json({status:0,data:result});
      }else {
        res.json({status:1,data:"No results found."});
      }
    });
  }
};

pycode.update = function (mongoose) {
  return function (req, res) {
    const code = req.query.code;
    const used = req.query.used;
    const mac = req.query.mac;
    const user = req.query.user;
    if(code) {
      mongoose.update("registeredCode", {code}, {used: used === 1, mac, user}, function (ret) {
        return res.json({status: 0, data: ret});
      });
    } else {
      return res.json({status: 1, data: "code参数未传"});
    }
  };
};

module.exports = pycode;