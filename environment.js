module.exports = {
    
    loadSocketIo: function loadSocketIo() {

        var client_id = {};

        var port = process.env.PORT || 5001;
        if (process.env.NODE_ENV != 'production') {
            port = 5001; // run on a different port when in non-production mode.
        }

        console.log('STARTING ON PORT: ' + port);

        var io = require('socket.io').listen(Number(port));

        io.on('connection', function(socket) {
            console.log(socket.request.session);
            var currentSocketIoUserId = socket.request.session['user_id'];

            socket.on('realtime_user_id_connected', function(message) {
                console.log('Realtime User ID connected: ' + currentSocketIoUserId);
                if (!client_id[currentSocketIoUserId]){
                    client_id[currentSocketIoUserId] = [];
                }
                client_id[currentSocketIoUserId].push(socket.id);
            });

            var emit_message = function(channel,message){
                // can't deliver a message to a socket with no handshake(session) established
                if (socket.request === undefined) {
                    return;
                }

                msg = JSON.parse(message);

                // if the recipient user id list is not part of the message
                // then define it anyways.

                if (!msg.recipient_user_ids) {
                    msg.recipient_user_ids = [];
                }

                if (msg.recipient_user_ids.indexOf(currentSocketIoUserId) != -1) {
                    delete msg.recipient_user_ids; //don't include this with the message
                    socket.emit('realtime_msg', msg);
                }
            }

            // redis.sub.on('message', function(channel, message) {
            //     emit_message(channel, message);
            // });

            var realtime_msg_callback = function(message){

                //emit_message('', message);
                msg = JSON.parse(message);
                for (var x in msg.recipient_user_ids){
                    io.to(client_id[msg.recipient_user_ids[x]]).emit('realtime_msg',msg)
                }
            }

            //socket.removeListener('realtime_msg', realtime_msg_callback);

            socket.on('realtime_msg',realtime_msg_callback);

            var down_location_callback = function(message){
                for (var x in client_id[message.user_id]){
                        io.to(client_id[message.user_id][x]).emit('down_location',message)
                }
            }

            socket.on('down_location',down_location_callback);

            var move_location_callback = function(message){
                for (var x in client_id[message.user_id]){
                        io.to(client_id[message.user_id][x]).emit('move_location',message)
                }
            }

            socket.on('move_location',move_location_callback);

            socket.on('move_left', function(){
                console.log("server receive move_left");
                socket.broadcast.emit('move_left');
            });
            socket.on('move_right', function(){
                console.log("server receive move_right");
                socket.broadcast.emit('move_right');
            });
            socket.on('move_up', function(){
                console.log("server receive move_up");
                socket.broadcast.emit('move_up');
            });
            socket.on('move_down', function(){
                console.log("server receive move_down");
                socket.broadcast.emit('move_down');
            });

            // socket.on('disconnect', function(message) {
            //     client_id[currentSocketIoUserId] = client_id[currentSocketIoUserId].filter(function(el){
            //         return el !== socket.id;
            //     })
            // });

        });

        return io;
    },

    authorize: function authorize(io) {
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
            socket.request.session = {"user_id": userId};
            next();
        });
    },
}
