function draw(fast=false) {
    console.log(`Drawing ${pretty_num(drawingTurtle.total_line)} lines (${fast? 'fast':'slow'} mode)`);
    drawingTurtle.fastCancel = false;
    if(fast) {
        drawingTurtle.fastCancel = true;
        drawFast();
    } else {
        requestAnimationFrame(drawLoop);
    }
}

function drawLoop(){
    if(!drawingTurtle.fastCancel) {
        if(drawingTurtle.orders[drawingTurtle.i] == 0) {
            drawingTurtle.forward(hslToRgb(drawingTurtle.line_count/drawingTurtle.total_line, 0.7, 0.6));
            drawingTurtle.line_count ++;
        } else {
            drawingTurtle.rotate(drawingTurtle.orders[drawingTurtle.i]);
        }
        drawingTurtle.i ++;
        if(drawingTurtle.i < drawingTurtle.orders.length) {
            requestAnimationFrame(drawLoop);
        }
    }
}


function drawFast(){
    for(let i=0; i<drawingTurtle.orders.length; i++) {
        if(drawingTurtle.orders[i] == 0) {
            drawingTurtle.forward(hslToRgb(drawingTurtle.line_count/drawingTurtle.total_line, 0.7, 0.6));
            drawingTurtle.line_count ++;
        } else {
            drawingTurtle.rotate(drawingTurtle.orders[i]);
        }
    }
}
