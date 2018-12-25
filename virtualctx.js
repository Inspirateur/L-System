// This is a fake ctx thisect the turtle will use unknowingly, gathering stats about the drawing that will be use for the real drawing
function VirtualCtx() {
    this.x = 0;
    this.min_x = 0;
    this.max_x = 0;
    this.y = 0;
    this.min_y = 0;
    this.max_y = 0;
    this.line_count = 0;
    this.strokeStyle = "#000000";

    this.updatePos = function(x, y) {
        this.x = x;
        this.y = y;
        if(this.x < this.min_x) {
            this.min_x = this.x;
        } else if(this.x > this.max_x) {
            this.max_x = this.x;
        }
        if(this.y < this.min_y) {
            this.min_y = this.y;
        } else if(this.y > this.max_y) {
            this.max_y = this.y;
        }
    };

    this.lineTo = function(x, y) {
        this.updatePos(x, y);
        this.line_count ++;
    };

    this.beginPath = function() {};
    this.moveTo = function(x, y) {};
    this.stroke = function() {};
}
