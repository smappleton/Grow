class Player {

  constructor() {
    this.clr = color((255), 
      random(255), 
      random(255));
  }

  move() {
    let total = scoreBoard.reduce((a, b) => a+b, 0);
    if (total == ((cols*rows)-obstacleCount) || gameOver) 
      return;
    let available = getAvailable();
    let val = floor(random(available.length));
    available[val].owner = this.clr;
    currentPlayer++;
    if (currentPlayer == playerCount)
      grow();
  }
}
