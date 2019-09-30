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
    let val = random(cand);
    let x = val%cols;
    let y = floor(val/cols);
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
