    let size = 8;//size of side of board
    let backgroundColor = "#cf9127"//"#cee0d0"
    let color = "black"
    let max_depth = 7;//max depth that Heuristic minimax will search
    let waiting = false;
    let state;//object containing 2d board array and int for active player

    function init(){
        setup_game();
        set_table_from_board_array(create_starting_board());
        state = new State(get_array_from_table(),-1);
        //execute_auto_move()


    }
    function setup_game(){
        document.getElementById("thinking").style.opacity = '0'

        //adds buttons to table. gives them IDs and event listeners
        const table = document.getElementById("board_table");
        for(r=0; r<size; r++){
            row = table.insertRow(-1);
            for(c=0; c<size; c++) {
                let tile = document.createElement("div")
                row.appendChild(tile)
                tile.id = (c+(r)*size);
                tile.player = 0;
                tile.innerHTML = String.fromCharCode(9898);//code for tile. This will be invisible as style_button hies player = 0 buttons
                style_tile(c+(r)*size)
                tile.addEventListener("click",function(){ handle_tile_click(parseInt(this.id)); })
            }
        }
    }
    function handle_tile_click(id){
        if(document.getElementById("thinking").style.opacity == '0') {
            /*
            id: int  0 - size^2 -1
            checks if selected button is a valid move. if it is it executes the move and then executes an auto move
             */
            document.getElementById("warning").style.opacity = '0'
            let a = new Actions(state);//creates object which contains list of possible actions
            if (a.actions.includes(id)) {//if the selected move is in the possible actions list
                let new_s = get_result(state, id);//creates a state that is a result of actions in given state
                set_table_from_board_array(new_s.board);
                state = new_s;//updates games state
                document.getElementById("thinking").style.opacity = '1'
                //setTimeout(execute_auto_move,1)//calls execute move and waits so the players move is visible


            } else {
                document.getElementById("warning").style.opacity = '1'
            }
            setTimeout(handle_next, 1)//calls execute move and waits so the players move is visible
        }

    }
    function print_board(board){//just for debugging
        for(let i = 0;i<size;i++) {
            let line = "";
            for (let j = 0; j < size; j++) {
                line +=board[i][j]+" "
            }
        }
    }

    function style_tile(id){//adds style to tile -- tiles on board
        let tile = document.getElementById(id)
        tile.innerHTML = /*'<img src="frozen_forrest.jpg" />';*/String.fromCharCode(9898);//makes surer each tile is the right size

        if(tile.player === -1){//white player is -1
            tile.innerHTML = /*'<img src="frozen_forrest.jpg" />';*/String.fromCharCode(9898);//white stone
            tile.style.color = "rgba(0,0,0,1)";//sets opacity to visible

        }else if(tile.player === 1){//black player is 1
            tile.innerHTML = String.fromCharCode(9899);//black stone
            tile.style.color = "rgba(0,0,0,1)"//sets opacity to visible

        }else if(tile.player === 0){
            tile.style.color = "rgba(0,0,0,0)";//sets opacity to invisible
        }
        tile.style.backgroundColor = backgroundColor

        if(id%2 === 1 ) {//adds border
            tile.style.borderRight = "2px inset black";
        }
        if(Math.floor(id/size)%2 === 1){
            tile.style.borderBottom = "2px inset black";
        }
        tile.className = "tile"


    }

    function create_starting_board() {
        //creates board array with starting board formation.
        let board = []
        for(r=0; r<size; r++) {
            board.push([]);
            for (c = 0; c < size; c++) {
                board[r].push(0);
            }
        }
        board[(size/2) -1][(size/2) -1] = 1;
        board[(size/2)][(size/2)] = 1;
        board[(size/2) -1][(size/2)] = -1;
        board[(size/2)][(size/2) -1] = -1;
        print_board(board)
        return board
    }



    function set_table_from_board_array(board) {
        /*
        board: 2d array
        sets button.player variables to board adn then updates styling
         */
        for(let i=0; i<size*size; i++){
            document.getElementById(i).player = board[Math.floor(i/size)][i%size];
            style_tile(i)
        }
    }


    function get_array_from_table() {
        //opposite of set_table_from_board_array
        let board = [];
        for(let i=0; i<size*size; i++){
            board.push([]);
            board[Math.floor(i/size)].push(document.getElementById(i).player);
        }
        return board
    }


    function deep_copy_board(board) {
        let copy_board = []
        for(let i=0; i<size; i++){
            copy_board.push([]);
            for(let j=0; j<size; j++) {
                copy_board[i].push(board[i][j])
            }
        }
        return copy_board
    }

    function reset_game(){
        set_table_from_board_array(create_starting_board());
        state = new State(get_array_from_table(),-1);


    }

    function show_moves(){
        let a = new Actions(state);
        for(let i=0;i<a.actions.length;i++){
            document.getElementById(a.actions[i]).style.backgroundColor = "#cee0d0"//"rgb(175,0,175)"

        }
    }
    function rank_moves(){
        max_depth = document.getElementById("depth_slider").value // updates max depth

        let alist = new Actions(state);
        for(let i=0; i<alist.actions.length;i++){
            let holder = min_value(get_result(state,alist.actions[i]),-Infinity, Infinity,1);
            holder = Math.round(holder * 100) / 100;
            /*if(holder < 0){
                document.getElementById(alist.actions[i]).style.color = "rgba(0,0,0,1)";//sets opacity to visible andcolor to black
            }else{
                document.getElementById(alist.actions[i]).style.color = "rgba(255,255,255,1)";//sets opacity to visible anf color to white
            }*/
            if(holder >= 0){
                text_color = "rgb(150,224,208,1)";//"#cee0d0"
            }else{
                text_color = "rgb(175,0,175,1)"
            }
            //document.getElementById(alist.actions[i]).style.color = "rgba(0,0,0,1)";//sets opacity to visible andcolor to black
            document.getElementById(alist.actions[i]).style.color = text_color;//sets opacity to visible andcolor to black
            document.getElementById(alist.actions[i]).textContent = holder
            document.getElementById(alist.actions[i]).style.backgroundColor = "rgba(255,255,255)";
            //document.getElementById(alist.actions[i]).style.backgroundColor = "#cee0d0"//"rgb(175,0,175)"


        }
    }

    function handle_next(){
        if(terminal_test(state)) {//if the game is over
            if (utility(state, 1) > 0) {
                alert("GAME OVER I WON BY " + utility(state, 1));
            } else {
                alert("GAME OVER YOU BEAT ME BY " + utility(state, -1));
            }
        }else{
            let no_moves = new Actions(state).actions.length === 0;//boolean checking if there are any moves left
            if(state.player === -1 && no_moves){//if human has no legal moves
                state.player *= -1;
                //alert("you do not have any moves");
                document.getElementById("thinking").style.opacity = '1'
                execute_auto_move();//calls execute move and waits so the players move is visible
            }else if(state.player === 1 && no_moves){//if ai has no legal moves
                //console.log("I have no moves");
                state.player *= -1;
            }else if(state.player === 1){//if ai does have legal moves
                // this can be inferred as if both players had no moves terminal test would be true
                document.getElementById("thinking").style.opacity = '1'
                execute_auto_move();//calls execute move and waits so the players move is visible
            }else{//player has a move and its their turn
                document.getElementById("thinking").style.opacity = '0'
            }
        }
        document.getElementById("thinking").style.opacity = '0';
    }

    class State {
        //state object contains 2d array for board and player whose turn it is
        constructor(board,player){
            this.board = deep_copy_board(board);
            this.player = player;
        }

    }
    class Actions {
        constructor(state) {
            this.actions = [];
            this.state = state;

            for(let r=0;r<size;r++){
                for(let c=0;c<size;c++){
                    if(state.board[r][c]*state.player<0){
                        this.addAdjacentActions(r,c);
                    }
                }
            }

        }
        addAdjacentActions(r, c) {
            for (let i = Math.max(r - 1, 0); i < Math.min(r + 2, size); i++) {
                for (let j = Math.max(c - 1, 0); j < Math.min(c + 2, size); j++) {
                    if (this.state.board[i][j] === 0) {

                        if (this.checkDirection(r, c, c-j, r-i)) {

                            if(!this.actions.includes(i*size+j)){

                                this.actions.push(i*size+j);
                            }
                        }
                    }
                }
            }
        }

        checkDirection( r, c,  x,  y) {
            if (c + x >= size || r + y >= size || c + x < 0 || r + y < 0) {
                return false;
            }
            if (this.state.board[r + y][c + x] === 0) {
                return false;
            }
            if (this.state.board[r + y][c + x] === this.state.player) {
                return true;
            }
            return this.checkDirection(r + y, c + x, x, y);
        }
    }

//=================== AI components below here =====================================================================
    function execute_auto_move(){
        //selects a move for computer.
        max_depth = document.getElementById("depth_slider").value // updates max depth

        let auto_move = heuristicAB(state);//finds move using heuristic minimax with alpha beta pruning
        if(auto_move > -1){
            let new_s = get_result(state, auto_move);//creates a state that is a result of action in given state
            set_table_from_board_array(new_s.board);
            state = new_s;//updates games state
        }
        //document.getElementById("thinking").style.opacity = '0'
        handle_next();//calls execute move and waits so the players move is visible
    }







    function get_result(state, action) {
        let new_state = new State(state.board,state.player);

        let r = action%size;
        let c = Math.floor(action/size);
        for(let i = Math.max(c - 1, 0); i < Math.min(c + 2, size); i++) {
            for (let j = Math.max(r - 1, 0); j < Math.min(r + 2, size); j++) {
                if (state.board[i][j]*state.player < 0) {
                    updateDirection(c, r, i - c, j - r,new_state);
                }
            }
        }
        new_state.board[c][r] = new_state.player;

        new_state.player = new_state.player*-1;
        return new_state;

    }

    function  updateDirection( c, r,  x,  y, state) {
        if (c + x >= size || r + y >= size || c + x < 0 || r + y < 0) {
            return false;
        }
        if (state.board[x + c][y + r] === 0) {
            return false;
        }
        if (state.board[x + c][y + r] === state.player) {
            state.board[x + c][y + r] = state.player;
            return true;
        }
        if(updateDirection(c + x, r + y, x, y,state)){
            state.board[x + c][y + r] = state.player;
            return true;
        }
        return false;
    }



    function heuristicAB(s){
        let alist = new Actions(s);
        if(alist.actions.length === 0){
            return -1;
        }
        let action = -1;
        let v =-Infinity;
        for(let i=0; i<alist.actions.length;i++){
            let holder = min_value(get_result(s,alist.actions[i]),-Infinity, Infinity,1);
            if(holder > v){
                v = holder;
                action = alist.actions[i];
            }
        }
        return action;
    }


    function max_value(s,  a, b, l){
        if(terminal_test(s)){
            return utility(s,state.player);
        }
        if(l >= max_depth){
            return heuristic(s);
        }
        alist = new Actions(s);
        if(alist.actions.length === 0){
            s.player *=-1;
            return min_value(s,a,b,l+1);
        }
         let v = -Infinity

        for(let i=0; i<alist.actions.length;i++){
            //System.out.println(alist.actions+"action selected");
            //printBoard(get_result(s,alist.actions.get(i)).board);
            v  = Math.max(v,min_value(get_result(s,alist.actions[i]),a,b,l+1));
            if(v >= a){
                return v;
            }
            b = Math.max(a,v);
        }
        return v;
    }
    function min_value( s,  a,  b, l){
        if(terminal_test(s)){
            return utility(s,state.player);
        }
        if(l >= max_depth){
            return heuristic(s);
        }

        let alist = new Actions(s);
        if(alist.actions.length === 0){
            s.player *=-1;
            return max_value(s,a,b,l+1);
        }
        let v = Infinity;
        for(let i=0; i<alist.actions.length;i++){
            v  = Math.min(v,max_value(get_result(s,alist.actions[i]),a,b,l+1));

            if(v <= a){
                return v;
            }
            b = Math.min(b,v);
        }
        return v;
    }
    function heuristic(s){
        let result = 0;
        let l = s.board.length;
        for(let i =0; i<l; i++) {
            for (let j = 0; j < l; j++) {
                result += s.board[i][j];
            }
        }
        result += s.board[0][0] * l;
        result += s.board[l-1][0] * l;
        result += s.board[0][l-1] * l;
        result += s.board[l-1][l-1] * l;
        return  ((1 / (1 + Math.exp(-result)))-0.5)*state.player;
    }

    function terminal_test(s){
        let active_no_moves = new Actions(s).actions.length === 0;
        s.player *=-1;
        let next_no_moves = new Actions(s).actions.length === 0;
        s.player *=-1;
        return active_no_moves && next_no_moves;
    }
    function  utility(s, player){
        let result = 0;
        for(let i =0; i<size; i++) {
            for (let j = 0; j < size; j++) {
                result += s.board[i][j];
            }
        }
        return result*player;
    }

    document.addEventListener('DOMContentLoaded', init())


