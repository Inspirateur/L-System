// TODO: MIEUX RESPECTER LA NOTION D'ORDRE (SI POSSIBLE)
function parse(token, rules, angle, order, turtle) {
    // Recursive parsing of the rules (assumes they are correct)
    for(let i=0; i<rules[token].length; i++) {
        switch(rules[token][i]) {
            case 'f':
                turtle._forward();
                break;
            case '+':
                turtle._rotate(-angle);
                break;
            case '-':
                turtle._rotate(angle);
                break;
            default:
                if(order > 0){
                    parse(rules[token][i], rules, angle, order-1, turtle);
                }
        }
    }
}

let drawingTurtle;

function lsystem(rules, angle, order, ctx, canvasWidth, canvasHeight, fast) {
    console.log("Gathering info on: ");
    log_rules(rules, angle, order);
    // Do a first run with a fake ctx to gather stats
    let virtualCtx = new VirtualCtx();
    let virtualTurtle = new Turtle(0, 0, 1, virtualCtx);

    // We modify the turtle so that it has memory
    virtualTurtle.orders = [];
    virtualTurtle._rotate = function(angle) {
        if(angle != 0) {
            this.rotate(angle);
            this.orders.push(angle);
        }
    };
    virtualTurtle._forward = function() {
        this.forward();
        // 0 will be the code for forwarding
        this.orders.push(0);
    };

    // Virtual run of the rules (S is the axiom, must be in every rule set)
    parse('S', rules, angle, order, virtualTurtle);

    // Use the virtual run info to make sure the real drawing is centered and scaled to the canvas
    // Compute bounding box size assuming the unit is 1px
    let unitWidth = virtualCtx.max_x - virtualCtx.min_x;
    let unitHeight = virtualCtx.max_y - virtualCtx.min_y;
    // Compute the scaling needed to make it fit to screen (-2 so it's not touching the edges)
    let scaling_x = (canvasWidth-2)/unitWidth;
    let scaling_y = (canvasHeight-2)/unitHeight;
    // Make sure the scaling is not infinite (can happen if the figure is a vertical/horizontal line)
    if(!isFinite(scaling_x)) {
        scaling_x = Number.MAX_VALUE;
    }
    if(!isFinite(scaling_y)) {
        scaling_y = Number.MAX_VALUE;
    }
    // Choose the smallest scaling to be the true scaling
    let scaling =  Math.min(scaling_x, scaling_y);
    // Compute the coordinates of the starting point so the figure is centered
    let x = -virtualCtx.min_x*scaling + (canvasWidth-unitWidth*scaling)/2;
    let y = -virtualCtx.min_y*scaling + (canvasHeight-unitHeight*scaling)/2;
    // Make a real Turtle (it's a global variable)
    drawingTurtle = new Turtle(x, y, scaling, ctx);
    // Give it the orders to draw
    drawingTurtle.orders = virtualTurtle.orders;
    // Will be used to keep track of orders
    drawingTurtle.i = 0;
    // Store the total line count in the turtle
    drawingTurtle.total_line = virtualCtx.line_count;
    // Store the current line count in the turtle
    drawingTurtle.line_count = 0;

    // Display the number of line before drawing
    ctx.font = "10px Arial";
    ctx.fillStyle = "#ABB"
    ctx.fillText(`${pretty_num(drawingTurtle.total_line)} lines`, 5, canvasHeight-5);
    // Start the drawing
    draw(fast);
}
