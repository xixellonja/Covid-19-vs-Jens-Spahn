var socket = io();
var user;
var number;


class Client {
  constructor() {
    this.setUpListeners = () => {
      this.setUpUserConnection();
    };
    this.setUpListeners();
    this.setUpKeyHandler();
    //this.setUpMouseHandler();
  }

  setUpUserConnection = () => {
    socket.on("welcome Player", function (data) {
      //document.getElementById("error-container").innerHTML = data.description
      number = data.player;
    }.bind(this));
    socket.on("newclientconnect", function (data) {
      document.getElementById("error-container").innerHTML = data.description;
    }.bind(this));
    socket.on("user leave", function (msg) {
      $("#messages").append(
        $('<li class="user-left">').text("User left server")
      );
    }.bind(this));
  };
  
  setUpCanvas = () => {
    let canvas = document.getElementById("myCanvas");
    let context = canvas.getContext("2d");
    let extent = 20;
    let cellSize = canvas.width / extent;
    this.drawCanvas(canvas, context, extent, cellSize);
    this.setUpGameLoopListener(canvas, context, extent, cellSize);
    this.setUpMouseHandler(canvas, cellSize);
  };
  
  drawCanvas = (canvas, context, extent, cellSize) => {
    this.drawGrid(canvas, context, extent, cellSize);
  };
  
  drawGrid = (canvas, context, extent, cellSize) => {
    for (let i = 0; i < extent; i++) {
      this.drawLine(0, i * cellSize, canvas.width, i * cellSize, context);
      this.drawLine(i * cellSize, 0, i * cellSize, i * canvas.height, context);
    }
  };
  
  drawLine = (x1, y1, x2, y2, context) => {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  };
  
  setUpGameLoopListener = (canvas, context, extent, cellSize) => {
    socket.on("newPositions", function (data) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      this.drawGrid(canvas, context, extent, cellSize);
      for (var i = 0; i < data.length; i++) {
        if(data[i].team === "Corona"){
          context.fillStyle = "orange";
        } else { 
          context.fillStyle = "blue";
        }
        context.fillRect(data[i].x, data[i].y, cellSize, cellSize);

        // Shots
        for (let j=0; j<data[i].shots.length; j++){
          context.fillRect(data[i].shots[j].x, data[i].shots[j].y, cellSize/2, cellSize/2);
        };

        
        for (let k=0; k < data[i].bots.length; k++){
          context.fillStyle = 'red';
          context.fillRect(data[i].bots[k].x, data[i].bots[k].y, cellSize/2, cellSize/2);
        }

      }
    }.bind(this));
  };

  setUpKeyHandler = () => {
    console.log("Key")
    document.onkeydown = function (event) {
      var pressedKey = event.code;
      // send player ID and pressed Key
      if (pressedKey === "ArrowLeft") {
        socket.emit("keyPress", {inputId: "left", playerID: number});
      }
      if (pressedKey === "ArrowDown") {
        socket.emit("keyPress", {inputId: "down", playerID: number });
      }
      if (pressedKey === "ArrowUp") {
        socket.emit("keyPress", {inputId: "up", playerID: number});
      }
      if (pressedKey === "ArrowRight") {
        socket.emit("keyPress", {inputId: "right", playerID: number});
      }
    };
    document.onkeyup = function (event) {
      console.log("Key2")
      // send player ID and pressed Key
      var pressedKey = event.code;
      if (pressedKey === "ArrowLeft") {
        socket.emit("keyPressNot", { inputId: "left", playerID: number });}
      if (pressedKey === "ArrowDown") {
        socket.emit("keyPressNot", { inputId: "down", playerID: number });
      }
      if (pressedKey === "ArrowUp") {
        socket.emit("keyPressNot", { inputId: "up", playerID: number });
      }
      if (pressedKey === "ArrowRight") {
        socket.emit("keyPressNot", { inputId: "right", playerID: number });
      }
    };
  };

  setUpMouseHandler = (canvas, cellSize) => {
    //this.canvas = document.getElementById("myCanvas");
    canvas.addEventListener('mousedown', function(e) {
      const rect = document.getElementById("myCanvas").getBoundingClientRect()
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      socket.emit("mouseClick", { mouseX: x, mouseY: y, playerID: number, cellSize: cellSize });
    })
  }
}


function setTeamAndUserName(){
  socket.emit("setUsername", document.getElementById("name").value);
  if (document.getElementById("TeamCorona").checked) {
    socket.emit("setTeamCorona", document.getElementById("TeamCorona").value);
  }
  if (document.getElementById("TeamHuman").checked) {
    socket.emit("setTeamHuman", document.getElementById("TeamHuman").value);
  }
  handleInvalideUserinputs();
  socket.on("userSet", function (data) {
    user = data.username;
    document.body.innerHTML =
      '<canvas id="myCanvas" width="960" height="560"></canvas>\
        <p><input type = "text" id = "message">\
        <button type = "button" name = "button" onclick = "sendChatMessages()">Send</button>\
        <div id = "message-container"></div><\p>';
    game.setUpCanvas()
  });

};

function sendChatMessages(){
  var msg = document.getElementById("message").value;
  if (msg) {
    socket.emit("msg", { message: msg, user: user });
  }
  socket.on("newmsg", function (data) {
    if (user) {
      document.getElementById("message-container").innerHTML +=
        "<p><div><b>" + data.user + "</b>: " + data.message + "</div><\p>";
    }
  });
};

function handleInvalideUserinputs(){
  socket.on("userExists", function (data) {
    document.getElementById("error-container").innerHTML = data;
  });
  socket.on("too many clients", function (data) {
    document.getElementById("error-container").innerHTML = data.description;
  });
  socket.on("WrongTeamChosen", function (data) {
    document.getElementById("error-container").innerHTML = data;
  });
};

const game = new Client()
