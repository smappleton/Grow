class Cell {

  constructor(xIndex, yIndex, size, obs) {
    this.xIndex = xIndex;
    this.yIndex = yIndex;
    this.x = xIndex*size;
    this.y = yIndex*size;
    this.size = size;

    this._owner = color(225);
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

  show() {
    if (this._obstacle) {
      fill(0);
      rect(this.x, this.y, this.size, this.size);
      strokeWeight(0.5);
      stroke(150);
      //draw an x
      line(this.x, this.y, this.x+this.size, this.y+this.size);
      line(this.x+this.size, this.y, this.x, this.y+this.size);
    } else if (!this._contested) {
      strokeWeight(0.5);
      stroke(150);
      fill(this.owner);
      rect(this.x, this.y, this.size, this.size);
    } else {
      strokeWeight(0.5);
      stroke(150);
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
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        let nearX = i+this.xIndex;
        let nearY = j+this.yIndex;
        if (nearX > -1 && nearX < cols && 
          nearY > -1 && nearY < rows && abs(i)!=abs(j)) {
          neighbors.push(grid[nearX][nearY]);
        }
      }
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
      scoreBoard[playerID] += 1;
      this._owned = true;
      this._owner = newOwner;
      this.claimNeighbors();
      this._contested = false;
      this.show();
      claimed(this.xIndex, this.yIndex);
    } else {
      //console.log("misclick!");
      currentPlayer--;
    }
  }

  get owned() {
    return this._owned;
  }

  get contested() {
    return this._contested;
  }
}
