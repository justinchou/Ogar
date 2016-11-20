function PlayerHandler(gameServer) {
    /**
     * playerTracker
     *
     * 链接的时候通过GameServer.start() -> connectionEstablished(ws) -> addClient(ws)
     *
     * ---------- 与 GameServer.clients 区别在于, 本数组是循环清空, 然后用定时器重新加入的 ------------ 此处注释错误, 更新于2016-11-7 20:55:52.
     * GameServer.clients 存储的是WebSocket链接, 但是toUpdate存储的是PlayerTracker
     *
     * @type {Array}
     */
    this.toUpdate = [];
    this.gameServer = gameServer;
}

module.exports = PlayerHandler;

PlayerHandler.prototype.update = function() {
    var time = new Date();

    // 循环所有有效链接 Todo: 检测bug, 当!client为真时, 是否会出现死循环???
    while (this.toUpdate.length > 0) {
        var client = this.toUpdate[0];
        if (!client) continue;
        if (client.fullyDisconnected) continue;

        // Update client 对Client中缓存的数据进行执行
        client.update();
        client.antiTeamTick();

        // 此处将客户端链接从数组内弹出, 然后定时40ms之后, 重新加入该数组 Todo: 此处要检验是否所有的链接在40ms之内都会处理完, 如果上一个循环无法处理完毕, 此处设定为40ms将会有bug
        this.toUpdate.shift(); // Todo 将本语句放到 var client = this.toUpdate[0]; 和 if (!client) continue; 之间可以解除前面所涉及的 当!client为真情况下的死循环
        // Continue bind
        setTimeout(function() {
            // 如果是已经断开链接的, 就不再加入, 说明: 此处的this是bind时传入的client, 需要略微注意
            if (this.fullyDisconnected) return;
            this.gameServer.playerHandler.toUpdate.push(this);
        }.bind(client), 40);
    }

    // 记录本次处理完所有操作所用时间, 这里回头来看上面40ms的时间是否合理
    this.gameServer.ticksMapUpdate = new Date() - time;
};

/**
 * 在客户端连接的时候调用, 传入ws(client)
 *
 * @param {WebSocket.Client} client
 */
PlayerHandler.prototype.addClient = function(client) {
    this.toUpdate.push(client.playerTracker);
    this.gameServer.nodeHandler.toUpdate.push(client.playerTracker);
};
