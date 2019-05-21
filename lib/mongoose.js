/*
 * Des：mongodb连接函数
 * Author：njhxzhangjihong@126.com
 * Date：5/4/2016
 * Ver：1.0
 * */

const config = require("../conf/config");
const DEBUG = config.dbDebug;
let DB_IP = config.dbIp,
    DB_PORT = config.dbPort,
    DB_NAME = config.dbName;

if(DEBUG){
    DB_IP = config.dbIp;
    DB_PORT = config.dbPortTest;
    DB_NAME = config.dbNameTest;
}
const DB_URL = "mongodb://" + DB_IP + ":" + DB_PORT + "/" + DB_NAME;

const mongoose = require("mongoose");

console.info("DB_URL: " + DB_URL);

let exportsObj = {};

//定义schema
function defineSchema(collection){
    let schema = undefined;
    switch(collection){
        case "links":
            schema = new mongoose.Schema({
                id: {type: Number},
                user: {type: String},
                group: {type: String},
                linkName: {type: String,default:""},
                url: {type: String,default:""}
            },{
				timestamps: {
					createdAt: 'gmtCreate',
					updatedAt: 'gmtModified'
				}
			});
            break;
        case "user":
            schema = new mongoose.Schema({
                id: {type: Number}, 
				user: {type: String},
                passwd: {type: String},
                email: {type: String}
            },{
				timestamps: {
					createdAt: 'gmtCreate',
					updatedAt: 'gmtModified'
				}
			});
            break;
        case "statics":
            schema = new mongoose.Schema({
                timestamp: {type: String},
                ua: {type: String},
                referer: {type: String},
                curUrl: {type: String},
                ip: {type: String},
                addr: {type: String}
            });
            break;
		case "visit":
			schema = new mongoose.Schema({
				cnt: {type: String},
				url: {type: String}
			});
			break;
        case "domdot":
            schema = new mongoose.Schema({
                ip: {type: String},
                ua: {type: String},
                type: {type: String},
                time: {type: String}
            });
            break;
        case "invest":
          schema = new mongoose.Schema({
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
          schema = new mongoose.Schema({
              code: {type: String},
              input: {type: String}
          });
          break;
    default:
        schema = new mongoose.Schema({
            id: {type: Number},
            user: {type: String}
        });
        break;
    }
    return schema;
}

function connect(collection,cb){
    const db = mongoose.createConnection(DB_URL);
    db.on('error',function(e){
        return console.error(e);        
    });

    db.once('open',function(){
        let tableSchema = defineSchema(collection);
        //将schema发布为model
        let tableModel = db.model(collection,tableSchema);
        if(!db.model(collection)){
            return console.error("model list deploy failed!");
        }
        
        if(cb)cb(db,tableModel);
    });
}

exportsObj.insert = function(collection,data,callback){
    connect(collection,function(db,tableModel){
        let mongoEntity = new tableModel(data);
        mongoEntity.save(function(e){
            db.close();
            if(e)callback(e); 
            else callback("insert ok.");
        });
    });
};

exportsObj.find = function(collection,findPattern,callback){
    connect(collection,function(db,tableModel){
        tableModel.find(findPattern).exec(function(e,res){
            db.close();
            if(e)callback(e);    
            else callback(res);
        });        
    });
};

exportsObj.update = function(collection,updateCondition,update,options,callback){
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

exportsObj.remove = function(collection,removeCondition,callback){
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

module.exports = exportsObj;