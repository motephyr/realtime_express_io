define([], function() {
	EVENTS = {
		init: function(createPlayer, destroyPlayer, eventCallback, messageCallback) {
			this.connect(createPlayer, destroyPlayer, eventCallback);
			this.messages(messageCallback);
			//this.setEvents(eventCallback);
		},

		setEvents: function(eventCallback) {
			
			var delta = 1;
			console.log("IOEvents init");

			if (window.realtime.socketIo) {
			
				window.realtime.socketIo.on('move_up_keydown', function(message) {
					console.log(message.user_id);
					eventCallback(message.user_id, 38, true);
		    		//console.log("receive move_up_keydown");
		  		});
		  		window.realtime.socketIo.on('move_up_keyup', function(message) {
		  			eventCallback(message.user_id, 38, false);
		    		//console.log("receive move_up_keyup");
		  		});
		  		
		  		window.realtime.socketIo.on('move_down_keydown', function(message) {
		  			eventCallback(message.user_id, 40, true);
		    		//console.log("receive move_down_keydown");
		  		});
		  		window.realtime.socketIo.on('move_down_keyup', function(message) {
		  			eventCallback(message.user_id, 40, false);
		    		//console.log("receive move_down_keyup");
		  		});

		  		window.realtime.socketIo.on('move_left_keydown', function(message) {
		  			eventCallback(message.user_id, 37, true);
		    		//console.log("receive move_left_keydown");
		  		});
		  		window.realtime.socketIo.on('move_left_keyup', function(message) {
		  			eventCallback(message.user_id, 37, false);
		    		//console.log("receive move_left_keyup");
		  		});

		  		window.realtime.socketIo.on('move_right_keydown', function(message) {
		  			eventCallback(message.user_id, 39, true);
		    		//console.log("receive move_right_keydown");
		  		});
		  		window.realtime.socketIo.on('move_right_keyup', function(message) {
		  			eventCallback(message.user_id, 39, false);
		    		//console.log("receive move_right_keyup");
		  		});
			}
		},

		connect: function(createPlayer, destroyPlayer, eventRegister) {
			if (typeof io != 'undefined' && io != null) {
				window.realtime.token = '291c8816b32d71664f45c3e2278967dc';
				window.realtime.userId = '';

				window.realtime.socketIo = io.connect('http://0.0.0.0:5001/?_rtUserId=server&_rtToken='+window.realtime.token);
			}

			if (window.realtime.socketIo) {
			
				window.realtime.enabled = true;

				window.realtime.socketIo.on('connect', function() {
					// Give a nice round-trip ACK to our realtime server that we connected.
		    		window.realtime.socketIo.emit('realtime_user_id_connected');
		    		console.log("connect");
		  		});

				window.realtime.socketIo.on('realtime_user_id_connected',function(message){
					if (message.user_id == 'server') return;
		    		console.log("User " + message.user_id + " connected.");
		    		
		    		// add player to gamers list...
		    		createPlayer(message.user_id);
		    		
		    	});

		  		window.realtime.socketIo.on('disconnect', function(message) {
					// Give a nice round-trip ACK to our realtime server that we connected.

		    		console.log("User " + message.user_id + " disconnected.");
		    		destroyPlayer(message.user_id);
		    		
		  		});

			}

		},

		messages: function(messageCallback) {
			window.realtime.socketIo.on('send_message', function(message) {
		  			console.log(message.user_id);
		  			console.log(message.saying);
		  			messageCallback(message);
		  	});
		}
	};

	return EVENTS;
		
});