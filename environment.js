module.exports = {

    loadSocketIo: function() {

        var fourUserConnectionState = [false,false,false,false];
        var setCurrentSocketIoUserId = function(){
            for (var i = 0; i < fourUserConnectionState.length; i++){
                if (fourUserConnectionState[i] === false){
                    fourUserConnectionState[i] = true;
                    return i;
                }
            }
            return null;
        };

        var client_id = {};

        var port = process.env.PORT || 5001;
        if (process.env.NODE_ENV != 'production') {
            port = 5001; // run on a different port when in non-production mode.
        }

        console.log('STARTING ON PORT: ' + port);

        var io = require('socket.io').listen(Number(port));

        var map = new (require('./app/snake/map.js'))(io);

        map.startAutoMoving({
            afterEachMove: function() { io.to(client_id["server"]).emit('redraw', map.toString()) }
        });

        io.on('connection', function(socket) {
            console.log(socket.request.session);
            var currentSocketIoUserId = socket.request.session['user_id'];

            socket.on('realtime_user_id_connected', function(message) {
                console.log('Realtime User ID connected: ' + currentSocketIoUserId);
                if (!client_id[currentSocketIoUserId]){
                    client_id[currentSocketIoUserId] = [];
                }
                client_id[currentSocketIoUserId].push(socket.id);
                if (currentSocketIoUserId !== 'server'){
                    client_id[currentSocketIoUserId].serial = setCurrentSocketIoUserId();
                }
                var mid = null;
                if(message){
                    mid = message['model_id'];
                }
                
                io.to(socket.id).emit('realtime_user_id_connected',{"user_id": currentSocketIoUserId, "model_id":mid});
                io.to(client_id["server"]).emit('realtime_user_id_connected',{"user_id": currentSocketIoUserId, "model_id":mid});
            });
            (function loadSnack(){
                var Snake = require('./app/snake/snake.js');

                socket.on('start', function(name){

                // Setup snake and attach to users scope through sockets.
                socket.snake = new Snake(name);
                map.placeSnake(socket.snake);

                map.placeFood();

                // Broadcast sends message to everyone but the current user.
                io.to(client_id["server"]).emit('announce', socket.snake.name + ' entered');

                socket.on('disconnect', function() {
                    socket.snake.character = "X";
                    socket.snake.zombie = false;
                    socket.snake.alive = false;
                    io.to(client_id["server"]).emit('announce', socket.snake.name+" left the game and became a corpse!");
                });

            });
                socket.on('move', function(key) {
                    var movement = {
                        'left': {x: -1, y: 0},
                        'up':   {x: 0, y: -1},
                        'right':{x: 1, y: 0},
                        'down': {x: 0, y: 1}
                    }[key];


                    if (socket.snake !== undefined && movement !== undefined) {
                        if(socket.snake.alive){
                            socket.snake.lastDirection = movement; // Remember last movement for automover
                            map.moveSnake(socket.snake, movement);
                        };
                    } else {
                        console.log("movement triggered, but don't have stuff");
                    };

                    io.to(client_id["server"]).emit('redraw', map.toString());

                });
            })();

            (function loadWrite(){
                socket.on('move_location', function(e){
                //io.sockets.emit('move_location',e);
                e.user_id = client_id[currentSocketIoUserId].serial + 1;
                io.to(socket.id).emit('move_location',e);
                io.to(client_id["server"]).emit('move_location',e);
            });

                socket.on('down_location', function(e){
                //io.sockets.emit('down_location',e);
                e.user_id = client_id[currentSocketIoUserId].serial + 1;
                io.to(socket.id).emit('down_location',e);
                io.to(client_id["server"]).emit('down_location',e);
            });

                socket.on('up_location', function(){   
                //io.sockets.emit('up_location');
                io.to(socket.id).emit('up_location');
                io.to(client_id["server"]).emit('up_location');
            });

                socket.on('clear', function(){
                //io.sockets.emit('clear');
                var e = {};
                e.user_id = client_id[currentSocketIoUserId].serial + 1;
                io.to(socket.id).emit('clear');
                io.to(client_id["server"]).emit('clear',e);
            });
            })();

            (function loadLavitrine() {

                socket.on('style_change', function(message){
                    var mid = null;
                    if(message){
                        mid = message['model_id'];
                    }
                    io.to(client_id["server"]).emit('style_change',{"user_id": currentSocketIoUserId, "model_id":mid});
                });

                socket.on('move_left_keydown', function(){
                    io.to(client_id["server"]).emit('move_left_keydown',{"user_id": currentSocketIoUserId});
                });
                socket.on('move_right_keydown', function(){
                    io.to(client_id["server"]).emit('move_right_keydown',{"user_id": currentSocketIoUserId});
                });
                socket.on('move_up_keydown', function(){
                    io.to(client_id["server"]).emit('move_up_keydown',{"user_id": currentSocketIoUserId});
                });
                socket.on('move_down_keydown', function(){
                    io.to(client_id["server"]).emit('move_down_keydown',{"user_id": currentSocketIoUserId});
                });
                socket.on('move_left_keyup', function(){
                    io.to(client_id["server"]).emit('move_left_keyup',{"user_id": currentSocketIoUserId});
                });
                socket.on('move_right_keyup', function(){
                    io.to(client_id["server"]).emit('move_right_keyup',{"user_id": currentSocketIoUserId});
                });
                socket.on('move_up_keyup', function(){
                    io.to(client_id["server"]).emit('move_up_keyup',{"user_id": currentSocketIoUserId});
                });
                socket.on('move_down_keyup', function(){
                    io.to(client_id["server"]).emit('move_down_keyup',{"user_id": currentSocketIoUserId});
                });

                socket.on('send_message', function(message){
                    message.user_id = currentSocketIoUserId;
                    io.to(client_id["server"]).emit('send_message',message);
                });

            })();


            socket.on('disconnect', function(message) {
                io.to(client_id["server"]).emit('disconnect',{"user_id": currentSocketIoUserId})
                fourUserConnectionState[client_id[currentSocketIoUserId].serial] = false;
                delete client_id[currentSocketIoUserId];
            });

        });

return io;
}
,

authorize: function(io,uuid) {
    io.use(function(socket, next) {

        var sessionId = null;
        var userId = null;

        var url = require('url');
        requestUrl = url.parse(socket.request.url);
        requestQuery = requestUrl.query;
        requestParams = requestQuery.split('&');
        params = {};
        for (i=0; i<=requestParams.length; i++){
            param = requestParams[i];
            if (param){
                var p=param.split('=');
                if (p.length != 2) { continue };
                params[p[0]] = p[1];
            }
        }

        sessionId = params["_rtToken"];
        userId = params["_rtUserId"];
        if (userId == "server"){
            socket.request.session = {"user_id": userId};
        }else{
            socket.request.session = {"user_id": uuid.v4()};
        }
        next();
    });
},
}
