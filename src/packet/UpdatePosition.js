function UpdatePosition(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
}

module.exports = UpdatePosition;

UpdatePosition.prototype.build = function() {
    var buf = new ArrayBuffer(13);
    var view = new DataView(buf);

    view.setUint8(0, 17, true);
    view.setFloat32(1, this.x, true);
    view.setFloat32(5, this.y, true);
    view.setFloat32(9, this.size, true);

    console.log("UpdatePosition Funtion Pushed [56]", this);

    return buf;
};

// Buffer = [packetId * 1, x * 4, y * 4, size * 4]
