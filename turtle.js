function Turtle(x, y, unit, ctx) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.unit = unit;
    this.ctx = ctx;
    this.fastCancel = false;
    // For quick conversion from degree to radian
    this.toRad = Math.PI/180.0;
    // 2 functions we need to call on start
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);

    this.rotate = function(angle) {
        // To avoid rounding error we work with euclidian degree and convert to radian when drawing
        this.angle += angle;
    };

    this.forward = function(color="#000000") {
        this.ctx.strokeStyle = color;
        this.x += Math.cos(this.angle*this.toRad)*this.unit;
        this.y += Math.sin(this.angle*this.toRad)*this.unit;
        this.ctx.lineTo(this.x, this.y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
    };
}
