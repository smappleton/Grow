class Player {
  
  constructor(id, difficulty) {
    this.clr = color((255), 
      random(255), 
      random(255));
    this.personality = id;
    this.diff = difficulty;
  }

  random_move() {
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
  
  move(){
   switch(this.personality){
      case AI.rando:
      this.random_move();
      break;
      default:
      print("Error in AI switch");
      this.random_move();
   }
  }
}
