/*
 * Des：mongodb连接函数
 * Author：njhxzhangjihong@126.com
 * Date：5/4/2016
 * Ver：1.0
 * */

var DB_IP = "10.101.83.8",
    DB_PORT = "27017",
    DB_NAME = "favlinks";
var DB_URL = "mongodb://" + DB_IP + ":" + DB_PORT + "/" + DB_NAME;

var mongoose = require("mongoose");

console.log("DB_URL: " + DB_URL);

//定义schema
function defineSchema(collection){
    switch(collection){
        case "favlinks":
            return new mongoose.Schema({
                id: {type: Number},
                user: {type: String},
                group: {type: String},
                linkName: {type: String},
                url: {type: String}
            });
            break;
        case "user":
            return new mongoose.Schema({
                id: {type: Number}, 
                user: {type: String},
                passwd: {type: String},
                email: {type: String}
            });
            break;
        default:
            return new mongoose.Schema({
                id: {type: Number},
                user: {type: String},
            });
            break;
    }
}

function connect(cb){
    var db = mongoose.createConnection(DB_URL);
    db.on('error',function(e){
        return console.error(e);        
    });

    db.once('open',function(){
        var tableSchema = defineSchema();  
        //将schema发布为model
        var tableModel = db.model(collection,tableSchema);
        if(!db.model(collection)){
            return console.error("model list deploy failed!");
        }
        
        if(cb)cb();
    });
}

//insert
exports.insert = function(collection,data,callback){
    connect(function(){
        var mongoEntity = new tableModel(data); 
        mongoEntity.save(function(e){
            if(e)return console.error(e); 
            db.close();
            if(callback)callback();
        });
    });
};

//find
exports.find = function(collection,findPattern,callback){
    connect(function(){
        tableModel.find(findPattern).exec(function(e,res){
            if(e)return console.error(e);    
            db.close();
            if(callback)callback();
        });        
    });
};

//update
exports.update = function(collection,updateCondition,update,options,callback){
    connect(function(){
        tableModel.find(updateCondition,function(e,res){
            if(res){
                tableModel.update(updateCondition,update,options,function(e){
                        if(e)return console.error(e);
                        else callback("Update ok!");
                        db.close();
                    });
            }else {
                callback("Update error: No this data exist.");
            }    
        });        
    });
};

//remove 
exports.remove = function(collection,removeCondition,callback){
    connect(function(){
        tableModel(removeCondition,function(e,res){
            if(res){
                tableModel.remove(removeCondition,function(e){
                    if(e)return console.error(e);
                    else callback("Remove ok!");
                    db.close();
                });
            }else {
                callback("Remove error: No this data exist.");
            }
        });        
    });
};
