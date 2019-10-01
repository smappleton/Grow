class Board{
   
  constructor(cols,rows, mysize){
    
    //list of available cells by flat index, this is for searching in logn time
    this._available = [];
    //TODO make a flat list of contested cells too
    
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
        this.grid[i][j] = new Cell(this, i, j, mysize, undefined, true);
        let val = round(noise(i*noiseScale, j*noiseScale));
        if (val == 1 && noisy) {
          this.grid[i][j] = new Cell(this, i, j, mysize, 1, true);
          obstacleCount++;
        }
      }
    }
    
    this.buildAvailable();
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
    currentPlayer = 0;
    //raw scores
    //console.log(scoreBoard);
    //show coverage
    console.log(scoreBoard.map((x) => round((x/playArea)*100) ));  
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
}
