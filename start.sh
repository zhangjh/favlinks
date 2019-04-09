#!/bin/bash

MODE=$1
if [[ "X$1" == "X" ]];then
  MODE="false"
fi

##1. 查找服务进程杀之
ps -ef | grep "node" | awk '{print $2}' | grep -v grep | xargs kill
#
##2. 本地化
sed -i "s/DEBUG =.*/DEBUG = ${MODE};/" lib/mongoose.js

#cp login.js ./routes/
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

#5. iptables端口转发
#sudo /sbin/iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000
