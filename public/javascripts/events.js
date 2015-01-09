define([], function() {
	return {
		init: function() {
			this.connect();
			this.setEvents();
		},

		setEvents: function() {
			var delta = 1;
			console.log("IOEvents init");

			if (window.realtime.socketIo) {
			
				window.realtime.socketIo.on('move_up', function() {
					// Give a nice round-trip ACK to our realtime server that we connected.
		    		console.log("receive move_up");
		    		sphere.position.y += 10 * delta;
		  		});
		  		
		  		window.realtime.socketIo.on('move_down', function() {
					// Give a nice round-trip ACK to our realtime server that we connected.
		    		console.log("receive move_down");
		    		sphere.position.y -= 10 * delta;
		  		});

		  		window.realtime.socketIo.on('move_left', function() {
					// Give a nice round-trip ACK to our realtime server that we connected.
		    		console.log("receive move_left");
		    		sphere.position.x -= 10 * delta;
		  		});

		  		window.realtime.socketIo.on('move_right', function() {
					// Give a nice round-trip ACK to our realtime server that we connected.
		    		console.log("receive move_right");
		    		sphere.position.x += 10 * delta;
		  		});
			}
		},

		connect: function() {
			if (typeof io != 'undefined' && io != null) {
				window.realtime.token = '291c8816b32d71664f45c3e2278967dc';
				window.realtime.userId = '';
				window.realtime.socketIo = io.connect('http://0.0.0.0:5001/?_rtUserId=server&_rtToken=291c8816b32d71664f45c3e2278967dc');
			}

			if (window.realtime.socketIo) {
			
				window.realtime.enabled = true;

				window.realtime.socketIo.on('connect', function() {
					// Give a nice round-trip ACK to our realtime server that we connected.
		    		window.realtime.socketIo.emit('realtime_user_id_connected');
		    		console.log("connect");
		  		});

				window.realtime.socketIo.on('realtime_user_id_connected',function(message){
		    		console.log("user_id:"+message.user_id);
		    	});

		  		window.realtime.socketIo.on('disconnect', function() {
					// Give a nice round-trip ACK to our realtime server that we connected.
		    		console.log("disconnect");
		  		});

			}

		}
	}
		
});