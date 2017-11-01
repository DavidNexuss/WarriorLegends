var express = require('express');
var app = express();
var http = require('http').Server(app);

var io = require('socket.io')(http);


class Player{

    constructor(socket){

        this.socket = socket        // Socket
        this.gyro = false

        this.game = null

        this.angle = []

    }

    hookControl(){

        this.socket.on('angle',function(msg){

            this.angle[0] = msg[0]
            this.angle[1] = msg[1]
            this.angle[2] = msg[2]
        })

    }

}
var players = []                    //-- Player

class Game{
    
    
    constructor(id,PC){             //Game ID and PC socket         --String, Socket

        this.id = id                //GAME ID                       -- String
        this.PC = PC                //PC Socket                     -- Socket

        this.Player0 = null         //PLAYER 0                      -- Player
        this.Player1 = null         //PLAYER 1                      -- Player
        
        this.hasPlayer0 = false
        this.hasPlayer1 = false

        this.Owner = null           //OWNER                         -- Socket

        this.isFull = false

        this.isStarted = false
    }

    startGame(){

        var usingGyro = true

        if(!this.Player0.gyro || !this.Player1.gyro) this.usingGyro = false

        var Options = {

            'gyro' : this.usingGyro
        }
        this.Player0.socket.emit('starting',Options)
        this.Player1.socket.emit('starting',Options)

        this.Player0.hookControl()
        this.Player1.hookControl()

        this.PC.emit('starting',Options)

        console.log('#Game has started')

        this.isStarted = true
    }
    testFull(){

        if(this.hasPlayer0) updateGameState(this.id,this.Player0.socket)
        if(this.hasPlayer1) updateGameState(this.id,this.Player1.socket)
        updateGameState(this.id,this.PC)

        if(this.hasPlayer0 && this.hasPlayer1){

            this.isFull = true
            console.log('#Game ' + this.id + ' is now full, game is about to start')
            this.startGame()
        }


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

        console.log('Trying to put a new player0 in game: ' + this.id)
        if(!this.hasPlayer0){

            this.Player0 = player
            this.hasPlayer0 = true

            this.game = this

            players.push(player)

            this.testFull()
        }else{

            console.log('Attempt to be an already chosed player')
        }

        
    }
    setPlayer1(player){             //PLAYER            --Player             

        console.log('Trying to put a new player1 in game: ' + this.id)
        if(!this.hasPlayer1){

            this.Player1 = player
            this.hasPlayer1 = true

            this.game = this

            players.push(player)

            this.testFull()
        }else{

            console.log('Attempt to be an already chosed player')
            
        }

        
    }

   
    
    
}

var PC = 0
var Phone = 1

var Games = {}

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

function updataGameList(socket){

    var gamelist = []
    for(let game of Object.keys(Games).map(key => Games[key])){

        gamelist.push({

            'id': game.id,
            'player0' : game.hasPlayer0,
            'player1': game.hasPlayer1,
            'isStarted' : game.isStarted    
        })
    }

    
    socket.emit('gamelist',gamelist)
}
io.on('connection',function(socket){

    socket.on('getstate',function(msg){                //Sends Game state by a given id

        updateGameState(msg,socket)
        
    })

    socket.on('getgamelist',function(msg){

        updataGameList(socket)
    })
    socket.on('type',function(msg){

        if(msg == PC){

            socket.on('createGame',function(msg){

                Games[msg] = new Game(msg,socket)
                console.log('New Game has been created! : ' + msg)
            })
        }else{

            
            socket.on('connectGame',function(msg){

                var hack = false

                for(let el of players){

                    if(el.socket === socket) hack = true
                }

                if(hack){

                    console.log('Someone has attempt to be both players from one device!')
                    return;
                }
                var game = Games[msg['id']] //The desired game
                
                if(game != null){

                    var player = new Player(socket) //The Player object
                    player.gyro = msg['gyro']

                    console.log(msg['player'])
                    
                    if(msg['player'] === 0) game.setPlayer0(player)
                    if(msg['player'] === 1) game.setPlayer1(player)

                    


                }else{

                    console.log('Attempt to connect to a null game: ' + msg)
                }
            })
        }
    })
})
app.get('/', function(req, res){

        res.sendFile(__dirname + "/client/client-pc.html")
});

app.get('/phone', function(req, res){
    
        res.sendFile(__dirname + "/client/client-phone.html")
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static('client'))

http.listen(app.get('port'), function(){
  console.log('listening on *:' + app.get('port'));
});