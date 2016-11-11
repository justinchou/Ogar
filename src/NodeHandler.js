var Entity = require('./entity');
var Vector = require('./modules/Vector');

function NodeHandler(gameServer, collisionHandler) {
    /**
     * 存储的是在PlayerHandler中通过addClient方法加入的client.playerTracker
     * @type {Array}
     */
    this.toUpdate = [];

    /**
     * 除了PlayerCell之外的其他细胞
     * @type {Array}
     */
    this.toUpdateNodes = [];

    this.gameServer = gameServer;
    this.collisionHandler = collisionHandler;
}

module.exports = NodeHandler;

NodeHandler.prototype.update = function() {
    // Start recording time needed to update nodes
    var time = new Date();

    // 根据被吃掉的食物和癌细胞数量, 服务器随机生成新的食物, Spawning food & viruses
    var foodSpawn = Math.min(this.gameServer.config.foodMaxAmount - this.gameServer.nodesFood.length,
        this.gameServer.config.foodSpawnAmount);
    this.addFood(foodSpawn);
    var virusSpawn = this.gameServer.config.virusMinAmount - this.gameServer.nodesVirus.length;
    this.addViruses(virusSpawn);

    // 当前质量衰减, Preset mass decay
    var massDecay = 1 - (this.gameServer.config.playerMassDecayRate * this.gameServer.gameMode.decayMod / 40);

    // 循环playerTracker 更新每个玩家的所有细胞:
    while (this.toUpdate.length > 0) {
        var client = this.toUpdate[0];
        this.toUpdate.shift();
        if (!client) continue;
        if (client.fullyDisconnected) continue;

        // Merge override check
        if (client.cells.length <= 1)
            client.mergeOverride = false;

        // Add cells and sort them
        // slice(start,end) 选取子数组, end默认为结尾, 返回的新数组不影响原数组
        // sorted 就是当前循环到的客户端的细胞数组
        var sorted = client.cells.slice(0);
        // sort 默认是从小到大排序, 回调函数中, 返回>0表示a>b
        sorted.sort(function(a, b) {
            return b.mass - a.mass; // b - a 表示从大到小排序
        });

        // Precalculate decay multiplier
        var thisDecay;
        if (this.gameServer.config.serverTeamingAllowed == 0) {
            // Anti-teaming is on
            var teamMult = (client.massDecayMult - 1) / 3333 + 1; // Calculate anti-teaming multiplier for decay
            thisDecay = 1 - (1 - massDecay * (1 / teamMult)); // Apply anti-teaming multiplier
        } else {
            // Anti-teaming is off
            thisDecay = massDecay;
        }

        // Update the cells
        for (var j = 0; j < sorted.length; j++) {
            var cell = sorted[j];
            if (!cell) continue;
            if (cell.eaten) continue;

            // Move engine
            cell.moveEngineTick();
            this.gameServer.gameMode.onCellMove(cell, this.gameServer);

            // Collide if required, 本段是计算自己分裂出的多个圆是否存在位置过近相交情况, 有的话救弹开
            for (var k = 0; k < sorted.length; k++) {
                if (!sorted[k]) continue;

                // collisionRestoreTicks 判断是否在碰撞检测时间范围内, >0表示不在碰撞检测时间内
                if ((sorted[k].collisionRestoreTicks > 0 || cell.collisionRestoreTicks > 0) ||
                    (sorted[k].shouldRecombine && cell.shouldRecombine)) continue;

                this.collisionHandler.pushApart(cell, sorted[k]);
            }

            // Collision restoring, 倒计时自己的分裂出去的细胞合并的时间
            if (cell.collisionRestoreTicks > 0) cell.collisionRestoreTicks -= 0.5;

            // Eating
            cell.eat();

            // Recombining
            if (sorted.length > 1) cell.recombineTicks += 0.04;
            else cell.recombineTicks = 0;
            cell.calcMergeTime(this.gameServer.config.playerRecombineTime);

            // Mass decay
            if (cell.mass >= this.gameServer.config.playerMinMassDecay)
                cell.mass *= thisDecay;

            this.gameServer.quadTree.update(cell);
        }

        // Continue bind
        setTimeout(function() {
            if (this.fullyDisconnected) return;
            this.gameServer.nodeHandler.toUpdate.push(this);
        }.bind(client), 25);
    }

    // Client cells have been finished, now go the other cells
    while (this.toUpdateNodes.length > 0) {
        var node = this.toUpdateNodes[0];
        this.toUpdateNodes.shift();
        if (!node) continue;
        if (node.eaten) continue;

        node.moveEngineTick();
        node.eat();

        this.gameServer.quadTree.update(node);

        // Continue bind
        setTimeout(function() {
            if (this.eaten) return;
            this.gameServer.nodeHandler.toUpdateNodes.push(this);
        }.bind(node), 25);
    }

    // Record time to update
    this.gameServer.ticksNodeUpdate = new Date() - time;
};

/**
 * 在地图中增加指定数量的食物
 *
 * @param {Number} n
 */
NodeHandler.prototype.addFood = function(n) {
    if (n <= 0) return;
    for (var i = 0; i < n; i++) {
        var food = new Entity.Food(
            this.gameServer.getNextNodeId(),
            null,
            this.getRandomPosition(), // getRandomSpawn at start will lock the server in a loop
            this.gameServer.config.foodMass,
            this.gameServer
        );
        food.insertedList = this.gameServer.nodesFood;
        food.setColor(this.gameServer.getRandomColor());

        this.gameServer.addNode(food);
        this.gameServer.nodesFood.push(food);
    }
};

/**
 * 向地图中增加癌细胞
 *
 * @param {Number} n
 */
NodeHandler.prototype.addViruses = function(n) {
    if (n <= 0) return;
    for (var i = 0; i < n; i++) {
        var virus = new Entity.Virus(
            this.gameServer.getNextNodeId(),
            null,
            this.getRandomSpawn(),
            this.gameServer.config.virusStartMass,
            this.gameServer
        );

        this.gameServer.addNode(virus);
    }
};

/**
 * 随机一个位置
 *
 * @returns {Vector}
 */
NodeHandler.prototype.getRandomPosition = function() {
    var xSum = this.gameServer.config.borderRight - this.gameServer.config.borderLeft;
    var ySum = this.gameServer.config.borderBottom - this.gameServer.config.borderTop;
    return new Vector(
        Math.floor(Math.random() * xSum + this.gameServer.config.borderLeft),
        Math.floor(Math.random() * ySum + this.gameServer.config.borderTop)
    );
};

NodeHandler.prototype.getRandomSpawn = function() {
    // Find a random pellet 寻找一个随机小球
    var pellet;
    if (this.gameServer.nodesFood.length > 0) {
        while (true) {
            var randomIndex = Math.floor(Math.random() * this.gameServer.nodesFood.length);
            var node = this.gameServer.nodesFood[randomIndex];
            if (!node) continue;
            if (node.eaten) continue;

            pellet = node;
            break;
        }
    } else {
        // No food nodes - generate random position
        return this.getRandomPosition();
    }

    // Generate random angle and distance
    var randomAngle = Math.random() * 6.28;
    var randomDist = Math.random() * 100;

    // Apply angle and distance to a clone of pellet's pos
    return new Vector(
        pellet.position.x + Math.sin(randomAngle) * randomDist,
        pellet.position.y + Math.cos(randomAngle) * randomDist
    );
};

/**
 * 按W键向癌细胞开火
 *
 * @param {Virus} parent
 */
NodeHandler.prototype.shootVirus = function(parent) {
    var parentPos = {
        x: parent.position.x,
        y: parent.position.y
    };

    var newVirus = new Entity.Virus(
        this.gameServer.getNextNodeId(),
        null,
        parentPos,
        this.gameServer.config.virusStartMass,
        this.gameServer
    );

    newVirus.moveEngine = new Vector(
        Math.sin(parent.shootAngle) * 115,
        Math.cos(parent.shootAngle) * 115
    );

    // Add to cell list
    this.gameServer.addNode(newVirus);
};

/**
 * 按空格键进行细胞分裂
 *
 * @param {PlayerTracker} client
 */
NodeHandler.prototype.splitCells = function(client) {
    var len = client.cells.length;
    var splitCells = 0; // How many cells have been split
    for (var i = 0; i < len; i++) {
        var cell = client.cells[i];

        var angle = cell.position.angleTo(client.mouse.x, client.mouse.y);
        if (angle == 0 || isNaN(angle)) angle = Math.PI / 2;

        if (this.createPlayerCell(client, cell, angle, cell.mass / 2) == true) splitCells++;
    }
    if (splitCells > 0) client.applyTeaming(1, 2); // Account anti-teaming
};

NodeHandler.prototype.createPlayerCell = function(client, parent, angle, mass) {
    // Returns boolean whether a cell has been split or not. You can use this in the future.

    // Maximum controllable cells
    if (client.cells.length >= this.gameServer.config.playerMaxCells) return false;

    // Minimum mass to split
    if (parent.mass < this.gameServer.config.playerMinMassSplit) return false;

    // Create cell
    var newCell = new Entity.PlayerCell(
        this.gameServer.getNextNodeId(),
        client,
        parent.position.clone(),
        mass,
        this.gameServer
    );
    newCell.setColor(parent.getColor());

    // Set split boost's speed
    var splitSpeed = newCell.getSplittingSpeed();
    newCell.moveEngine = new Vector(
        Math.sin(angle) * splitSpeed,
        Math.cos(angle) * splitSpeed
    );

    // Cells won't collide immediately
    newCell.collisionRestoreTicks = 12;
    parent.collisionRestoreTicks = 12;

    parent.mass -= mass; // Remove mass from parent cell

    // Add to node list
    this.gameServer.addNode(newCell);
    return true;
};

/**
 * 根据CD时间判断是否满足按W键向外弹射的条件
 * @param client
 * @returns {boolean}
 */
NodeHandler.prototype.canEjectMass = function(client) {
    if (this.gameServer.time - client.lastEject >= this.gameServer.config.ejectMassCooldown) {
        client.lastEject = this.gameServer.time;
        return true;
    } else return false;
};

/**
 * 按W键 向外喷射大质量子弹
 *
 * @param client
 */
NodeHandler.prototype.ejectMass = function(client) {
    if (!this.canEjectMass(client)) return;

    for (var i = 0; i < client.cells.length; i++) {
        var cell = client.cells[i];
        if (!cell) continue;

        // Double-check just in case
        if (cell.mass < this.gameServer.config.playerMinMassEject ||
            cell.mass < this.gameServer.config.ejectMass) continue;

        var angle = cell.position.angleTo(client.mouse);

        // Get starting position
        var size = cell.getSize() + 16;
        var startPos = new Vector(
            cell.position.x - ((size) * Math.sin(angle)),
            cell.position.y - ((size) * Math.cos(angle))
        );

        // Remove mass from parent cell
        cell.mass -= this.gameServer.config.ejectMassLoss;

        // Randomize movement angle
        angle += (Math.random() * 0.6) - 0.3;

        // Create cell
        var ejected = new Entity.EjectedMass(
            this.gameServer.getNextNodeId(),
            client,
            startPos,
            this.gameServer.config.ejectMass,
            this.gameServer
        );
        ejected.moveEngine = new Vector(
            Math.sin(angle) * this.gameServer.config.ejectSpeed,
            Math.cos(angle) * this.gameServer.config.ejectSpeed
        );
        ejected.setColor(cell.getColor());

        this.gameServer.nodesEjected.push(ejected);
        this.gameServer.addNode(ejected);
    }
};
