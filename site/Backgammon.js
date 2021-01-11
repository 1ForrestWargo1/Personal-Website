      //globals
        var canvas, ctx, width, height, turn = 0, w, h, unit, color, inverseColor, backgroundColor ='rgb(101, 67, 33)';autoOpponent = false

        var game = {
            diceRoll: [],
            finalSpots: [0,0],
            activePlayer: 0,
            activeDie: -1,//index of die in dice roll
            usedDice: [0, 0],//which die is used first, 1 if used
            board:[],
        }
        function Triangle(position, amount, player){
            this.position = position;
            this.amount = amount;
            this.player = player;
            this.x = 0;
            this.y =0;
        }

        //setup
        document.addEventListener("DOMContentLoaded", init);

        function init(){
            canvas = document.getElementById("backgammon_board")
            ctx = canvas.getContext("2d");

            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            if(width > height){h = 0.8*height; w = height}
            if(width < height){w = width; h = 0.8*width}
            offset_w = (window.innerWidth-w)/2
            offset_h = 50//(window.innerHeight-h)/2
            canvas.width = w
            canvas.height = h
            unit = w/24 // each unit is 1/24th of the width
            canvas.addEventListener("click",checkClick);
            drawBoard();
            setUpStones();

            rollDice()
            while (game.diceRoll[0] === game.diceRoll[1]){
                rollDice()
            }
            if(game.diceRoll[0] > game.diceRoll[1]) {
                game.activePlayer = 0
            }else{
                game.activePlayer = 1

            }
            if(game.activePlayer === 0){color = 'red'; inverseColor = 'blue';}
            if(game.activePlayer === 1){color = 'blue'; inverseColor = 'red';}
            drawDie(0);
            drawDie(1);
            if(game.activePlayer === 1){
                autoMove()
            }

        }
        function startTurn(){
            console.log("starting turn")
            //drawGameOver(1);

            //getValues();
            if(game.finalSpots[0] === 15)drawGameOver(0);
            if(game.finalSpots[1] === 15)drawGameOver(1);
            //if(game.finalSpots[0] === 15){console.log('player 1 wins')}
            //if(game.finalSpots[1] === 15){console.log('player 2 wins')}
            game.usedDice = [0,0];
            //Changes the active player
            if(game.activePlayer === 1){
                game.activePlayer = 0 }else{
                game.activePlayer = 1
            }
            //changes the dice color depending on active player
            if(game.activePlayer === 0){color = 'red'; inverseColor = 'blue';}
            if(game.activePlayer === 1){color = 'blue'; inverseColor = 'red';}
            game.usedDice = [0,0]
            rollDice();
            drawDie(0);
            drawDie(1);


            //makeMove();
            autoOpponent = true
            if(game.activePlayer === 1 && autoOpponent){
                autoMove()
                //test_deep_copy()
            }
        }



        function setUpStones() {//adds the number of stones at each triangle in the begining 0 is top right, 23 is bottom right
            for (let i=0;i<26;i++) {
               addTriangle(i)
            }
            for(let i=0; i<12; i++){
                game.board[i+1].x = 23*unit-2*i*unit;
                game.board[i+1].y = unit;
                game.board[i+12+1].x = unit*i*2+unit;
                game.board[i+12+1].y = h-unit;
            }
            redrawStones()
        }
        function addTriangle(index) {
                switch (index) {//jail is the first and last slots
                    case 1:
                        game.board.push(new Triangle(index, 2, 0))
                        break
                    case 6:
                        game.board.push(new Triangle(index, 5, 1))
                        break
                    case 8:
                        game.board.push(new Triangle(index, 3, 1))
                        break
                    case 12:
                        game.board.push(new Triangle(index, 5, 0))
                        break
                    case 13:
                        game.board.push(new Triangle(index, 5, 1))
                        break
                    case 17:
                        game.board.push(new Triangle(index, 3, 0))
                        break
                    case 19:
                        game.board.push(new Triangle(index, 5, 0))
                        break
                    case 24:
                        game.board.push(new Triangle(index, 2, 1))
                        break
                    default:
                        game.board.push(new Triangle(index, 0, -1))
                }
        }



        function executeMove(activePlayer, startingTriangleIdx, activeDieIdx){
            //console.log("starting triangel",startingTriangleIdx,startingTriangleIdx.amount)
            //console.log("executing Move")
            let targetIdx = findTarget(startingTriangleIdx,activeDieIdx,activePlayer)
            if(validMove(activePlayer,startingTriangleIdx,targetIdx)){

                game.board[startingTriangleIdx].amount --;//remove a stone from selected square
                if(game.board[startingTriangleIdx].amount === 0){
                    game.board[startingTriangleIdx].player = -1
                }
                if(targetIdx === 26){//if target is final spot
                    game.finalSpots[activePlayer]++
                } else if(game.board[targetIdx].player === activePlayer){// if target has active player stones
                    game.board[targetIdx].amount++
                }else if(game.board[targetIdx].player === -1){//if target is empty space
                    game.board[targetIdx].amount++
                    game.board[targetIdx].player = activePlayer
                } else {//else target must be enemy space, and since its a valid move, enemy has one stone there
                    game.board[25*Math.abs(activePlayer-1)].amount++//adds enemy stone to jail
                     game.board[25*Math.abs(activePlayer-1)].player = Math.abs(activePlayer-1)
                    game.board[targetIdx].player = activePlayer//makes the enemy space active player space
                }
                game.usedDice[activeDieIdx]++
                selectDie(activeDieIdx)
                redrawStones()
            }


        }

        function validMove(activePlayer, startingTriangleIdx, targetIdx) {
            if(game.board[25*activePlayer].amount > 0 && game.board[startingTriangleIdx].position !== 25*activePlayer){
                return false
            }
            if(game.board[startingTriangleIdx].player !== activePlayer){
                return false
            }
            if(targetIdx === 26){//if the target is the final spot check if they are ready to move there
                return inEndGame(activePlayer);
            }
            if(game.board[targetIdx].player === activePlayer || game.board[targetIdx].player === -1){//if target is empty or active player space
                return true
            }
            return game.board[targetIdx].amount === 1;//last possibility is that its an enemy space,
            // so this checks if there is one stone there




        }
        function findTarget(startingTriangleIdx,activeDie,activePlayer){
            let dieValue = game.diceRoll[activeDie]
            if(activePlayer === 1){// if second player, board is revered for this player
                dieValue = dieValue*-1
            }
            if(startingTriangleIdx +dieValue < 25 && startingTriangleIdx +dieValue > 0){//if move in board
                return startingTriangleIdx+dieValue
            }else{//else target is final spot - 26
                return 26
            }

        }
        function inEndGame(player) {//a player is in the end game if all their stones are in the final quarter
            if(player === 0){
                for(let i=0;i<18;i++){
                    if(game.board[i+1].player === 0){
                        return false
                    }
                }
                return true
            }
            if(player === 1){
                for(let i=0;i<18;i++){
                    if(game.board[i+7].player === 1){
                        return false
                    }
                }
                return true
            }


        }

        function selectDie(die) {
            drawDeselectDice()
            if (die === game.activeDie) {
                game.activeDie = -1;
            } else if (validDie(die)) {
                game.activeDie = die;
                if (die === 0) {
                    drawSelectDieZero()
                }
                if (die === 1) {
                    drawSelectDieOne()
                }
            }
            drawDie(0);
            drawDie(1);
        }
        function validDie(die) {
            let threshold = 1;
            if(game.diceRoll[0] === game.diceRoll[1]){
                threshold = 2;
            }
            return game.usedDice[die] < threshold;



        }
        function rollDice(){//rolls 2 dice and sets them as the turns dice
            //console.log("rollong")
            game.diceRoll[0]= rollDie()
            game.diceRoll[1]= rollDie()
        }
        function checkClick(e){//just checks if mouse click is in relevant area
            if(!(game.activePlayer === 1 && autoOpponent)) {
                let point_x = event.clientX - offset_w
                let point_y = event.clientY - offset_h

                //if the click is inside the next turn button call startTurn
                if (point_y > h / 2 - unit && point_y < h / 2 + unit &&
                    point_x > 14 * unit && point_x < 18 * unit &&
                    game.activeDie === -1) {
                    startTurn();
                }
                //dice areas

                if (point_y > h / 2 - unit && point_y < h / 2 + unit &&
                    point_x > 3 * unit && point_x < 5 * unit) {
                    selectDie(0);
                }
                if (point_y > h / 2 - unit && point_y < h / 2 + unit &&
                    point_x > 7 * unit && point_x < 11 * unit) {
                    selectDie(1);
                }
                //triangle areas
                if (game.activeDie !== -1) {
                    for (let i = 1; i < 13; i++) {
                        if (point_y > 0 && point_y < h / 3 &&
                            point_x > game.board[i].x - unit && point_x < game.board[i].x + unit) {
                            executeMove(game.activePlayer, i, game.activeDie)
                        }

                        if (point_y > h * 2 / 3 && point_y < h &&
                            point_x > game.board[i + 12].x - unit && point_x < game.board[i + 12].x + unit) {
                            executeMove(game.activePlayer, i + 12, game.activeDie);
                        }
                    }
                    //jail areas
                    if (point_y > h * 2 / 3 - unit * 2 - unit / 2 && point_y < h * 2 / 3 - unit * 2 + unit / 2 &&
                        point_x > unit * 12 - unit / 2 && point_x < unit * 12 + unit / 2) {
                        executeMove(game.activePlayer, 0, game.activeDie)
                    }
                    if (point_y > h / 3 + unit * 2 - unit / 2 && point_y < h / 3 + unit * 2 + unit / 2 &&
                        point_x > unit * 12 - unit / 2 && point_x < unit * 12 + unit / 2) {
                        executeMove(game.activePlayer, 25, game.activeDie)
                    }
                }
            }
        }

        function rollDie(){
            return 1+Math.floor(Math.random()*6);
        }

        function redrawStones(){//updates the number of stones on each triangle, jail and end game spot
            drawBoard(false);//draws the full board, no stones, false means its not the first time
            var stoneColor
            for(let i=1; i<25; i++){

                if(game.board[i].player >-1){
                    if(game.board[i].player === 0) {
                        stoneColor = 'red'
                    }
                    if(game.board[i].player === 1){
                        stoneColor = 'blue'
                    }
                        //else add draw the stones
                        for(let j=0; j<game.board[i].amount; j++){
                            if(i<=12)drawStone(stoneColor,game.board[i].x,game.board[i].y-unit/2 +unit*j);
                            if(i>=13)drawStone(stoneColor,game.board[i].x,game.board[i].y+unit/2 -unit*j);
                        }
                    }
            }
            //draw the middle jail stones
            if(game.board[25].amount !== 0)drawJail(1);
            if(game.board[0].amount !== 0)drawJail(0);
            //draw the final spot on the right
            if(game.finalSpots[0] !== 0)drawFinalSpot(0);
            if(game.finalSpots[1] !== 0)drawFinalSpot(1);
            //check if someone has moved all their tiles to end

        }
        function drawGameOver(player){
            if(player === 0){
                document.getElementById('winner').click()
            }
            if(player === 1){
                document.getElementById('looser').click()
            }
            //document.getElementById('winner').click()
            //ctx.clearRect(0, 0, document.getElementById("backgammon_board").width, document.getElementById("backgammon_board").height);
            //document.getElementById("backgammon_board").style.opacity = '0'
  /*          ctx.fillStyle = 'white';
            ctx.globalAlpha=0.89;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(w, 0);
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.fill();
            if(player === 0){
                ctx.globalAlpha= 1;
                ctx.fillStyle = 'red';
                ctx.font = "75px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Player 1 Wins!",w/2,h/2);
            }
            if(player === 1){
                ctx.globalAlpha= 1;
                ctx.fillStyle = 'blue';
                ctx.font = "75px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Player 2 Wins!",w/2,h/2);
            }*/
        }
        function drawSelectDieZero(){
            ctx.fillStyle = inverseColor;
            ctx.beginPath();
            ctx.moveTo(2.8*unit, h/2-1.2*unit);
            ctx.lineTo(5.2*unit, h/2-1.2*unit);
            ctx.lineTo(5.2*unit, h/2+1.2*unit);
            ctx.lineTo(2.8*unit, h/2+1.2*unit);
            ctx.fill();
            ctx.closePath();
      }
        function drawSelectDieOne(){
            ctx.fillStyle = inverseColor;
            ctx.beginPath();
            ctx.moveTo(2.8*unit+spacer, h/2-1.2*unit);
            ctx.lineTo(5.2*unit+spacer, h/2-1.2*unit);
            ctx.lineTo(5.2*unit+spacer, h/2+1.2*unit);
            ctx.lineTo(2.8*unit+spacer, h/2+1.2*unit);
            ctx.fill();
            ctx.closePath();

      }
        function drawDeselectDice(){
            ctx.fillStyle = backgroundColor;
            ctx.beginPath();
            ctx.moveTo(2*unit, h/2-1.2*unit);
            ctx.lineTo(6*unit, h/2-1.2*unit);
            ctx.lineTo(6*unit, h/2+1.2*unit);
            ctx.lineTo(2*unit, h/2+1.2*unit);
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(2*unit+spacer, h/2-1.2*unit);
            ctx.lineTo(6*unit+spacer, h/2-1.2*unit);
            ctx.lineTo(6*unit+spacer, h/2+1.2*unit);
            ctx.lineTo(2*unit+spacer, h/2+1.2*unit);
            ctx.fill();
            ctx.closePath();
        }
        function drawFinalSpot(player){
            if(player === 0){
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.ellipse(unit*22, h*2/3-unit*2, unit/2, unit/2,  45 * Math.PI/180, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
                ctx.fillStyle = 'black';
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.fillText(game.finalSpots[0],unit*22,  h*2/3-unit*2+unit/5);
            }
            if(player === 1){
                ctx.fillStyle = 'blue';
                ctx.beginPath();
                ctx.ellipse(unit*22, h/3+unit*2, unit/2, unit/2,  45 * Math.PI/180, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
                ctx.fillStyle = 'black';
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.fillText(game.finalSpots[1],unit*22, h/3+unit*2+unit/5);
            }

        }
        function drawJail(player){
            if(player === 0){
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.ellipse(unit*12, h*2/3-unit*2, unit/2, unit/2,  45 * Math.PI/180, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
                ctx.fillStyle = 'black';
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.fillText(game.board[0].amount,unit*12,  h*2/3-unit*2+unit/5);
            }
            if(player === 1){
                ctx.fillStyle = 'blue';
                ctx.beginPath();
                ctx.ellipse(unit*12, h/3+unit*2, unit/2, unit/2,  45 * Math.PI/180, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
                ctx.fillStyle = 'black';
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.fillText(game.board[25].amount,unit*12, h/3+unit*2+unit/5);
            }

        }
        function drawBoard(firstDraw){
            if(firstDraw === false){drawBoardBackground(false);}else{
                drawBoardBackground();}//the brown backgroun box

            //upper triangles
            drawUpperWhiteTriangle(0);
            drawUpperBlackTriangle(2*unit);
            drawUpperWhiteTriangle(4*unit);
            drawUpperBlackTriangle(6*unit);
            drawUpperWhiteTriangle(8*unit);
            drawUpperBlackTriangle(10*unit);
            drawUpperWhiteTriangle(12*unit);
            drawUpperBlackTriangle(14*unit);
            drawUpperWhiteTriangle(16*unit);
            drawUpperBlackTriangle(18*unit);
            drawUpperWhiteTriangle(20*unit);
            drawUpperBlackTriangle(22*unit);
            //lower Triangles
            drawLowerBlackTriangle(0);
            drawLowerWhiteTriangle(2*unit);
            drawLowerBlackTriangle(4*unit);
            drawLowerWhiteTriangle(6*unit);
            drawLowerBlackTriangle(8*unit);
            drawLowerWhiteTriangle(10*unit);
            drawLowerBlackTriangle(12*unit);
            drawLowerWhiteTriangle(14*unit);
            drawLowerBlackTriangle(16*unit);
            drawLowerWhiteTriangle(18*unit);
            drawLowerBlackTriangle(20*unit);
            drawLowerWhiteTriangle(22*unit);
            drawMiddleLine();
            drawNextTurnButton();
        }
        function drawNextTurnButton(){//basically just a white box with the word next turn in it, the event check ia handled in checkClick
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(14*unit, h/2-unit);
            ctx.lineTo(18*unit, h/2-unit);
            ctx.lineTo(18*unit, h/2+unit);
            ctx.lineTo(14*unit, h/2+unit);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.font = "25px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Next Turn",16*unit,h/2+unit/3);

        }
        function drawBoardBackground(firstDraw){
            if(firstDraw === false){
                ctx.fillStyle = backgroundColor;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(w, 0);
                ctx.lineTo(w, h/3);
                ctx.lineTo(0, h/3);
                ctx.fill();
                ctx.moveTo(0, h*2/3);
                ctx.lineTo(w, h*2/3);
                ctx.lineTo(w, h);
                ctx.lineTo(0, h);
                ctx.fill();
                ctx.moveTo(unit*10, 0);
                ctx.lineTo(unit*14, 0);
                ctx.lineTo(unit*14, h);
                ctx.lineTo(unit*10, h);
                ctx.fill();

            }else{
                ctx.fillStyle = backgroundColor;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(w, 0);
                ctx.lineTo(w, h);
                ctx.lineTo(0, h);
                ctx.fill();
            }
        }
        function drawDie(die){
            switch (game.diceRoll[die]) {
                case 1:
                    drawOnePipDie(die)
                    break
                case 2:
                    drawTwoPipDie(die)
                    break
                case 3:
                    drawThreePipDie(die)
                    break
                case 4:
                    drawFourPipDie(die)
                    break
                case 5:
                    drawFivePipDie(die)
                    break
                case 6:
                    drawSixPipDie(die)
                    break

            }
        }
        function drawUpperWhiteTriangle(x){
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x+w/24, h/3);
            ctx.lineTo(x+w/12, 0);
            ctx.fill();

        }
        function drawUpperBlackTriangle(x){
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x+w/24, h/3);
            ctx.lineTo(x+w/12, 0);
            ctx.fill();

        }
        function drawLowerWhiteTriangle(x){
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(x, h);
            ctx.lineTo(x+w/24, h*2/3);
            ctx.lineTo(x+w/12, h);
            ctx.fill();

        }
        function drawLowerBlackTriangle(x){
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(x, h);
            ctx.lineTo(x+w/24, h*2/3);
            ctx.lineTo(x+w/12, h);
            ctx.fill();

        }
        function drawMiddleLine(){
            //its the red line in the middle it doesnt really serve a purpose but its my game
            ctx.fillStyle = 'lightBlue';
            ctx.beginPath();
            ctx.moveTo(12*unit - unit/100, 0);
            ctx.lineTo(12*unit + unit/100, 0);
            ctx.lineTo(12*unit + unit/100, h);
            ctx.lineTo(12*unit - unit/100, h);
            ctx.fill();

        }
        function drawOnePipDie(position){
            var spcaer
            if(position === 0)spacer = 0;else spacer = unit*4
            drawDieBackground(spacer);

            drawPip(4*unit+spacer, h/2);
        }
        function drawTwoPipDie(position){
            var spcaer
            if(position === 0)spacer = 0;else spacer = unit*4
            drawDieBackground(spacer);

            drawPip(4.5*unit+spacer, h/2-1/2*unit,);
            drawPip(3.5*unit+spacer, h/2+1/2*unit);
        }
        function drawThreePipDie(position){
            var spcaer
            if(position === 0)spacer = 0;else spacer = unit*4
            drawDieBackground(spacer);

            drawPip(4.5*unit+spacer, h/2-1/2*unit);
            drawPip(3.5*unit+spacer, h/2+1/2*unit);
            drawPip(4*unit+spacer, h/2, unit/8);
        }
        function drawFourPipDie(position){
            var spcaer
            if(position === 0)spacer = 0;else spacer = unit*4
            drawDieBackground(spacer);

            drawPip(4.5*unit+spacer, h/2-1/2*unit)
            drawPip(3.5*unit+spacer, h/2+1/2*unit);
            drawPip(4.5*unit+spacer, h/2+1/2*unit);
            drawPip(3.5*unit+spacer, h/2-1/2*unit);

        }
        function drawFivePipDie(position){
            var spcaer
            if(position === 0)spacer = 0;else spacer = unit*4
            drawDieBackground(spacer);

            drawPip(4.5*unit+spacer, h/2-1/2*unit)
            drawPip(3.5*unit+spacer, h/2+1/2*unit);
            drawPip(4.5*unit+spacer, h/2+1/2*unit);
            drawPip(3.5*unit+spacer, h/2-1/2*unit);
            drawPip(4*unit+spacer, h/2);

        }
        function drawSixPipDie(position){
            var spcaer
            if(position === 0)spacer = 0;else spacer = unit*4
            drawDieBackground(spacer);

            drawPip(4.5*unit+spacer, h/2-1/2*unit)
            drawPip(3.5*unit+spacer, h/2+1/2*unit);
            drawPip(4.5*unit+spacer, h/2+1/2*unit);
            drawPip(3.5*unit+spacer, h/2-1/2*unit);
            drawPip(4.5*unit+spacer, h/2);
            drawPip(3.5*unit+spacer, h/2);

        }
        function drawPip(x, y){//put in the x and y Coordinates and it'll draw a dot there
            ctx.fillStyle = inverseColor;
            ctx.beginPath();
            ctx.ellipse(x, y, unit/8, unit/8,  45 * Math.PI/180, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }
        function drawDieBackground(spacer){//the white box
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(3*unit+spacer, h/2-unit);
            ctx.lineTo(5*unit+spacer, h/2-unit);
            ctx.lineTo(5*unit+spacer, h/2+unit);
            ctx.lineTo(3*unit+spacer, h/2+unit);
            ctx.fill();
            ctx.closePath();
        }
        function drawStone(color,x,y){//draws a circle wherever you want in anycolor
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(x, y, unit/2, unit/2,  45 * Math.PI/180, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

        }


        function Option(target,start,dieIdx) {
            this.target = target;
            this.start = start;
            this.dieIdx = dieIdx;
            this.board;
            this.nextMoveOptions = []

        }

        function autoMove() {
            /*
            creates a copy of the game, then finds every move.
            creates a list board states after each move.
            selects the best board, (selection process still work in progress)
            execute auto move then plays that move

             */
            let oGame = deepCopy(game);
            let options = []
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 26; j++) {
                    if(validMove(game.activePlayer,j,findTarget(j,i,game.activePlayer))){
                        executeMove(game.activePlayer,j,i)
                        let moveOne = [game.activePlayer,j,i]
                        let oneMoveGame = deepCopy(game);
                        for (let k = 0; k < 26; k++) {
                            if (validMove(game.activePlayer, k, findTarget(k, (i-1)**2, game.activePlayer))) {
                                executeMove(game.activePlayer, k, (i-1)**2)
                                let moveTwo = [game.activePlayer, k, (i-1)**2]
                                options.push([deepCopy(game),deepCopy(moveOne),deepCopy(moveTwo)])
                                game = deepCopy(oneMoveGame);
                            }
                        }
                        game = deepCopy(oGame);
                    }
                }
                game = deepCopy(oGame);
                redrawStones()
            }
            if(options.length > 0){
                let bestGame = [evaluateBoard(options[0][0].board),options[0]]
                for(let i=0; i<options.length;i++){
                    let boardScore = evaluateBoard(options[i][0].board)
                    if(boardScore < bestGame[0]){
                        bestGame = [evaluateBoard(options[i][0].board),options[i]]
                    }
                }
                game = deepCopy(oGame);
                setTimeout(function () {
                    executeAutoMove(bestGame)
                },1000)
            }else{
            }

        }
        function executeAutoMove(bestGame,operation = 0) {
            switch (operation) {
                case 0:
                    selectDie(bestGame[1][1][2])
                    setTimeout(function () {
                    executeAutoMove(bestGame,1)
                },1000)
                    break
                case 1:
                    executeMove(bestGame[1][1][0],bestGame[1][1][1],bestGame[1][1][2])
                    setTimeout(function () {
                    executeAutoMove(bestGame,2)
                },1000)
                    break
                case 2:
                    selectDie(bestGame[1][2][2])
                    setTimeout(function () {
                    executeAutoMove(bestGame,3)
                },1000)
                    break
                case 3:
                     executeMove(bestGame[1][2][0],bestGame[1][2][1],bestGame[1][2][2])
                    setTimeout(function () {
                    startTurn()
                },1000)
                    break

            }
        }

        function deepCopy(object) {
            return JSON.parse(JSON.stringify(object));
        }

        function evaluateBoard(board,player){
            let boardScore = 0
            for (let i = 1; i < 24; i++) {
                if(board[i].player === player && board[i].amount === 1){
                    boardScore -= (findQuadrant(i, player))
                }
            }
            boardScore += board[player]*2
            return boardScore
        }
        function findQuadrant(index,player) {
            let quadrant = Math.floor(index/6)
            if(player === 1){
                quadrant = 4-quadrant
            }
            return quadrant


        }