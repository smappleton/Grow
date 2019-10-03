class Board{
   
  constructor(cols,rows, mysize, main){
    
    //list of available cells by flat index, this is for searching in logn time
    this._available = [];
    //TODO make a flat list of contested cells too
    
    //this boards scoreboard
    this.scoreBoard = new Array(playerCount);
    //boolean to track if this is the mainboard
    this.main = main;
    this.grid = new Array(cols);
    this.noiseGrid = new Array(cols);
    //build 2d array
    for (let i =0; i< this.grid.length; i++) {
      this.grid[i] = new Array(rows);
      this.noiseGrid[i] = new Array(rows);
    }
    
    //build board
    //add cells and add noise
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j< rows; j++) {
        this.grid[i][j] = new Cell(this, i, j, mysize, undefined, this.main);
        let val = round(noise(i*noiseScale, j*noiseScale));
        if (val == 1 && noisy) {
          this.grid[i][j] = new Cell(this, i, j, mysize, 1, this.main);
          obstacleCount++;
        }
      }
    }
    
    this.buildAvailable();
  }
  
  //clone the whole board state but make it invisible.
  deepClone(){
     let newBoard = new Board(cols,rows,size,false);
     //copy the available array
     let arr = new Array(this._available.length);
     for (let i=0; i<this._available.length; i++){
        arr[i] = this._available[i];
     }
     newBoard.available = arr;
     
     //copy the grid
     for (let x=0; x<cols; x++){
        for (let y=0; y<rows; y++){
          let newCell = this.grid[x][y].deepClone(newBoard);
          newBoard.grid[x][y] = newCell;
        }
     }
     
     //copy the scoreBoard
     let scores = new Array(this.scoreBoard.length);
     for (let i=0; i<this.scoreBoard.length; i++){
        scores[i] = this.scoreBoard[i]; 
     }
     newBoard.scoreBoard = scores;
     
     return newBoard;
  }
  
  
  grow(){
    //create a list of contests
    let contests = [];
    //TODO this doesn't need a double for either
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j< rows; j++) {
        let thisCell = this.grid[i][j];
        if (thisCell.contested) {
          contests.push(thisCell);
        }
      }
    }

    //for all contests
    //IMPORTANT must wait until all contests are evaluated before setting any
    let winners = [];
    for (let i=0; i<contests.length; i++) {
      let currCell = contests[i];
      let nbrs = currCell.getNeighbors();
      //get empty score array
      let currScore = new Array(playerCount);
      for (let k =0; k<currScore.length; k++) {
        currScore[k] = 0;
      }

      //find neighbors and update scores
      for (let k=0; k<nbrs.length; k++) {
        let playerID = getPlayer(nbrs[k].owner);
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
    if (this.main){
      currentPlayer = 0;
      //raw scores
      //console.log(this.scoreBoard);
      //show coverage
      console.log(this.scoreBoard.map((x) => round((x/playArea)*100) )); 
    }
 
  }
  
  buildAvailable(){
    //create the sorted list of indices
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i< cols; i++) {
        let thisCell = this.grid[i][j];
        if (!thisCell.owned) {
          let val = i + (j*cols);
          this._available.push(val);
        }
      }
    }
    playArea = this._available.length;
  }
  
  //removes a cell from the available list
  claimed(x,y){
    let val = x + (y*cols);
    let index = binarySearchArr(this._available,val);
    this._available.splice(index,1);
  }
  
  //getters and setters
  
  get available(){
     return this._available; 
  }
  
  set available(newArr){
    this._available = newArr;
  }
}
