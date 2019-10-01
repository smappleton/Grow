class Cell {

  constructor(myBoard, xIndex, yIndex, size, obs, visible) {
    this.board = myBoard;
    this.xIndex = xIndex;
    this.yIndex = yIndex;
    this.size = size;
    this.x = xIndex*this.size;
    this.y = yIndex*this.size;


    this._owner = color(225);
    this.visible = visible;
    this._owned = false;
    this._contested = false;
    if (obs == undefined) {
      this._obstacle = false;
    } else {
      this._obstacle = true;
      this._owned = true;
    }
    
    this.show();
  }
  
  //for reproducing board
  deepClone(newBoard){
    let obs = undefined;
    if (this._obstacle){
       obs = true; 
    }
     let ans = new Cell(newBoard, this.xIndex, this.yIndex, this.size, obs, false);
     if (this._contested){
        ans.contest(); 
     }
     if(this._owned){
        ans.owner = this._owner; 
     }
     return ans;
  }

  show() {
    //dont show if marked invisible
    if (!this.visible){
       return; 
    }
    if (this._obstacle) {
      fill(0);
      strokeWeight(1);
      let str = showGrid ? stroke(150) : stroke(0);
      rect(this.x, this.y, this.size, this.size);
      //draw an x
      strokeWeight(0.5);
      stroke(150);
      //line(this.x, this.y, this.x+this.size, this.y+this.size);
      //line(this.x+this.size, this.y, this.x, this.y+this.size);
    } else if (!this._contested) {
      strokeWeight(1);
      let str = showGrid ? stroke(150) : stroke(this.owner);
      fill(this.owner);
      rect(this.x, this.y, this.size, this.size);
    } else {
      strokeWeight(1);
      let str = showGrid ? stroke(150) : stroke(this.owner);
      fill(this.owner);
      rect(this.x, this.y, this.size, this.size);
      fill(150);
      ellipse(this.x + this.size/2, this.y + this.size/2, 
        this.size*0.2);
    }
  }

  contains(x, y) {
    return (x > this.x && x < this.x + this.size &&
      y > this.y && y < this.y + this.size);
  }

  //use this to change growth patterns
  getNeighbors() {
    let neighbors = [];
    switch(growthPattern){
      case GROWPATTERN.diamond: 
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          let nearX = i+this.xIndex;
          let nearY = j+this.yIndex;
          if (nearX > -1 && nearX < cols && 
            nearY > -1 && nearY < rows && abs(i)!=abs(j)) {
            neighbors.push(this.board.grid[nearX][nearY]);
          }
        }
      }
      break;
      default:
      print("Error in neighbors");
    }
    return neighbors;
  }

  claimNeighbors() {
    let nbrs = this.getNeighbors();
    for (let i=0; i < nbrs.length; i++) {
      nbrs[i].contest();
    }
  }

  contest() {
    if (!this._owned) {
      this._contested = true;
      this.show();
    }
  }

  //getters and setters
  get owner() {
    return this._owner;
  }

  set owner(newOwner) {
    if (!this._owned) {
      let playerID = getPlayer(newOwner);
      this.board.scoreBoard[playerID] += 1;
      this._owned = true;
      this._owner = newOwner;
      this.claimNeighbors();
      this._contested = false;
      this.show();
      this.board.claimed(this.xIndex, this.yIndex);
    } else{
      //misclick case
      if (this.board.main){
       currentPlayer--; 
      }
      //copy case
      else {
        
      }
    }
  }

  get owned() {
    return this._owned;
  }

  get contested() {
    return this._contested;
  }
}
