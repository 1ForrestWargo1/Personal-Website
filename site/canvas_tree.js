//document.addEventListener("DOMContentLoaded", init);
const canvas = document.getElementById("tree_canvas")
const   ctx = canvas.getContext("2d");
function init(){

    /*width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    if(width > height){h = 0.8*height; w = height}
    if(width < height){w = width; h = 0.8*width}
    offset_w = (window.innerWidth-w)/2
    offset_h = 50//(window.innerHeight-h)/2
    canvas.width = w
    canvas.height = h*/
    ctx.fillStyle = 'white';
    //draw_tree(10,50,0)
    draw_branch(150,0,100,60,10);
    //draw_branch()
    //ctx.rotate(-10*Math.PI/180);
    //ctx.fillRect(50,50,10,50);



}
function draw_tree(size,rootPointX,rootPointY){
    if(size){
        console.log("here")
        ctx.fillStyle = 'white';
        ctx.fillRect(rootPointX,rootPointY,size,3*size);
        draw_branch(rootPointX+3*size,rootPointY+3*size,size*2,60,size-2);
    }


}
function draw_branch(rootX,rootY, length, angle,size){
    ctx.fillStyle = 'white';
    let endX = length*Math.cos(angle);
    let endY = length*Math.sin(angle);
     console.log("x, y = ",endX,endY);
    //ctx.fillRect(rootX+x,rootY+y,size,length);
    ctx.beginPath();
    ctx.moveTo(rootX,rootY);
    ctx.lineTo(rootX-endX,rootY-endY);
    ctx.stroke();

}