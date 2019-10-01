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
let mainBoard;
let noisy = true;
let noiseScale = 0.1;
let cols;
let rows;
let size = 20;
let showGrid = false;
let frameSpeed= 1;
let humanCount = 1;
let playerCount = 2;
let boardSeed = 0;
let aiSeed = 0;
let aiDiff = 10;
let players = new Array(playerCount);
let scoreBoard = new Array(playerCount);
let currentPlayer = 0;
let gameOver = false;
let mercy = false;
let obstacleCount = 0;
let playArea = 0;

let growthPattern = GROWPATTERN.diamond;




//needs to be board specific
function mousePressed() {
  //TODO this doesnt need a double for
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j< rows; j++) {
      if (mainBoard.grid[i][j].contains(mouseX, mouseY)) {
        mainBoard.grid[i][j].owner = players[currentPlayer].clr;
        currentPlayer++;
        if (currentPlayer == playerCount) {
          mainBoard.grow();
        }
      }
    }
  }
}

function getPlayer(givenColor) {
  for (let i=0; i<players.length; i++) {
    if (players[i].clr == givenColor) {
      return i;
    }
  }
  return -1;
}


//search sorted array for val, return index
//-1 if the val isnt there
function binarySearchArr(arr, val){
  let ans = -1;
  let low = 0;
  let high = mainBoard.available.length-1;
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
  
  mainBoard = new Board(cols,rows, size, true);
  let mycopy = mainBoard.deepClone();
  
  //human players
  for (let i=0; i<humanCount; i++){
    players[i] = new Player(AI.human, aiDiff, mainBoard);
    scoreBoard[i] = 0;
  }
  //Ai players
  for (let i=humanCount; i<players.length; i++) {
    players[i] = new Player(AI.gabe-i*2, aiDiff, mainBoard);
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
  
  if (diff > mainBoard.available.length && !mercy){
     print("MERCY- Player " + (ifirst+1) + " has won!"); 
     mercy = true;
  }
  
  if (mainBoard.available.length == 0 && !gameOver) {
    console.log("GAME OVER");
    console.log("Board size - " + playArea);
    console.log("Final scores - " + scoreBoard);
    let percentages = scoreBoard.map((x) => round((x/playArea)*100));
    console.log("Final coverage % - " + percentages);
    gameOver = true;
  }
}
