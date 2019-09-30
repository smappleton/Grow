class Player {
  
  constructor(id, difficulty) {
    this.clr = color((255), 
      random(255), 
      random(255));
    this.personality = id;
    this.diff = difficulty;
    if(id != AI.human){
      this.regionMap = new RegionMap(difficulty, grid);
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
           if (grid[rx][ry].owned){
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
          if (!grid[x][top].owned && top > 0){
             top--;
          } else{
             topgrowing = false; 
          }
          
          if (!grid[x][bottom].owned && bottom < rows-1){
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
          if (!grid[left][y].owned && left > 0){
             left--;
          } else {
             leftgrowing = false; 
          }
          if (!grid[right][y].owned && right < cols-1){
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
    let total = scoreBoard.reduce((a, b) => a+b, 0);
    if (total == ((cols*rows)-obstacleCount) || gameOver) {
      return;
    } 
    grid[x][y].owner = this.clr;
    currentPlayer++;
    if (currentPlayer == playerCount){
      grow();
    }
  }

  random_move() {
    //these are now flat indices
    let available = getAvailable();
    let flat = available[floor(random(available.length))];
    let x = flat % cols;
    let y = floor(flat/cols);
    this.attack(x,y);
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
  
  move(){
   switch(this.personality){
      case AI.human:
      break;
      
      case AI.rando:
      this.random_move();
      break;
      
      case AI.katie:
      this.katie_move();
      break;
      
      default:
      print("Error in AI switch");
      this.random_move();
   }
  }
}
