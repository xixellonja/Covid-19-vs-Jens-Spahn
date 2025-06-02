const HumanBot = require("./humanBot.js");

class Server {
  constructor() {
    this.app = require("express")();
    this.http = require("http").Server(this.app);
    this.express = require("express");
    this.io = require("socket.io")(this.http);
    this.path = require("path");
    this.clientPath = this.path.join(__dirname, "..", "client");
    this.app.use(this.express.static(this.clientPath));
    var Player = require('./player.js');
    var HumanBot = require('./humanBot.js');
    //when server.js is executed: server starts and listens to port 3000
    this.http.listen(3000, function () {
      console.log("Server is now running...");
    });
    //incase error occurs
    this.http.on("error", (err) => {
      console.error("Server error:", err);
    });
    let player_list = {};
    // create new Players
    player_list[0] = new Player(0);
    player_list[1] = new Player(1);
    this.setUpListeners(player_list);
    
  }
  
  setUpListeners = (player_list) => {
    let users = [];
    let clients = 0;
    let teams = [];
    let shots = [];
    let humanBot_list = [];
    for (let i = 1; i <= 3; i++){
      let bot = new HumanBot(player_list);
      //for(let j = 0; j < humanBot_list.length; j++){
        bot.collisionDetectionHumanBot(humanBot_list);
      //
      humanBot_list.push(bot);
    }
    console.log("Botliste:", humanBot_list);
    // each player has an ID: connectionNumber
    let connectionNumber = 0;
    let possibleConnectionIds = [0,1];
    let socket_list = {};
    this.io.on(
      "connection",
      function (socket) {
        // store player in socket_list
        socket_list[connectionNumber] = socket;
        console.log("Player Connected!");
        // send ID to player
        socket.emit("welcome Player", {
          player: connectionNumber,
        });
        connectionNumber++;
        clients++;
        // Event: a new client connected
        socket.emit("newclientconnect", { description: "Hey, welcome!" });
        socket.broadcast.emit("newclientconnect", {
          description: clients + " clients connected!",
        });
        socket.on(
          "setUsername",
          function (data) {
            if (users.length <= 1) {
              //indexOf method returns the first index at which a given element can be found in the array, or -1 if it is not present
              if (users.indexOf(data) > -1) {
                socket.emit(
                  "userExists",
                  data + " username is taken! Try some other username."
                );
              } else {
                users.push(data);
              }
            } else {
              this.io.emit("too many clients", {
                description:
                  "Sorry! There are already two players conneted! Please try again later",
              });
              this.io.emit();
            }
            socket.on(
              "setTeamCorona",
              function (data) {
                // check if team is already chosen
                if (teams.indexOf("Corona") > -1) {
                  console.log(teams);
                  socket.emit(
                    "WrongTeamChosen",
                    data + "Sorry, this team is already taken."
                  );
                } else {
                  teams.push("Corona");
                  // add Team to Player
                  player_list[connectionNumber-1].team = "Corona";
                  socket.emit("userSet", { username: data});
                }
              }.bind(this)
            );
            socket.on(
              "setTeamHuman",
              function (data) {
                // check if team is already chosen
                if (teams.indexOf("Human") > -1) {
                  console.log(teams);
                  socket.emit(
                    "WrongTeamChosen",
                    data + "Sorry, this team is already taken."
                  );
                } else {
                  teams.push("Human");
                  // add Team to Player
                  player_list[connectionNumber-1].team = "Human";
                  socket.emit("userSet", { username: data});
                }
              }.bind(this)
            );
          }.bind(this)
        );
        //handle event from client
        socket.on(
          "clientEvent",
          function (data) {
            console.log(data);
          }.bind(this)
        );

        socket.on("msg", function (data) {
          //Send message to everyone
          this.io.sockets.emit("newmsg", data);
        }.bind(this));

        socket.on(
          "keyPress",
          function (data) {
            // update the player position
            this.currentPlayer = player_list[data.playerID];
            if (data.inputId === "left") this.currentPlayer.pressingLeft = true;
            if (data.inputId === "right") this.currentPlayer.pressingRight = true;
            if (data.inputId === "up") this.currentPlayer.pressingUp = true;
            if (data.inputId === "down")this.currentPlayer.pressingDown = true;
          }.bind(this)
        );

        socket.on(
          "keyPressNot",
          function (data) {
            // update the player position
            this.currentPlayer = player_list[data.playerID];
            if (data.inputId === "left") this.currentPlayer.pressingLeft = false;
            if (data.inputId === "right") this.currentPlayer.pressingRight = false;
            if (data.inputId === "up") this.currentPlayer.pressingUp = false;
            if (data.inputId === "down")this.currentPlayer.pressingDown = false;
          }.bind(this)
        );

        socket.on(
          "mouseClick",
          function (data) {
            var Shot = require('./shot.js');
            let cP = player_list[data.playerID];
            shots.push(new Shot(cP.id, cP.x, cP.y, data.mouseX, data.mouseY, data.cellSize));
          }.bind(this)
        );

        socket.on(
          "disconnect",
          function () {
            this.io.emit("user leave", { for: "everyone" });
            console.log("Player Disconnected!");
            clients--;
            socket.broadcast.emit("newclientconnect", {
              description: clients + " clients connected!",
            });
            // To be refactored!
            // delete socket_list[socket.id];
            // delete player_list[socket.id];
          }.bind(this)
        );
      }.bind(this)
    );
    this.setUpGameLoop(player_list, socket_list, shots, humanBot_list);
  };

  setUpGameLoop = (player_list, socket_list, shots, humanBot_list) => {
    setInterval(function () {
      //will contain information about every single player and will be send to every player connected
      let pack = [];
      for (let i in player_list) {
        var player = player_list[i];
        player.updatePosition();
        for (let j=0; j<shots.length; j++){
          if (shots[j].collisionDetection(900, 520)){
            shots[j].updateInterface();
          } 
          else{shots.splice(j,1)}
        }; 

        for(let k = 0; k < humanBot_list.length; k++){
          humanBot_list[k].move();
        }
        //console.log("Liste:", humanBot_list);

        pack.push({
          x: player.x,
          y: player.y,
          team: player.team, 
          shots: shots,
          bots: humanBot_list,
        });
      }
      for (var i in socket_list) {
        var socket = socket_list[i];
        socket.emit("newPositions", pack);
      }
    }, 50);
  };
}

const server = new Server();