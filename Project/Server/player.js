class Player {
    constructor(id) {
      this.id = id;
      this.x = 250;
      this.y = 250;
      this.pressingRight = false;
      this.pressingLeft = false;
      this.pressingUp = false;
      this.pressingDown = false;
      this.speed = 10;
      this.team = "";
      this.updatePosition = () => {
        if (this.pressingRight) this.x += this.speed;
        if (this.pressingLeft) this.x -= this.speed;
        if (this.pressingUp) this.y -= this.speed;
        if (this.pressingDown) this.y += this.speed;
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.y > 541) this.y = 541;
        if (this.x > 961) this.x = 961;
      };
    }
  }

  module.exports = Player;