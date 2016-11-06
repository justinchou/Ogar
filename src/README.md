服务器逻辑分析
====

## 消息通信协议

基于二进制进行组装消息

接收到的消息经由PacketHandler的handleMessage方法解析, 获取到packetId后分发到指定逻辑

发送的消息都是经过packet文件夹下面的数据结构进行 new PacketName(xx) 然后传入GameServer中定义的 ws.sendPacket() 方法
最后调用packet.build()方法进行压缩成指定的二进制, 发送到客户端

## 服务器基本架构

1. index.js 引入在CommandList定义的命令, 启动GameServer服务器
2. Game