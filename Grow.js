let grid;
let noisy = true;
let noiseScale = 0.1;
let size = 40;
let cols;
let rows;
let humanCount = 1;
let playerCount = 4;
let players = new Array(playerCount);
let scoreBoard = new Array(playerCount);
let contestCount = new Array(playerCount);
let currentPlayer = 0;
let gameOver = false;
let obstacleCount = 0;

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i =0; i< arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

function mousePressed() {
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
  console.log(scoreBoard);
}

function getPlayer(givenColor) {
  for (let i=0; i<players.length; i++) {
    if (players[i].clr == givenColor) {
      return i;
    }
  }
  return -1;
}

//returns the unowned cells
function getAvailable() {
  let ans = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j< rows; j++) {
      thisCell = grid[i][j];
      if (!thisCell.owned) {
        ans.push(thisCell);
      }
    }
  }
  return ans;
}


function setup() {
  createCanvas(1201, 701);
  background(0);
  frameRate(1);
  cols = floor(width / size);
  rows = floor(height / size);
  grid = make2DArray(cols, rows);
  noiseGrid = make2DArray(cols, rows);

  for (let i=0; i<players.length; i++) {
    players[i] = new Player();
    scoreBoard[i] = 0;
  }

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
}


function draw() {
  //call the AI
  if (currentPlayer >= humanCount) {
    players[currentPlayer].move();
  }

  let total = scoreBoard.reduce((a, b) => a+b, 0);
  if (total == ((cols*rows)-obstacleCount) && !gameOver) {
    console.log("GAME OVER");
    console.log("Final scores - " + scoreBoard);
    gameOver = true;
  }
}
