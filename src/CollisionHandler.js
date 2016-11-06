/**
 * 碰撞计算
 * @param gameServer
 * @constructor
 */
function CollisionHandler(gameServer) {
    // Can make config values for these
    this.baseEatingDistanceDivisor = 3;
    this.baseEatingMassRequired = 1.3;
    this.gameServer = gameServer;
}

module.exports = CollisionHandler;

/**
 * 自己分裂的多个圆, 计算在举例过近时, 向外弹保持一定距离的方法
 *
 * @param {PlayerCell} cell 自己的一个圆
 * @param {PlayerCell} check 自己的另一个圆
 * @returns {boolean}
 */
CollisionHandler.prototype.pushApart = function(cell, check) {
    if (cell.nodeId == check.nodeId) return; // Can't collide with self

    var cartesian = cell.position.clone().sub(check.position);

    var dist = cartesian.distance();
    var angle = cartesian.angle();
    var maxDist = cell.getSize() + check.getSize();

    if (dist < maxDist) {
        // Push cell apart
        var mult = Math.sqrt(check.mass / cell.mass) / 2;
        var outward = (maxDist - dist) * mult;

        // Resolve jittering
        outward = Math.min(outward, maxDist - dist);

        cell.position.add(
            Math.sin(angle) * outward,
            Math.cos(angle) * outward
        );
        return true;
    } else return false;
};

/**
 * 计算被检测细胞是否可以被当前细胞吞噬掉
 *
 * @param cell
 * @param check
 * @returns {boolean}
 */
CollisionHandler.prototype.canEat = function(cell, check) {
    // Error check
    if (!cell || !check) return;

    // Can't eat self 自己不能吃
    if (cell.nodeId == check.nodeId) return false;

    // 刚刚被其他物体检测到可以吃掉, 做了inRange标记, 等待执行吃掉逻辑 Cannot eat/be eaten while in range of someone else
    if (check.inRange || cell.inRange) return false;

    var multiplier = this.baseEatingMassRequired;

    // Eating own cells is allowed only if they can merge
    if (cell.cellType == 0 && check.cellType == 0) {
        if (cell.owner.pID == check.owner.pID) {
            // Check recombine if merge override wasn't triggered
            if (!cell.owner.mergeOverride)
                if (!cell.shouldRecombine || !check.shouldRecombine) return false;

            // Can eat own cells with any mass
            multiplier = 1.0;
        } else {
            if (this.gameServer.gameMode.haveTeams &&
                cell.owner.team == check.owner.team) return false; // Same team cells can't eat each other
        }
    }

    // Too small to eat, 自己太渺小, 小于被吃物体
    if (check.mass * multiplier > cell.mass) return false;

    // Lastly, check eating distance
    // 两者实际距离
    var dist = cell.position.sqDistanceTo(check.position);
    // 容忍最小距离自己半径 + 被检测圆半径小一圈(不会有一点相交就吃掉, 要相交一定程度)
    var minDist = cell.getSquareSize() - check.getSquareSize() / this.baseEatingDistanceDivisor;

    return dist < minDist;
};
