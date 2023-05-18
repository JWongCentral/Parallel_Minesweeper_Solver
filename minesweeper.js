var components = {
    row : 40,
    col : 40,
    num_bomb : 400,
    bomb_icon : '💣', 
    flag_icon: '🚩',
}

let squares = []
let gameArray = []
let bombArray = []
let game_started = false
let game_over = false
let game_win = false
let flags = 0

/**
 * This will just
 * Reset the board with empty string clearing all entries
 */ 
function resetBoard(){
    game_started = false;
    for (let row = 0; row < components.row; row++){
        gameArray[row] = [];
        bombArray[row] = [];
        for (let col = 0; col < components.col; col++){
            gameArray[row][col] = "_";
            bombArray[row][col] = "NotBomb";
        }
    }
}
/**
 * x and y are the starting positions and we are assuming the game
 * has not started yet otherwise it will not do anything
 */
function createBombs(x,y){
    x = parseInt(x);
    y = parseInt(y);
    game_started = true;
    let bomb_count = 0;
    while(bomb_count < components.num_bomb){
        let rand_row = Math.floor(Math.random() * components.row);
        let rand_col = Math.floor(Math.random() * components.col);
        //too close to place bomb try again
        if((rand_row >= x-1 && rand_row <=x+1 && rand_col >= y-1 && rand_col <= y+1)||
            bombArray[rand_row][rand_col]=="Bomb"){
            continue;
        }
        
        else{
            bombArray[rand_row][rand_col] = "Bomb";
            bomb_count++;
        }
    }

    updateNumbers()

}


function updateNumbers(){
    for (let row = 0; row < components.row; row++){
        for (let col = 0; col < components.col; col++){
            if(bombArray[row][col] != "Bomb"){
                bombArray[row][col] = getCount(row,col)
            }
        }
    }

    let str = ""
    //logging answer to console for debugging purposes
    for (let row = 0; row < components.row; row++){
        for (let col = 0; col < components.col; col++){
            if(bombArray[row][col]=="Bomb")
                str+='X'
            else
                str+=bombArray[row][col]
        }
    }
    console.log(str)
}


function createBoard(grid){
    resetBoard()
    for (let row = 0; row < components.row; row++){
        for (let col = 0; col < components.col; col++){
            const square = document.createElement('div');
            square.setAttribute('id',gridId(row,col));
            square.classList.add(gameArray[row][col])
            square.addEventListener('contextmenu', (e) => {
                e.preventDefault()
                flag(square)
            })
            square.addEventListener('click', function(e){
                click(square)
            })
            grid.appendChild(square);
            squares.push(square);
        }
    }
}

/**
 * 
 * Handles click functionality
 */
function click(tile){
    let id = tile.id;
    let count = 0
    //game over or it is flagged, we dont do anything
    if (game_over) return
    else if (tile.classList.contains("flagged") || tile.classList.contains("opened")) return

    //time to do some filtering, we only want the row,col from the id
    let row = parseInt(id.substring(5,id.indexOf('-',5)))
    let col = parseInt(id.substring(id.indexOf('-',5)+1))
    
    if(!game_started){
        createBombs(row,col)
    }

    // replace all non-numeric characters with empty string
    if(bombArray[row][col] != 'Bomb'){
        tile.classList.add("opened")
        count = getCount(row,col)
        tile.innerHTML = count
        gameArray[row][col] = count;
    }
    else{
        gameOver()
        tile.innerHTML = components.bomb_icon;
    }

    //checks if the tile is empty then we open neighbors
    if (count == 0){
        openNeighbors(row,col)
    }
    checkWin()
    updateString()
}
function gameOver(){
    game_over = true
    console.log("game over")
    for (let row = 0; row < components.row; row++){
        for (let col = 0; col < components.col; col++){
            if(bombArray[row][col] == "Bomb"){
                let tile = document.getElementById(gridId(row,col))
                tile.innerHTML = components.bomb_icon;
            }
            
        }
    }
}

//adding flag (there can only be the same number of flags)
function flag(tile){
    if(game_over) return
    if(tile.classList.contains("opened"))return
    if(flags>=components.num_bomb)return
    let id = tile.id
    if(!tile.classList.contains("flagged")){
        tile.innerHTML=components.flag_icon
        tile.classList.add('flagged')
        flags++
        let row = parseInt(id.substring(5,id.indexOf('-',5)))
        let col = parseInt(id.substring(id.indexOf('-',5)+1))
        gameArray[row][col] = "?"
    }
    else{
        tile.innerHTML=""
        tile.classList.remove('flagged')
        flags--
        let row = parseInt(id.substring(5,id.indexOf('-',5)))
        let col = parseInt(id.substring(id.indexOf('-',5)+1))
        gameArray[row][col] = "_"
    }
    checkWin()
    updateString()
}

function openNeighbors(row,col){
    for(let x = -1; x <=1; x++){
        for(let y = -1; y<=1; y++){
            if((row+x)<0 || row+x>= components.row ||
                col+y<0 || col+y >= components.col){
                    
                    continue;
                }
            else{
                let tile = document.getElementById(gridId(row+x,col+y))
                click(tile)
            }
        }
    }
    
}

function checkWin(){
    if(game_over)return
    let matches = 0
    for (let row = 0; row < components.row; row++){
        for (let col = 0; col < components.col; col++){
            
            if(gameArray[row][col]=="?" && bombArray[row][col] =="Bomb"){
                matches++
                console.log(matches)
            }
            
            //unopened tile that is a bomb
            else if(gameArray[row][col] == '_' && bombArray[row][col]!="Bomb"){
                return false;
            }
            
            //inverse of above...
            //assuming it never happens then that means all the unopened ones are bombs
            else if(gameArray[row][col] == '_' && bombArray[row][col]=="Bomb"){
                matches++
                
            }
        }
    }
    
    if(matches==components.num_bomb){
        console.log("You win")
        game_win=true;
        game_over = true;
        return true;
    }
    updateString()
}

function gridId(i, j) {
    return 'grid-' + i.toString().padStart(2,'0') + '-' + j.toString().padStart(2,'0');
}
/**
 * 
 * returns: 0 if no bombs
 * 1+ if there are bombs
 * -1 if it is a bomb
 */
function getCount(row,col){
    let count = 0;
    row = parseInt(row)
    col = parseInt(col)
    
    if(bombArray[row][col] == "Bomb") return -1;
    for(let x = -1; x <=1; x++){
        for(let y = -1; y<=1; y++){
            if((row+x)<0 || row+x>= components.row ||
                col+y<0 || col+y >= components.col){
                    continue;
                }
            else if(bombArray[row+x][col+y] == "Bomb"){
                count++;
            }
        }
    }
    
    return count
}
function updateString(){
    string = document.querySelector('.parse_string');
    if (game_win) str = "YOU WIN"
    else if(game_over) str = "YOU LOSE"
    
    else{
        str = ""
        for (let row = 0; row < components.row; row++){
            for (let col = 0; col < components.col; col++){
                if(gameArray[row][col] == "Bomb"){
                    str+="X"
                }
                else{
                    str+=gameArray[row][col]
                }

            }
        }
    }
    string.innerHTML=str;
    
}
document.addEventListener("DOMContentLoaded",() => {
    const grid = document.querySelector('.grid');
    grid.setAttribute('style',"width:"+(components.col*20)+"px;");
    createBoard(grid);
    updateString();
})