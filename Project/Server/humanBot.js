class HumanBot {
    constructor (player_list){
        this.player_list = player_list;
        this.x = Math.floor(Math.random() * Math.floor(961));
        this.y = Math.floor(Math.random() * Math.floor(541));
        this.collisionDetectionPlayer();
        this.cellSize = 60;
    }

    collisionDetectionPlayer(){
        for(let i = 0; i < this.player_list.length; i++){
            if(this.player_list[i].x === this.x && this.player_list[i].x === this.y){
                this.x += 60;
            }
        }
    }

    collisionDetectionCanvas(){
        if(this.x >= 961 || this.y >= 541 ){
            this.x -= 60;
            this.y -= 60;
        } else if (this.y < 0 || this.x < 0){
            this.x += 60;
            this.y += 60;
        }
    }

    collisionDetectionHumanBot(list){
        for(let i = 0; i < list.length; i ++){
            if(this.x === list[i].x && this.y === list[i].y){
                this.x += 1;
            }
        }
    }

    move(){
        //directions = ["Up", "Down", "Left", "Right"];
        this.y += Math.sin(0.2 * 10) * 5;
        this.x += Math.sin(0.2 * 10) * 5;
    }
}

module.exports = HumanBot;