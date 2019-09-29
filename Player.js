class Player {

  constructor() {
    this.clr = color((255), 
      random(255), 
      random(255));
  }

  move() {
    let total = scoreBoard.reduce((a, b) => a+b, 0);
    if (total == ((cols*rows)-obstacleCount) || gameOver) {
      return;
    } 
    //these are now flat indices
    let available = getAvailable();
    let flat = available[floor(random(available.length))];
    let x = flat % cols;
    let y = floor(flat/cols);
    grid[x][y].owner = this.clr;
    currentPlayer++;
    if (currentPlayer == playerCount){
      grow();
    }
  }
}
