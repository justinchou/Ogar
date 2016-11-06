var Packet = require('./packet');
var Vector = require('./modules/Vector');

/**
 * 消息接受解析类
 *
 * 在 GameServer 中与客户端建立连接时创建, 作为ws(client)的属性存在
 *
 * @param gameServer
 * @param socket
 * @constructor
 */
function PacketHandler(gameServer, socket) {
    this.gameServer = gameServer;
    this.socket = socket;
    // Detect protocol version - we can do something about it later
    this.protocolVersion = 0;

    // 缓存客户端操作, 在执行循环时进行判断, 执行相应方法后重置为false, 个人不推荐在此设定标记, 应该有一个统一的数据管理层
    this.pressQ = false;
    this.pressW = false;
    this.pressSpace = false;
}

module.exports = PacketHandler;

/**
 * 接收到客户端传入消息时调用, 用于解析消息内容
 *
 * @param message
 */
PacketHandler.prototype.handleMessage = function(message) {
    // 将字符串转换为8位的数组
    function stobuf(buf) {
        var length = buf.length;
        var arrayBuf = new ArrayBuffer(length);
        var view = new Uint8Array(arrayBuf);

        for (var i = 0; i < length; i++) {
            view[i] = buf[i];
        }

        return view.buffer;
    }

    // Discard empty messages
    if (message.length == 0) {
        return;
    }

    var buffer = stobuf(message);
    var view = new DataView(buffer);    // DataView是JS中特有的以8位为单位的数组 [10001000, 11010010, ...]
    var packetId = view.getUint8(0, true);    // 消息协议中规定第一个8位用于存储packageId (0-255)

    //console.log("receive msg data " + packetId + " " + Date.now());

    // 不同packageId表示的协议在此分发
    switch (packetId) {
        case 0:
            // Set Nickname 设置昵称
            console.log("Client Call 0");
            if (this.protocolVersion == 5) {
                // Check for invalid packets
                if ((view.byteLength + 1) % 2 == 1) {
                    var maxLen = this.gameServer.config.playerMaxNickLength * 2; // 2 bytes per char
                    break;
                }
                var nick = "";
                for (var i = 1; i < view.byteLength && i <= maxLen; i += 2) {
                    var charCode = view.getUint16(i, true);
                    if (charCode == 0) {
                        break;
                    }

                    nick += String.fromCharCode(charCode);
                }
                this.setNickname(nick);
            } else {
                var name = message.slice(1, message.length - 1).toString().substr(0, this.gameServer.config.playerMaxNickLength);
                this.setNickname(name);
            }
            break;
        case 1:
            // Spectate mode
            if (this.socket.playerTracker.cells.length <= 0) {
                // Make sure client has no cells
                this.socket.playerTracker.spectate = true;
            }
            console.log("Client Call 1");
            break;
        case 16:
            // Set Target 鼠标移动
            // console.log("Client Call 16 - receive mouse move msg data " + packetId + " " + Date.now() + " " + client.mouse.x + ":" + client.mouse.y);
            if (view.byteLength == 13) {
                var client = this.socket.playerTracker;
                client.mouse.x = view.getInt32(1, true) - client.scrambleX;
                client.mouse.y = view.getInt32(5, true) - client.scrambleY;
            }
            client.movePacketTriggered = true;
            break;
        case 17:
            // Space Press - Split cell
            this.pressSpace = true;
            console.log("Client Call 17");
            break;
        case 18:
            // Q Key Pressed
            this.pressQ = true;
            console.log("Client Call 18");
            break;
        case 19:
            // Q Key Released
            console.log("Client Call 19");
            break;
        case 21:
            // W Press - Eject mass
            console.log("Client Call 21");
            this.pressW = true;
            break;
        case 254:
            // Connection Start
            console.log("Client Call 254");
            if (view.byteLength == 5) {
                this.protocolVersion = view.getUint32(1, true);
                // Send on connection packets
                this.socket.sendPacket(new Packet.ClearNodes(this.protocolVersion));
                var c = this.gameServer.config;
                this.socket.sendPacket(new Packet.SetBorder(
                    c.borderLeft + this.socket.playerTracker.scrambleX,
                    c.borderRight + this.socket.playerTracker.scrambleX,
                    c.borderTop + this.socket.playerTracker.scrambleY,
                    c.borderBottom + this.socket.playerTracker.scrambleY
                ));
            }
            break;
        case 255:
            console.log("Client Call 255");
            if (view.byteLength == 5) {

                // Set client's center pos to middle of server
                var borders = this.gameServer.rangeBorders(),
                    playerTracker = this.socket.playerTracker;
                playerTracker.centerPos = new Vector(borders.x, borders.y);
                playerTracker.sendPosPacket(1.5 / (Math.sqrt(200) / Math.log(200)));
            }
            break;
        default:
            break;
    }
};

PacketHandler.prototype.setNickname = function(newNick) {
    var client = this.socket.playerTracker;
    if (client.cells.length < 1) {
        // Set name first
        client.setName(newNick);

        // Clear client's nodes
        this.socket.sendPacket(new Packet.ClearNodes());

        // If client has no cells... then spawn a player
        this.gameServer.gameMode.onPlayerSpawn(this.gameServer, client);

        // Turn off spectate mode
        client.spectate = false;
    }
};
