#!/bin/bash
## 定期备份mongodb数据库
## mongodb启动命令： ./mongod -h xx --port xx --bind_ip xxx --dbpath xx --logpath xx

MODE=$1
DB_PATH=$2
if [ "X$MODE" == "X" ];then
  MODE="bak"
fi

PATH_PRE="/mnt/nas/dev"
MONGO_DIR="/mongodb"
DB_NAME="favlinks"
DB_PORT="20172"
BAK_BASE="/back/favlinks"
CURTIME=`date +%Y%m%d`
BAK_NAME=${BAK_BASE}${CURTIME}

if [ "$MODE" == "bak" ];then
  echo "开始备份..."
  cd ${MONGO_DIR}/bin
  ./mongodump --port ${DB_PORT} -d ${DB_NAME} -o ${BAK_NAME}   
  if [ $? -ne 0 ];then
    echo "备份失败"
    exit 1
  fi
  echo "备份成功"
  exit 0
fi

if [ "$MODE" == "restore" ];then
  echo "开始恢复..."
  cd ${MONGO_DIR}/bin
  ./mongorestore --port ${DB_PORT} -d ${DB_NAME} ${DB_PATH}
  if [ $? -ne 0 ];then
    echo "恢复失败"
    exit 1
  fi
  echo "恢复成功"
  exit 0
fi
