//global enums
const GROWPATTERN = {
  diamond : 1,
  square : 2,
};

const AI = {
  human : 0,
  rando : 1,
  katie : 2,
  gabe : 3,
  clint : 4,
  carla : 5,
};

//TODO this should all probably be in its own object
let grid;
let noisy = true;
let noiseScale = 0.1;
let cols;
let rows;
let size = 20;
let showGrid = false;
let frameSpeed= 100;
let humanCount = 0;
let playerCount = 2;
let boardSeed = 0;
let aiSeed = 0;
let aiDiff = 10;
let players = new Array(playerCount);
let scoreBoard = new Array(playerCount);
let contestCount = new Array(playerCount);
let currentPlayer = 0;
let gameOver = false;
let mercy = false;
let obstacleCount = 0;
let playArea = 0;

let growthPattern = GROWPATTERN.diamond;

//list of available cells by flat index, this is for searching in logn time
let available = [];
//TODO make a flat list of contested cells too



//main functions

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i =0; i< arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

function mousePressed() {
  //TODO this doesnt need a double for
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j< rows; j++) {
      if (grid[i][j].contains(mouseX, mouseY)) {
        grid[i][j].owner = players[currentPlayer].clr;
        currentPlayer++;
        if (currentPlayer == playerCount) {
          grow();
        }
      }
    }
  }
}

function grow() {

  //create a list of contests
  contests = [];
  //TODO this doesn't need a double for either
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j< rows; j++) {
      thisCell = grid[i][j];
      if (thisCell.contested) {
        contests.push(thisCell);
      }
    }
  }

  //for all contests
  //IMPORTANT must wait until all contests are evaluated before setting any
  let winners = [];
  for (let i=0; i<contests.length; i++) {
    currCell = contests[i];
    nbrs = currCell.getNeighbors();
    //get empty score array
    currScore = new Array(playerCount);
    for (let k =0; k<currScore.length; k++) {
      currScore[k] = 0;
    }

    //find neighbors and update scores
    for (let k=0; k<nbrs.length; k++) {
      playerID = getPlayer(nbrs[k].owner);
      if (playerID >= 0) {
        currScore[playerID] += 1;
      }
    }
    //get max players/check for ties
    let maxVal = 0;
    let maxIndex = -1;
    for (let k=0; k<currScore.length; k++) {
      if (currScore[k] > maxVal) {
        maxVal = currScore[k];
        maxIndex = k;
      }
    }

    //TODO resolve conflicts
    if (maxIndex > -1) {
      winners.push(players[maxIndex].clr);
    }
  }

  //update after evaluation
  for (let i=0; i<winners.length; i++) {
    contests[i].owner = winners[i];
  }

  //start next turn
  currentPlayer = 0;
  //raw scores
  //console.log(scoreBoard);
  //show coverage
  console.log(scoreBoard.map((x) => round((x/playArea)*100) ));
}

function getPlayer(givenColor) {
  for (let i=0; i<players.length; i++) {
    if (players[i].clr == givenColor) {
      return i;
    }
  }
  return -1;
}

//returns the available in flat indices
function getAvailable() {
  return available;
}

function buildAvailable(){
  //create the sorted list of indices
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i< cols; i++) {
      thisCell = grid[i][j];
      if (!thisCell.owned) {
        let val = i + (j*cols);
        available.push(val);
      }
    }
  }
  playArea = available.length;
}

//search sorted array for val, return index
//-1 if the val isnt there
function binarySearchArr(arr, val){
  let ans = -1;
  let low = 0;
  let high = available.length-1;
  while ((high-low) > 1){
    let middle = floor((high+low)/2);
    if (arr[middle] > val){
       high = middle; 
    } else{
       low = middle; 
    }
  }
  
  if (arr[low] == val){
     ans = low; 
  }
  if (arr[high] == val){
     ans = high; 
  }
  //print("Search result -" + ans);
  return ans;
}

//removes a cell from the available list
function claimed(x,y){
  let val = x + (y*cols);
  let index = binarySearchArr(available,val);
  available.splice(index,1);
}

//takes final scores and calculates the winning margin
function winningControl(scores){
  let first = max(...scores);
  return first/playArea;
  
}


function setup() {
  if (aiSeed != 0){
    randomSeed(aiSeed);
  }
  if (boardSeed != 0){
    noiseSeed(boardSeed);
  }
  createCanvas(windowWidth, windowHeight, P2D);
  background(0);
  frameRate(frameSpeed);
  cols = floor(width / size);
  rows = floor(height / size);
  grid = make2DArray(cols, rows);
  noiseGrid = make2DArray(cols, rows);

  //add cells and add noise
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j< rows; j++) {
      grid[i][j] = new Cell(i, j, size);
      let val = round(noise(i*noiseScale, j*noiseScale));
      if (val == 1 && noisy) {
        grid[i][j] = new Cell(i, j, size, 1);
        obstacleCount++;
      }
    }
  }
  
  buildAvailable();
  //human players
  for (let i=0; i<humanCount; i++){
    players[i] = new Player(AI.human, aiDiff);
    scoreBoard[i] = 0;
  }
  //Ai players
  for (let i=humanCount; i<players.length; i++) {
    players[i] = new Player(AI.katie, aiDiff);
    scoreBoard[i] = 0;
  }
  
}


function draw() {
  //call the AI
  if (currentPlayer >= humanCount && !gameOver) {
    players[currentPlayer].move();
  }
   
  let first = max(...scoreBoard);
  let ifirst = scoreBoard.indexOf(first);
  scoreBoard[ifirst] = -Infinity;
  let second = max(...scoreBoard);
  scoreBoard[ifirst] = first;
  let diff = first-second;
  
  if (diff > available.length && !mercy){
     print("MERCY- Player " + (ifirst+1) + " has won!"); 
     mercy = true;
  }
  
  if (getAvailable().length == 0 && !gameOver) {
    console.log("GAME OVER");
    console.log("Board size - " + playArea);
    console.log("Final scores - " + scoreBoard);
    let percentages = scoreBoard.map((x) => round((x/playArea)*100));
    console.log("Final coverage % - " + percentages);
    gameOver = true;
  }
}
