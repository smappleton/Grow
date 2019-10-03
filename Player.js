class Player {
  
  constructor(id, difficulty, board) {
    this.board = board;
    this.clr = color((255), 
      random(255), 
      random(255));
    this.personality = id;
    this.diff = difficulty;
    if(id != AI.human){
      this.regionMap = new RegionMap(difficulty, this.board.grid);
    }
  }
  
  //choose one candidate move randomly from each region
  candidates() {
    let ans = [];
    for (let i = 0; i<this.regionMap.rmap.length; i++){
        let arr = this.regionMap.rmap[i];
        let curr = -1;
        while(arr.length > 0 && curr == -1){
           let r = floor(random(arr.length));
           let rval = arr[r];
           let rx = rval%cols;
           let ry = floor(rval/cols);
           if (this.board.grid[rx][ry].owned){
             //remove from map
             arr.splice(r,1);
           } else {
             curr = rval; 
           }
        }
        if (curr > 0){
          ans.push(curr);
        }
    }
    return ans;
  }
  
  projection(x,y){
     switch(growthPattern){
       case GROWPATTERN.diamond:
       //find vertical line
       let top = y; let bottom = y;
       let topgrowing = true;
       let bottomgrowing = true;
       while (topgrowing && bottomgrowing){
          if (!this.board.grid[x][top].owned && top > 0){
             top--;
          } else{
             topgrowing = false; 
          }
          
          if (!this.board.grid[x][bottom].owned && bottom < rows-1){
             bottom++; 
          } else {
             bottomgrowing = false; 
          }
       }
       //find horizonital line
       let left = x; let right = x;
       let leftgrowing = true;
       let rightgrowing = true;
       while(leftgrowing && rightgrowing){
          if (!this.board.grid[left][y].owned && left > 0){
             left--;
          } else {
             leftgrowing = false; 
          }
          if (!this.board.grid[right][y].owned && right < cols-1){
             right++; 
          } else {
             rightgrowing = false; 
          }
       }
       let vert = bottom-top;
       let horz = right-left;
       return vert*horz/2;
       /*
       return -(x+y);
       this actually creates some really cool effects in sim mode with katie
       */
       
       default:
       print("Error in projection, unsupported growth");
       break;
     }
  }
  
  attack(x,y){
    let total = this.board.scoreBoard.reduce((a, b) => a+b, 0);
    if (total == ((cols*rows)-obstacleCount) || gameOver) {
      return;
    } 
    this.board.grid[x][y].owner = this.clr;
    currentPlayer++;
  }

  random_move() {
    //these are now flat indices
    let available = this.board.available;
    if(available.length == 0){
      return;
    }
    let flat = available[floor(random(available.length))];
    let x = flat % cols;
    let y = floor(flat/cols);
    this.attack(x,y);
  }
  
  //plays out the game with a given move and number of turns
  //just grows no turn prediction, DESTROYS BOARD
  //returns the ending scoreboard
  simplePlayout(board,x,y,turns){
    board.grid[x][y].owner = this.clr;
    for (let i=0; i<turns; i++){
       board.grow(); 
    }
    return board.scoreBoard;
  }
  
  //a monte carlo playout in n turns
  montePlayout(board,x,y,turns){
    board.grid[x][y].owner = this.clr;
    let myPlayer = currentPlayer;
    let thisPlayer = myPlayer+1;
    
    //find best move by monte carlo
    //returns scoreboard
    for (let i=0; i<turns; i++){
      //cycle through all players each turn
      while(thisPlayer != myPlayer){ 
       if (thisPlayer === playerCount){
          board.grow();
          thisPlayer = 0; 
       }
       let available = board.available;
       if(available.length == 0){
         break;
       }
       let flat = available[floor(random(available.length))];
       let currx = flat % cols;
       let curry = floor(flat/cols);
       board.grid[currx][curry].owner = players[thisPlayer].clr;
       
       thisPlayer++;
     }
     thisPlayer++;
   }
   return board.scoreBoard;
  }
  
  //min max the a given scoreBoard
  //if the player is the the lead, gives a positive of how far ahead
  //if not, shows how far behind the leader
  minMax(givenBoard){
    //copy scoreBoard
    let copyBoard = new Array(0);
    for (let i=0; i<givenBoard.length; i++){
      copyBoard.push(givenBoard[i]); 
    }
    
    let top = max(...copyBoard);
    let leader = copyBoard.indexOf(top);
    if (currentPlayer == leader){
       copyBoard.splice(leader,1);
       let second = max(...copyBoard);
       return top-second;
    } else {
      let myScore = copyBoard[currentPlayer];
      return -(top-myScore);
    }
  }
  
  //the hill climbing algorithm that looks for a local maximum
  //returns a Result object that has the x,y,and score of maximum
  hillClimb(board,x,y,score, startBoard, turns){
    let currCell = board.grid[x][y];
    let currScore = score;
    let currScores = startBoard;
    let finished = false;
    //keep looking until all neighbors are worse
    while(!finished){
      let nbrs = currCell.getNeighbors();
      let bestX = -1;
      let bestY = -1;
      let bestVal = -1000;
      let bestScores = new Array(0);
      //find the best neighbor
      for (let i=0; i<nbrs.length; i++){
        let n = nbrs[i];
        //skip owned neighbors
        if(n.owned){
          continue; 
        }
        let copyBoard = board.deepClone();
        let scores = this.simplePlayout(copyBoard,n.xIndex,n.yIndex,turns);
        let score = scores[currentPlayer];
        if(score > bestVal){
           bestX = n.xIndex;
           bestY = n.yIndex;
           bestVal = score;
           bestScores = scores;
        }
      }
      if(bestVal > currScore){
        currScore = bestVal;
        currCell = board.grid[bestX][bestY];
        currScores = bestScores;
      } else {
         finished = true;
      }
    }
    return new Result(currCell.xIndex,currCell.yIndex,currScore,currScores);
  }
  
  //the hill climbing algorithm that looks for a local maximum
  //returns a Result object that has the x,y,and score of maximum
  //this one focuses on min max instead of raw score
  hillMinMax(board,x,y,score, startBoard, turns){
    let currCell = board.grid[x][y];
    let currScore = this.minMax(startBoard);
    let currScores = startBoard;
    let finished = false;
    //keep looking until all neighbors are worse
    while(!finished){
      let nbrs = currCell.getNeighbors();
      let bestX = -1;
      let bestY = -1;
      let bestVal = -1000;
      let bestScores = new Array(0);
      //find the best neighbor
      for (let i=0; i<nbrs.length; i++){
        let n = nbrs[i];
        //skip owned neighbors
        if(n.owned){
          continue; 
        }
        let copyBoard = board.deepClone();
        let scores = this.simplePlayout(copyBoard,n.xIndex,n.yIndex,turns);
        let score = this.minMax(scores);
        if(score > bestVal){
           bestX = n.xIndex;
           bestY = n.yIndex;
           bestVal = score;
           bestScores = scores;
        }
      }
      if(bestVal > currScore){
        currScore = bestVal;
        currCell = board.grid[bestX][bestY];
        currScores = bestScores;
      } else {
         finished = true;
      }
    }
    return new Result(currCell.xIndex,currCell.yIndex,currScore,currScores);
  }
  
  carla_move(){
    //number of playouts for each move
    //heavily effects performance
    let playouts = 12;
    let cand = this.candidates();
    if (cand.length == 0){
       print("Bad candidates!");
       this.random_move();
       return;
    }
    
    //find best move by monte carlo
    let bestX = -1;
    let bestY = -1;
    let bestValue = -1000; 
    for (let i=0; i<cand.length; i++){
      let count = 0;
      let sum = 0;
      let currX = cand[i]%cols;
      let currY = floor(cand[i]/cols);
      
      for (let j=0; j<playouts; j++){
        let copyBoard = mainBoard.deepClone();
        //five turn playout
        let scores = this.montePlayout(copyBoard,currX,currY,15);
        sum += scores[currentPlayer];
        count++;
      }
      let avg = sum/count;
      if(avg > bestValue){
        bestX = currX;
        bestY = currY;
        bestValue = avg;
      }
    }
    this.attack(bestX,bestY);
  }
  
  clint_move(){
    let turns = 10;
    let cand = this.candidates();
    if (cand.length == 0){
       print("Bad candidates!");
       this.random_move();
       return;
    }
    
    //find best moves by greed and use topology to find local maximum
    let sortedCand = new Array(cand.length);
    //test each candidate on a new board
    for (let i=0; i<cand.length; i++){
        let copyBoard = mainBoard.deepClone();
        let currX = cand[i]%cols;
        let currY = floor(cand[i]/cols);
        copyBoard.grid[currX][currY].owner = this.clr;
        //number of turns in playout is significant
        let scores = this.simplePlayout(copyBoard,currX,currY,turns);
        let score = scores[currentPlayer];
        let currResult = new Result(currX,currY,score,scores);
        sortedCand.push(currResult);
    }
    
    //sort the candidate results by score
    sortedCand.sort((a,b) => (a.score < b.score) ? 1 : -1);
    
    //now choose the top n and do the hill climbing
    let topCount = 10;
    let count = min(topCount,sortedCand.length);
    let best = sortedCand.splice(0,count);
    let firstScore = best[0].score;
    //the length of best is deceiving because of how javascript works
    for (let i=0; i<Object.keys(best).length; i++){
      let copyBoard = mainBoard.deepClone();
      let newBest = this.hillClimb(copyBoard,best[i].x,best[i].y,best[i].score, best[i].scoreBoard, turns);
      best[i] = newBest;
    }
    //sort again
    best.sort((a,b) => (a.score < b.score) ? 1 : -1);
    
    let improvement = best[0].score - firstScore;
    
    this.attack(best[0].x, best[0].y);
  }
  
  gabe_move(){
    let cand = this.candidates();
    if (cand.length == 0){
       print("Bad candidates!");
       this.random_move();
       return;
    }
    
    //find best move by greed
    let bestX = -1;
    let bestY = -1;
    let bestValue = -1000;
    //test each candidate on a new board
    for (let i=0; i<cand.length; i++){
        let copyBoard = mainBoard.deepClone();
        let currX = cand[i]%cols;
        let currY = floor(cand[i]/cols);
        copyBoard.grid[currX][currY].owner = this.clr;
        let scores = this.simplePlayout(copyBoard,currX,currY,10);
        let score = scores[currentPlayer];
        if (score > bestValue){
           bestX = currX;
           bestY = currY;
           bestValue = score;
        }
    }
    this.attack(bestX,bestY);
  }
  
  katie_move(){
    let cand = this.candidates();
    if (cand.length == 0){
       print("Bad candidates!");
       this.random_move();
       return;
    }
    let bestLocation = -1;
    let bestValue = -10000000;
    for(let i=0; i<cand.length; i++){
      let val = cand[i];
      let x = val%cols;
      let y = floor(val/cols);
      let currValue = this.projection(x,y);
      //print( x + "," + y + " has val of " + currValue);
      if (currValue > bestValue){
         bestValue = currValue;
         bestLocation = val;
      }
    }
    let x = bestLocation%cols;
    let y = floor(bestLocation/cols);
    this.attack(x,y);
  }
  
  minerva_move(){
    let turns = 10;
    let cand = this.candidates();
    if (cand.length == 0){
       print("Bad candidates!");
       this.random_move();
       return;
    }
    
    //find best moves by greed and use topology to find local maximum
    let sortedCand = new Array(0);
    //test each candidate on a new board
    for (let i=0; i<cand.length; i++){
        let copyBoard = mainBoard.deepClone();
        let currX = cand[i]%cols;
        let currY = floor(cand[i]/cols);
        copyBoard.grid[currX][currY].owner = this.clr;
        //number of turns in playout is significant
        let scores = this.simplePlayout(copyBoard,currX,currY,turns);
        let score = scores[currentPlayer];
        let currResult = new Result(currX,currY,score,scores);
        sortedCand.push(currResult);
    }
    
    //sort the candidate results by score
    sortedCand.sort((a,b) => (this.minMax(a.scoreBoard) < this.minMax(b.scoreBoard)) ? 1 : -1);
    
    //now choose the top n and do the hill climbing
    let topCount = 10;
    let count = min(topCount,sortedCand.length);
    let best = sortedCand.splice(0,count);
    let firstDiff = this.minMax(best[0].scoreBoard);
    //the length of best is deceiving because of how javascript works
    for (let i=0; i<Object.keys(best).length; i++){
      let copyBoard = mainBoard.deepClone();
      let newBest = this.hillMinMax(copyBoard,best[i].x,best[i].y,best[i].score, best[i].scoreBoard, turns);
      let diff = this.minMax(newBest.scoreBoard);
      best[i] = newBest;
    }
    //sort again
    best.sort((a,b) => (this.minMax(a.scoreBoard) < this.minMax(b.scoreBoard)) ? 1 : -1);
    let lastDiff = this.minMax(best[0].scoreBoard);
    
    let improvement = lastDiff - firstDiff;
    
    this.attack(best[0].x, best[0].y);
  }
  
  move(){
   switch(this.personality){
      case AI.human:
      break;
      
      case AI.randy:
      this.random_move();
      break;
      
      case AI.katie:
      this.katie_move();
      break;
      
      case AI.gabe:
      this.gabe_move();
      break;
      
      case AI.carla:
      this.carla_move();
      break;
      
      case AI.clint:
      this.clint_move();
      break;
      
      case AI.minerva:
      this.minerva_move();
      break;
      
      default:
      print("Error in AI switch");
      this.random_move();
   }
  }
}
