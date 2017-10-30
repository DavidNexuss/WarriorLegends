var express = require('express');
var app = express();

var device = require('express-device');
var http = require('http').Server(app);

var io = require('socket.io')(http);


class Player{

    constructor(socket){

        this.socket = socket        // Socket
        this.gyro = false

        this.game = null

        this.x
        this.y
        this.z

    }

    hookControl(){

        socket.on('angle',function(msg){

            this.x = msg['x']
            this.y = msg['y']
            this.z = msg['z']
        })

    }

}
var players = []                    //-- Player

class Game{
    
    
    constructor(id){

        this.id = id                //GAME ID           -- String
        
        this.Player0 = null         //PLAYER 0          -- Player
        this.Player1 = null         //PLAYER 1          -- Player
        
        this.hasPlayer0 = false
        this.hasPlayer1 = false

        this.Owner = null           //OWNER             -- Socket

        this.isFull = false

        this.isStarted = false
    }

    disconnect(player){             //PLAYER            --Player

        if(player == Player0){

            this.Player0 = null
            this.isFull = false


        }
        if(player == Player1){

            this.Player1 = null
            this.isFull = false


        }
    }            
    setPlayer0(player){             //PLAYER            --Player

        if(!this.hasPlayer0){

            this.player0 = player
            this.hasPlayer0 = true

            this.game = this

            players.push(player)

            testFull()
        }

        
    }
    setPlayer1(player){             //PLAYER            --Player             

        if(!this.hasPlayer1){

            this.player1 = player
            this.hasPlayer1 = true

            this.game = this

            players.push(player)

            testFull()
        }

        
    }

    testFull(){

        if(hasPlayer0) updateGameState(player0.socket)
        if(hasPlayer1) updateGameState(player1.socket)

        updateGameState(PC)

        if(hasPlayer0 && hasPlayer1){

            isFull = true
            startGame()
        }


    }
    
    startGame(){

        var usingGyro = true

        if(!Player0.gyro || !Player1.gyro) usingGyro = false

        var Options = {

            'gyro' : usingGyro
        }
        Player0.socket.emit('starting',Options)
        Player1.socket.emit('starting',Options)

        Player0.hookControl()
        Player1.hookControl()

        PC.emit('starting',Options)




    }
}

var PC = 0
var Phone = 1

var Games = {}

app.use(device.capture());

io.on('disconnect',function(socket){

    var Player = null

    for(let el of players){

        if(n.socket === socket){

            Player = n
            n = null
            break;

        }
    }
    
    Player.game.disconnect(Player)
    Player = null

    console.log('A player has disconnected')
})

function updateGameState(id,socket){            //-- String, Socket

    if(Games[id] != null){

        var state = {

            'player0' : Games[id].hasPlayer0,
            'player1' : Games[id].hasPlayer1
        }

        socket.emit('state',state)
    }
}
io.on('connection',function(socket){

    socket.on('state',function(msg){                //Sends Game state by a given id

        updateGameState(msg,socket)
        
    })
    socket.on('type',function(msg){

        if(msg == PC){

            socket.on('createGame',function(msg){

                Games[msg] = new Game(msg)
            })
        }else{

            
            socket.on('connectGame',function(msg){

                var game = Games[msg['id']] //The desired game
                
                if(game != null){

                    var player = new Player(socket) //The Player object

                    if(msg['player'] = 0) game.setPlayer0(new Player(socket))
                    if(msg['player'] = 1) game.setPlayer1(new Player(socket))

                    player.gyro = msg['gyro']


                }else{

                    console.log('Attempt to connect to a null game: ' + msg)
                }
            })
        }
    })
})
app.get('/', function(req, res){
  
    if(req.device.type = "desktop")

        res.sendFile(__dirname + "/client/client-pc.html")
    else
        res.sendFile(__dirname + "/client/client-phone.html")   
  
});

app.use(express.static('client'))

http.listen(80, function(){
  console.log('listening on *:80');
});