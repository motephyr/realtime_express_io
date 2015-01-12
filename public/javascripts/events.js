define([], function() {
	return {
		init: function(players, createPlayer, eventCallback) {
			this.connect(players, createPlayer);
			this.setEvents(eventCallback);
		},

		setEvents: function(eventCallback) {
			console.log(eventCallback);
			
			var delta = 1;
			console.log("IOEvents init");

			if (window.realtime.socketIo) {
			
				window.realtime.socketIo.on('move_up_keydown', function() {
					eventCallback(38, true);
		    		//console.log("receive move_up_keydown");
		  		});
		  		window.realtime.socketIo.on('move_up_keyup', function() {
		  			eventCallback(38, false);
		    		//console.log("receive move_up_keyup");
		  		});
		  		
		  		window.realtime.socketIo.on('move_down_keydown', function() {
		  			eventCallback(40, true);
		    		//console.log("receive move_down_keydown");
		  		});
		  		window.realtime.socketIo.on('move_down_keyup', function() {
		  			eventCallback(40, false);
		    		//console.log("receive move_down_keyup");
		  		});

		  		window.realtime.socketIo.on('move_left_keydown', function() {
		  			eventCallback(37, true);
		    		//console.log("receive move_left_keydown");
		  		});
		  		window.realtime.socketIo.on('move_left_keyup', function() {
		  			eventCallback(37, false);
		    		//console.log("receive move_left_keyup");
		  		});

		  		window.realtime.socketIo.on('move_right_keydown', function() {
		  			eventCallback(39, true);
		    		//console.log("receive move_right_keydown");
		  		});
		  		window.realtime.socketIo.on('move_right_keyup', function() {
		  			eventCallback(39, false);
		    		//console.log("receive move_right_keyup");
		  		});
			}
		},

		connect: function(players, createPlayer, destroyPlayer) {
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
		    		console.log("user_id:" + message.user_id);
		    		console.log(players);
		    		players.push(message.user_id);
		    		createPlayer(message.user_id);

		    	});

		  		window.realtime.socketIo.on('disconnect', function(message) {
					// Give a nice round-trip ACK to our realtime server that we connected.

		    		console.log("User " + message.user_id + "disconnected.");
		    		players.remove(message.user_id);
		  		});

			}

		}
	}
		
});