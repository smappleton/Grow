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
let aiDiff = 6;
let players = new Array(playerCount);
let currentPlayer = 0;
let gameOver = false;
let mercy = false;
let obstacleCount = 0;
let playArea = 0;

let uiWidth = 0;
let uiHeight = 50;
let boardWidth = 0;
let boardHeight = 0;

let growthPattern = GROWPATTERN.diamond;




//needs to be board specific
function mousePressed() {
  if (currentPlayer >= humanCount){
    return;
  }
  //TODO this doesnt need a double for
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j< rows; j++) {
      if (mainBoard.grid[i][j].contains(mouseX, mouseY)) {
        mainBoard.grid[i][j].owner = players[currentPlayer].clr;
        currentPlayer++;
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
  boardWidth = windowWidth;
  //leave space for ui
  boardHeight = windowHeight-uiHeight;
  background(0);
  frameRate(frameSpeed);
  cols = floor(boardWidth / size);
  rows = floor(boardHeight / size);
  
  mainBoard = new Board(cols,rows, size, true);
  
  //human players
  for (let i=0; i<humanCount; i++){
    players[i] = new Player(AI.human, aiDiff, mainBoard);
    mainBoard.scoreBoard[i] = 0;
  }
  //Ai players
  for (let i=humanCount; i<players.length; i++) {
    players[i] = new Player(AI.gabe, aiDiff, mainBoard);
    mainBoard.scoreBoard[i] = 0;
  }
  
  uiWidth = floor(boardWidth/playerCount);
  
  
}


function draw() {
  //draw UI
  let percentages = mainBoard.scoreBoard.map((x) => round((x/playArea)*100));
  for (let i=0; i<playerCount; i++){
     let x = i*uiWidth;
     let y = boardHeight;
     //clear area
     fill(0);
     stroke(0);
     rect(x,y,uiWidth,uiHeight);
     let s = "P" + (i+1) + "- " + percentages[i] + "%, " + mainBoard.scoreBoard[i];
     textSize(uiHeight);
     stroke(players[i].clr);
     fill(players[i].clr);
     text(s,x,y,uiWidth,uiHeight);
  }
  //call the AI
  if (currentPlayer >= humanCount && !gameOver && playerCount != humanCount) {
    players[currentPlayer].move();
  }
  
  if (currentPlayer == playerCount) {
    mainBoard.grow();
  }
   
  let first = max(...mainBoard.scoreBoard);
  let ifirst = mainBoard.scoreBoard.indexOf(first);
  mainBoard.scoreBoard[ifirst] = -Infinity;
  let second = max(...mainBoard.scoreBoard);
  mainBoard.scoreBoard[ifirst] = first;
  let diff = first-second;
  
  if (diff > mainBoard.available.length && !mercy){
     print("MERCY- Player " + (ifirst+1) + " has won!"); 
     mercy = true;
  }
  
  if (mainBoard.available.length == 0 && !gameOver) {
    textSize(uiHeight);
    fill(255);
    stroke(0);
    let x = floor(boardWidth/2);
    let y = floor(boardHeight/2);
    text("GAME OVER", x-200,y);
    console.log("GAME OVER");
    console.log("Board size - " + playArea);
    console.log("Final scores - " + mainBoard.scoreBoard);
    let percentages = mainBoard.scoreBoard.map((x) => round((x/playArea)*100));
    console.log("Final coverage % - " + percentages);
    gameOver = true;
  }
}
