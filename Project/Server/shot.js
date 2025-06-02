class Shot {
    constructor(teamId, playerX, playerY, mouseX, mouseY, square) {
            
        this.teamId = teamId;

        // player position middle
        this.playerX = playerX + square/2;
        this.playerY = playerY + square/2;

        // mouse position
        this.mouseX = mouseX;
        this.mouseY = mouseY;

        // shot position
        this.x = playerX + square/2;
        this.y = playerY + square/2;

        this.speed = 10;

        this.direction = this.determineDirectionBoolean(this.x, this.mouseX)

        // the constant radians
        this.radians = this.determineAngle(this.mouseX, this.mouseY, this.playerX, this.playerY);
    }

    changeSpeed(newSpeed){
        this.speed = newSpeed;
    }

    determineDirectionBoolean(pointX, constX){
        if (pointX <= constX) {return true}
        else {return false}
    }

    determineAngle(mouseX, mouseY, playerX, playerY){
        let math = require('mathjs');

        let vectorX = mouseX - playerX;
        let vectorY = mouseY - playerY;

        let radians = math.atan(vectorY/vectorX);
        return radians;
    }

    collisionDetection(canvasX, canvasY){
        if( this.x>=canvasX || this.y>=canvasY || this.x<=10 || this.y<=10){
            return false;
        }
        else{
            return true;
        }
    }

    // collisionDetection(canvasX, canvasY){
    //     if( this.x>=canvasX || this.y>=canvasY || this.x>=30 || this.y>=30){
    //         return false;
    //     }
    //     else{
    //         return true;
    //     }
    // }

    // for access from the server (without knowing the parameter)
    updateInterface(){
        this.updatePoint(this.radians, this.x, this.y, this.direction, this.speed)
    }

    updatePoint(radians, pointX, pointY, direction, speed){
        let math = require('mathjs');

        let x = math.cos(radians) * speed;
        let y = math.sin(radians) * speed;

        if(direction){
            this.x = x+pointX;
            this.y = y+pointY;
        }
        else{
            this.x = math.abs(x-pointX);
            this.y = math.abs(y-pointY);
        }
    }
}

module.exports = Shot;
