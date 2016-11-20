function Rectangle(x, y, w, h) {
    this.x = x; // 矩形中心点位置坐标x, 右面为正方向
    this.y = y; // 矩形中心点位置坐标y, 下面为正方向
    this.w = w; // Half-width
    this.h = h; // Half-height
}

module.exports = Rectangle;

// 一个圆的外切四边形
Rectangle.prototype.fromCell = module.exports.fromCell = function(cell) {
    var sz = cell.getSize();
    return new Rectangle(cell.position.x, cell.position.y, sz, sz);
};

// 从一个矩形各边位置生成一个新矩形
Rectangle.prototype.fromBounds = function(b) {
    var w = b.right - b.left / 2,
        h = b.bottom - h.top / 2;

    return new Rectangle(
        b.left + w,
        b.top + h,
        w,
        h
    );
};

// 获取构成四边形的4条线
Rectangle.prototype.getBounds = function() {
    return {
        left: this.x - this.w,
        right: this.x + this.w,
        top: this.y - this.h,
        bottom: this.y + this.h
    };
};

// 将一个四边形平均分成4块
Rectangle.prototype.split = function() {
    // Split into 4 equally shaped rectangles
    var w2 = this.w / 2,
        h2 = this.h / 2,
        x = this.x,
        y = this.y;

    var ret = [];
    ret[0] = this;
    ret[1] = new Rectangle(x - w2, y - h2, w2, h2); // top-left
    ret[2] = new Rectangle(x + w2, y - h2, w2, h2); // top-right
    ret[3] = new Rectangle(x - w2, y + h2, w2, h2); // bottom-left
    ret[4] = new Rectangle(x + w2, y + h2, w2, h2); // bottom-right
    
    return ret;
};

// 判断两个矩形是否相交
Rectangle.prototype.intersects = function(b) {
    var xa = this.x - this.w, ya = this.y - this.h, wa = this.w * 2, ha = this.h * 2,
        xb = b.x - b.w, yb = b.y - b.h, wb = b.w * 2, hb = b.h * 2;

    return xa <= xb + wb
        && xa + wa >= xb
        && ya <= yb + hb
        && ya + ha >= yb;
};

// b 点是否是矩形内一点
Rectangle.prototype.intersectsPoint = function(b) {
    var bounds = this.getBounds();
    var xb = b.x, yb = b.y;
    
    return bounds.top <= yb && yb <= bounds.bottom &&
        bounds.left <= xb && xb <= bounds.right;
};

Rectangle.prototype.toString = function() {
    return "{ x: " + this.x + " y: " + this.y + " w: " + this.w + " h: " + this.h + " }";
};
