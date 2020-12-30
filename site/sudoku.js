    let start_board;
    let selected_id = -1;
    let log = [];
    let playThrough = true;

    function create_board() {
        document.getElementById("warning").style.opacity = "0"
        window.addEventListener("keydown", checkKeyPressed, false);

        //creates and adds buttons to table, giving them id bases on board position, counting across, eg top left is 0, below that is 9
        const table = document.getElementById("board_table");
        for(r=0; r<9; r++){

            row = table.insertRow(-1);
            for(c=0; c<9; c++) {
                let button = document.createElement("BUTTON")
                row.appendChild(button)

                button.id = c+(r)*9;
                button.var = 0;
                style_button(c+(r)*9,"white",'black')
                button.addEventListener("click",function(){ select_button(this.id); })
            }
        }
        start_board = get_board_from_buttons()
    }

    function checkKeyPressed(evt) {
        if (evt.keyCode === 13) {
            select_button(-1)
        }
    }

    function select_button(id){
        for(let i=0;i<81;i++){
            document.getElementById(i).style.backgroundColor = "white"
        }
        //document.getElementById("warning").style.opacity = "0"
        //replace selected id, input field, with button
        if(selected_id > -1){//if there is a selected button
            turn_input_to_button()
        }
        selected_id = id
        if(id>-1){//if new button selected
            turn_button_to_input(id)
        }
    }


    function turn_button_to_input(id) {
        if(start_board[id] === 0){//space is not set in board
                let input = document.createElement("INPUT");
                input.setAttribute("type", "number");
                document.getElementById(id).replaceWith(input)
                input.id = id
                input.className = "tile"
                input.focus();
                input.select();
                if((selected_id%9)%3 === 2) {
                    input.style.borderRight = "3px inset black";
                }
                if(Math.floor(selected_id/9)%3 === 2){
                    input.style.borderBottom = "3px inset black";
                }
            }else{
                selected_id = -1
            }
    }

    function turn_input_to_button() {
        let input_val = document.getElementById(selected_id).value
        let button = document.createElement("BUTTON")
        let collisions = find_collisions(selected_id,input_val,get_board_from_buttons())
        if(input_val ==='' || input_val< 1 || input_val >9 ){
            input_val = 0;
        }else if(collisions.length !== 0) {
            input_val = 0;
            for(let i=0; i<collisions.length;i++) {
                document.getElementById(collisions[i]).style.backgroundColor = "red"
            }
        }
        button.id = selected_id;
        button.var = input_val
        document.getElementById(selected_id).replaceWith(button)
        style_button(selected_id,'white',"rgb(175,0,175)")
        button.addEventListener("click",function(){ select_button(this.id); })
    }

    function find_collisions(space_id, value, board){
        //checks if the given value for the given square is allowed
        const column = space_id % 9;
        const row = Math.floor(space_id / 9);
        const section = parseInt(("" + Math.floor(row / 3) + Math.floor(column / 3)), 3);
        let possible_collisions = [];//a list of spaces with the same value as the given value
        possible_collisions.push(check_row(value, row,board))
        possible_collisions.push(check_column(value, column,board))
        possible_collisions.push(check_section(value, section,board))
        let collisions = [];
        for(let i=0; i<possible_collisions.length;i++){
            if(possible_collisions[i] > -1){
                //document.getElementById(possible_collisions[i]).style.background = "red"
                collisions.push(possible_collisions[i])
            }
        }
        return collisions

    }
    function check_row(value, row, board){
         //determines if a the given value can go in the given row of the board
        for(let i=0; i<9; i++) {
            let shift = row * 9;
            let id = i+shift
            //document.getElementById(id).style.background = "orange"
            if(board[id] === value){
                //document.getElementById(id).style.background = "red"
                return id
            }
        }
        return -1
    }

    function check_column(value, column,board) {
     //determines if a the given value can go in the given column of the board
        for(let i=0; i<9; i++) {
            let id = column+i*9
            //document.getElementById(id).style.background = "yellow"
            if(board[id]== value){
                //document.getElementById(id).style.background = "pink"
                return id
                //return row+i*9
            }
        }
        return -1
    }
    function check_section(value, section, board) {
    //determines if a the given value can go in the given section of the board
        let start_point = (section%3)*3
        let shift_down = Math.floor(section/3)
        let value_shift = 27
        for(let r = 0; r < 3; r++) {
            for (c = 0; c < 3; c++) {
                var id = start_point +shift_down*value_shift+c+9*r
                //document.getElementById(id).style.background = "cyan"
                if(board[id] == value){
                    //document.getElementById(id).style.background = "green"
                    return id
                }
            }
        }
        return -1
    }
/*
    function create_button(id,val){
        let button = document.createElement("BUTTON")
        button.var = val
        button.id = id;
        if(val === 0) {
            button.style.color = "rgba(175,0,175,0)";
        }else{
            button.style.color = "rgb(175,0,175)";
        }
        if(val === 0){
            val = '  \n *';
        }
        button.innerHTML = val

        if((id%9)%3 === 2) {
            button.style.borderRight = "3px inset black";
        }
        if(Math.floor(id/9)%3 === 2){
            button.style.borderBottom = "3px inset black";
        }
        return button
    }

*/

    function set_buttons_from_board(board,color = "black") {
        for(let i=0; i<board.length; i++){
             document.getElementById(i).var = board[i]
            style_button(i,'white','black')

        }
         for(let i=0; i<board.length; i++){
            console.log(document.getElementById(i).className)
        }
    }


    function get_board_from_buttons() {
        let board = []
        for(let i=0; i<81; i++){
            board.push(document.getElementById(i).var)
            }
        return board
    }


    function deep_copy_board(board) {
        let copy_board = []
        for(let i=0; i<81; i++){
            copy_board.push(board[i])
        }
        return copy_board
    }

    function solve_puzzle(){
        playThrough = true
        log = []
        select_button(-1)
        let solved_board = solve(get_board_from_buttons(),0,log)
        //document.getElementById("speed_slider").disabled = false
        document.getElementById("speed_slider").style.opacity = '1'
        play_log(log)

    }

    function play_log(solve_log,index = 0){
        let play_speed = 1000/(document.getElementById("speed_slider").value)
        if(document.getElementById("speed_slider").value == 100){
            play_speed = 0
        }
        if(index < solve_log.length && playThrough){
            document.getElementById(solve_log[index][0]).var = solve_log[index][1]
            style_button(solve_log[index][0],'rgb(115, 250, 193)','rgb(175,0,175)')

            for(let j=0;j<81;j++){
                if(j< solve_log[index][0]){
                    if(start_board[j] > 0) {
                        style_button(j, 'white', 'black')
                    }else{
                        style_button(j, 'white', 'rgb(175,0,175)')
                    }
                }
                if(j > solve_log[index][0]){
                    document.getElementById(j).var = start_board[j]
                    style_button(j,'white','black')
                    document.getElementById(j).style.backgroundColor = 'white'
                }
            }
            setTimeout(play_log,play_speed,solve_log,index+1)
        }else{
            //set_buttons_from_board(solved_board,"blue")
            document.getElementById("speed_slider").style.opacity = '0'
            select_button(-1)
        }
    }
    function style_button(id,backgroundColor,color){
        let button = document.getElementById(id)

        button.innerHTML = button.var
        if(button.var === 0){
            button.style.color = "rgba(0,0,0,0)";
        }else{
            button.style.color = color
        }
        button.style.backgroundColor = backgroundColor
        //button.style.color = color
        if((id%9)%3 === 2) {
            button.style.borderRight = "3px inset black";
        }
        if(Math.floor(id/9)%3 === 2){
            button.style.borderBottom = "3px inset black";
        }
        button.className = "tile"

    }



    function solve(board,index = 0){


        if(index >= board.length){
            return board
        }

        if(board[index] > 0){
            return solve(board,index+1)
        }
        let nums_to_try = shuffle([1,2,3,4,5,6,7,8,9])
        for(let i=0;i<9;i++){
            log.push([index,nums_to_try[i]])
            if(find_collisions(index,nums_to_try[i],board).length === 0){
                let next_board = deep_copy_board(board)
                next_board[index] = nums_to_try[i]
                let result = solve(next_board,index+1)
                if(result.length > 0){
                    return result
                }
            }
        }
        return []
    }


    function count_solutions(board,index) {
        /*
        takes in a board and the starting index, which should always be zero
        this will either return 0,1, or 2.
        0 means no solutions, 2 means more than a single solution
         */
        if(index >= board.length){
            return  1
        }
        if(board[index] > 0){
            return count_solutions(board,index+1)
        }
        let solutions = 0
        for(let i=1;i<10;i++){
            if(solutions > 1){
                return solutions
            }
            if(find_collisions(index,i,board).length === 0){

                let next_board = deep_copy_board(board)
                next_board[index] = i
                let result = count_solutions(next_board,index+1)
                solutions+=result
            }
        }
        return solutions
    }

    function shuffle(array) {
        let copy = [], n = array.length, i;

        // While there remain elements to shuffle…
        while (n) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * array.length);

            // If not already shuffled, move it to the new array.
            if (i in array) {
                copy.push(array[i]);
                delete array[i];
                n--;
            }
        }
        return copy;
    }
    function reset_puzzle() {
        set_buttons_from_board(start_board)

    }

    function generate_board() {
        select_button(-1)//ensures all no squares in input fields
        let seed = set_seed()//generates a board with a single set of ints 1-9
        let solved_board = solve(seed)//generates a solution to seed
        let playable_board = prune_board(solved_board)//
        set_buttons_from_board(playable_board)
        start_board = playable_board

        }


    function prune_board(board) {
        //removes values from the board until no more can be removed while th board still has a ingle solution
        let index_list = []
        for(let i=0; i<81; i++){
            index_list.push(i)
        }
        index_list = shuffle(index_list)
        let remove = true
        let pieces_removed = 0
        while(remove) {
            //removes numbers from the board, each time ensuring that the board still only has one solution
            let copy = deep_copy_board(board)
            copy[index_list.shift()] = 0
            if (count_solutions(copy, 0) !== 1) {
                remove = false
            } else {
                pieces_removed +=1
                board = copy
            }
        }
        console.log(pieces_removed,"spaces removed")
        return board
    }


    function set_seed() {
        let seed = []
        for(let i=0;i<9;i++) {
            seed.push(i + 1)
            for (let j = 0; j < 8; j++) {
                seed.push(0)
            }
        }
        seed = shuffle(seed)
        return seed
    }


    //test board known to have one solution
    board1 =
        [
            5,3,0,0,7,0,0,0,0,
            6,0,0,1,9,5,0,0,0,
            0,9,8,0,0,0,0,6,0,
            8,0,0,0,6,0,0,0,3,
            4,0,0,8,0,3,0,0,1,
            7,0,0,0,2,0,0,0,6,
            0,6,0,0,0,0,2,8,0,
            0,0,0,4,1,9,0,0,5,
            0,0,0,0,8,0,0,7,9
        ]
    document.addEventListener('DOMContentLoaded', create_board())


