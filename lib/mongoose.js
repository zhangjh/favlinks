/*
 * Des：mongodb连接函数
 * Author：njhxzhangjihong@126.com
 * Date：5/4/2016
 * Ver：1.0
 * */

var DEBUG = false;
var DB_IP = "127.0.0.1",
    DB_PORT = "20172",
    DB_NAME = "favlinks";

if(DEBUG){
    DB_IP = "23.105.211.199";
}
var DB_URL = "mongodb://" + DB_IP + ":" + DB_PORT + "/" + DB_NAME;

var mongoose = require("mongoose");

console.log("DB_URL: " + DB_URL);

//定义schema
function defineSchema(collection){
    switch(collection){
        case "links":
            return new mongoose.Schema({
                id: {type: Number},
				gmtCreate: {
					type: Date,
        			default: Date.now
				},
				gmtModified: {
					type: Date,
					default: Date.now
				},
				timestamps: { createdAt: 'gmtCreate', updatedAt: 'updateTime'},
                user: {type: String},
                group: {type: String},
                linkName: {type: String,default:""},
                url: {type: String,default:""}
            });
            break;
        case "user":
            return new mongoose.Schema({
                id: {type: Number}, 
                gmtCreate: {
					type: Date,
        			default: Date.now
				},
				gmtModified: {
					type: Date,
					default: Date.now
				},
				timestamps: { createdAt: 'gmtCreate', updatedAt: 'updateTime'},
				user: {type: String},
                passwd: {type: String},
                email: {type: String}
            });
            break;
        case "statics":
            return new mongoose.Schema({
                timestamp: {type: String},
                ua: {type: String},
                referer: {type: String},
                curUrl: {type: String},
                ip: {type: String},
                addr: {type: String}
            });
		case "visit":
			return new mongoose.Schema({
				cnt: {type: String},
				url: {type: String}
			});
        case "domdot":
            return new mongoose.Schema({
                ip: {type: String},
                ua: {type: String},
                type: {type: String},
                time: {type: String}
            });
            break;
        case "invest":
          return new mongoose.Schema({
            date: {type: String},
            name: {type: String},
            code: {type: String},
            rate: {type: String},
            price: {type: String},
            sum: {type: String},
            total: {type: String}
          });
          break;
      case "investInput":
          return new mongoose.Schema({
              code: {type: String},
              input: {type: String}
          });
          break;
    default:
        return new mongoose.Schema({
            id: {type: Number},
            user: {type: String}
        });
        break;
    }
}

function connect(collection,cb){
    var db = mongoose.createConnection(DB_URL);
    db.on('error',function(e){
        return console.error(e);        
    });

    db.once('open',function(){
        var tableSchema = defineSchema(collection);  
        //将schema发布为model
        var tableModel = db.model(collection,tableSchema);
        if(!db.model(collection)){
            return console.error("model list deploy failed!");
        }
        
        if(cb)cb(db,tableModel);
    });
}

//insert
exports.insert = function(collection,data,callback){
    connect(collection,function(db,tableModel){
        var mongoEntity = new tableModel(data);
        mongoEntity.save(function(e){
            db.close();
            if(e)callback(e); 
            else callback("insert ok.");
        });
    });
};

//find
exports.find = function(collection,findPattern,callback){
    connect(collection,function(db,tableModel){
        tableModel.find(findPattern).exec(function(e,res){
            db.close();
            if(e)callback(e);    
            else callback(res);
        });        
    });
};

//update
exports.update = function(collection,updateCondition,update,options,callback){
    connect(collection,function(db,tableModel){
        tableModel.find(updateCondition,function(e,res){
            if(res){
                tableModel.update(updateCondition,update,options,function(e){
                        db.close();
                        if(e)callback(e);
                        else callback("Update ok!");
                    });
            }else {
                callback("Update error: No this data exist.");
            }    
        });        
    });
};

//remove 
exports.remove = function(collection,removeCondition,callback){
    connect(collection,function(db,tableModel){
        tableModel.find(removeCondition,function(e,res){
            if(res){
                tableModel.remove(removeCondition,function(e){
                    db.close();
                    if(e)callback(e);
                    else callback("Remove ok!");
                });
            }else {
                callback("Remove error: No this data exist.");
            }
        });        
    });
};
