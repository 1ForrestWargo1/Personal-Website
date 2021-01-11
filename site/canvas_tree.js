//document.addEventListener("DOMContentLoaded", init);
let ctx;
function init(){
    let canvas = document.getElementById("tree_canvas")
    ctx = canvas.getContext("2d");

    /*width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    if(width > height){h = 0.8*height; w = height}
    if(width < height){w = width; h = 0.8*width}
    offset_w = (window.innerWidth-w)/2
    offset_h = 50//(window.innerHeight-h)/2
    canvas.width = w
    canvas.height = h*/
    ctx.fillStyle = 'white';
    draw_tree(10,50,0)

}
function draw_tree(size,rootPointX,rootPointY){
    if(size){
        console.log("here")
        ctx.fillStyle = 'white';
        ctx.fillRect(rootPointX,rootPointY,size,3*size);
    }

}