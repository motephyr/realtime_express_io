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

                io.to(socket.id).emit('realtime_user_id_connected',{"user_id": currentSocketIoUserId});
                io.to(client_id["server"]).emit('realtime_user_id_connected',{"user_id": currentSocketIoUserId})
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


            socket.on('disconnect', function(message) {
                io.to(client_id["server"]).emit('disconnect',{"user_id": currentSocketIoUserId})
                delete client_id[currentSocketIoUserId];
            });

        });

return io;
},

authorize: function authorize(io,uuid) {
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
