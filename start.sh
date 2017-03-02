#!/bin/bash

MODE=$1
if [[ "X$1" == "X" ]];then
  MODE="false"
fi

##1. 查找服务进程杀之
ps -ef | grep "node" | awk '{print $2}' | grep -v grep | xargs kill
#
##2. 修改数据库地址
sed -i "s/DEBUG =.*/DEBUG = ${MODE};/" lib/mongoose.js
#
##3. gulp压缩
gulp
if [ $? -ne 0 ];then
    echo "gulp压缩失败"
    exit 1
fi
#
#4. 重启服务
nohup node ./bin/www &
