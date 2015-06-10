var Packet = require('./packet');
var GameServer = require('./GameServer');

function PlayerTracker(gameServer, socket) {
    this.name = "";
    this.gameServer = gameServer;
    this.socket = socket;
    this.nodeDestroyQueue = [];
    this.visibleNodes = [];
    this.cells = [];
    this.score = 0; // Needed for leaderboard

    this.mouse = {x: 0, y: 0};
    this.tickLeaderboard = 0; // 
    this.tickViewBox = 0;
    
    this.team = 0;
    this.spectate = false;
    this.spectatedPlayer = -1; // Current player that this player is watching
    
    // Viewing box
    this.sightRange = 0;
    this.centerPos = {x: 0, y: 0 }
    this.viewBox = {
        topY: 0,
        bottomY: 0,
        leftX: 0,
        rightX: 0,
        width: 0 // Half-width
    }
    
    // Gamemode function
    if (gameServer) {
        this.color = gameServer.getRandomColor(); // Get color
        gameServer.gameMode.onPlayerInit(this);
    }
}

module.exports = PlayerTracker;

// Setters/Getters

PlayerTracker.prototype.setName = function(name) {
    this.name = name;
}

PlayerTracker.prototype.getName = function() {
    return this.name;
}

PlayerTracker.prototype.getScore = function(reCalcScore) {
    if (reCalcScore) {
        var s = 0;
        for (var i = 0; i < this.cells.length; i++) {
            s += this.cells[i].mass;
            this.score = s;
        }
    }
    return this.score;
}

PlayerTracker.prototype.setColor = function(color) {
    this.color.r = color.r;
    this.color.b = color.b;
    this.color.g = color.g;
}

PlayerTracker.prototype.getTeam = function() {
    return this.team;
}

// Functions

PlayerTracker.prototype.update = function() {
	// Actions buffer (So that people cant spam packets)
    if (this.socket.packetHandler.pressSpace) { // Split cell
        this.gameServer.gameMode.pressSpace(this.gameServer,this);
        this.socket.packetHandler.pressSpace = false;
    } if (this.socket.packetHandler.pressW) { // Eject mass
        this.gameServer.gameMode.pressW(this.gameServer,this);
        this.socket.packetHandler.pressW = false;
    } if (this.socket.packetHandler.pressQ) { // Q Press
        //this.socket.sendPacket(new Packet.DrawLine(this.mouse.x,this.mouse.y));
        this.gameServer.gameMode.pressQ(this.gameServer,this);
        this.socket.packetHandler.pressQ = false;
    }
    
	// Remove nodes from visible nodes if possible
    for (var i = 0; i < this.nodeDestroyQueue.length; i++) {
        var index = this.visibleNodes.indexOf(this.nodeDestroyQueue[i]);
        if (index > -1) {
            this.visibleNodes.splice(index, 1);
        }
    }

    // Get visible nodes every 200 ms
    var nonVisibleNodes = []; // Nodes that are not visible
    if (this.tickViewBox <= 0) {
        var newVisible = this.calcViewBox();
        
        // Compare and destroy nodes that are not seen
        for (var i = 0; i < this.visibleNodes.length; i++) {
            var index = newVisible.indexOf(this.visibleNodes[i]);
            if (index == -1) {
                // Not seen by the client anymore
                nonVisibleNodes.push(this.visibleNodes[i]);
            }
        }
        
        this.visibleNodes = newVisible;
        // Reset Ticks
        this.tickViewBox = 4;
    } else {
        this.tickViewBox--;
    }
    
    // Send packet
    this.socket.sendPacket(new Packet.UpdateNodes(this.nodeDestroyQueue.slice(0), this.visibleNodes, nonVisibleNodes));

    this.nodeDestroyQueue = []; // Reset destroy queue

    // Update leaderboard
    if (this.tickLeaderboard <= 0) {
        this.socket.sendPacket(this.gameServer.lb_packet);
        this.tickLeaderboard = 40; // 40 ticks = 2 seconds
    } else {
        this.tickLeaderboard--;
    }
    
}

// Viewing box

PlayerTracker.prototype.updateSightRange = function() { // For view distance
    var totalSize = 1.0;
    var len = this.cells.length;
    
    for (var i = 0; i < len;i++) {
    	
        if (!this.cells[i]) {
            continue;
        }
    	
        totalSize += this.cells[i].getSize();
    }
    this.sightRange = this.gameServer.config.serverViewBase / Math.pow(Math.min(64.0 / totalSize, 1), 0.4);
}

PlayerTracker.prototype.updateCenter = function() { // Get center of cells
	var len = this.cells.length;
	
    if (len <= 0) {
        return; // End the function if no cells exsist
    }
    
    var X = 0;
    var Y = 0;
    for (var i = 0; i < len ;i++) {
    	
        if (!this.cells[i]) {
            continue;
        }
    	
        X += this.cells[i].position.x;
        Y += this.cells[i].position.y;
    }
    
    this.centerPos.x = X / len >> 0;
    this.centerPos.y = Y / len >> 0;
}

PlayerTracker.prototype.calcViewBox = function() {
    if (this.spectate) {
        // Spectate mode
		return this.getSpectateNodes();
    }
		
    // Main function
    this.updateSightRange();
    this.updateCenter();
	
    // Box
    this.viewBox.topY = this.centerPos.y - this.sightRange;
    this.viewBox.bottomY = this.centerPos.y + this.sightRange;
    this.viewBox.leftX = this.centerPos.x - this.sightRange;
    this.viewBox.rightX = this.centerPos.x + this.sightRange;
    this.viewBox.width = this.sightRange;
	
    var newVisible = [];
    for (var i = 0; i < this.gameServer.nodes.length ;i++) {
        node = this.gameServer.nodes[i];
		
        if (!node) {
            continue;
        }
		
        if (node.visibleCheck(this.viewBox,this.centerPos)) {
            // Cell is in range of viewBox
            newVisible.push(node);
        }
    }
    return newVisible;
}

PlayerTracker.prototype.getSpectateNodes = function() {
	var specPlayer;
		
	if (this.gameServer.getMode().specByLeaderboard) {
		this.spectatedPlayer = Math.min(this.gameServer.leaderboard.length - 1, this.spectatedPlayer);
		specPlayer = this.spectatedPlayer == -1 ? null : this.gameServer.leaderboard[this.spectatedPlayer];
	} else {
		this.spectatedPlayer = Math.min(this.gameServer.clients.length - 1, this.spectatedPlayer);
		specPlayer = this.spectatedPlayer == -1 ? null : this.gameServer.clients[this.spectatedPlayer].playerTracker;
	}
	if (specPlayer) {
		// If selected player has died/disconnected, switch spectator and try again next tick
		if (specPlayer.cells.length == 0) {
			this.gameServer.switchSpectator(this);
			return [];
		}
		// Get spectated player's location and calculate zoom amount
		var specZoom = Math.sqrt(100 * specPlayer.score);
		specZoom = Math.pow(Math.min(40.5 / specZoom, 1.0), 0.4) * 0.75;
		// TODO: Send packet elsewhere so it is send more often
		this.socket.sendPacket(new Packet.UpdatePosition(specPlayer.centerPos.x, specPlayer.centerPos.y, specZoom));
		// TODO: Recalculate visible nodes for spectator to match specZoom
		return specPlayer.visibleNodes;
	} else {
		return []; // Nothing
	}
}
