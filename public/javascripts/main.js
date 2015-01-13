requirejs.config({
	paths: {
		jquery: '/js/jquery.min',
		three: '/js/three.min',
		ioevents: '/js/events',
		parallax: '/js/parallax.min',
		gamers: '/js/gamers'
	},
	shim: {
		'parallax' : {
			exports: 'Parallax'
		}
	}
});

requirejs(['jquery',
		   'ioevents',
		   'gamers', 
		   'background', 
		   'three',
		   '/bower_components/threex/src/threex.minecraft/package.require.js',
		   '/bower_components/threex.text/package.require.js',
		   '/js/THREEx.KeyboardState.js'], function($, ioevents, Gamers) {

		//ioevents.init();
		var gamers = new Gamers();
		
		for(var i=0; i < 3; i++) {
			gamers.push(i);
		}

		$(document.body).height($(window).height());
		var $container = $('#canvas-wrap');

		var WIDTH = $container.width(), 
			HEIGHT = $container.height();
		// camera attributes
		var VIEW_ANGLE = 45,
			ASPECT = WIDTH / HEIGHT,
			NEAR = 0.1,
			FAR = 100;

		var renderer	= new THREE.WebGLRenderer( { alpha: true } );
		renderer.setSize( WIDTH, HEIGHT );
		//renderer.setSize(WIDTH, HEIGHT);

		var camera = 
			new THREE.PerspectiveCamera(
				VIEW_ANGLE,
				ASPECT,
				NEAR,
				FAR );


		$container.append(renderer.domElement);

		var updateFcts	= [];
		var scene	= new THREE.Scene();
		
		camera.position.set(0, 2, 12);
		camera.lookAt( new THREE.Vector3(0, -2, -10) );


		littleMen = [];

		function createLittleMan(user_id) {
			var player	= new THREEx.MinecraftPlayer();
			scene.add(player.character.root);
			updateFcts.push(function(delta, now){
				player.update(delta, now);
			});
			player.character.root.position.x = (Math.random() - 0.5) * 3;
			//player.character.root.position.y = (Math.random() - 0.5) * 2;
			player.character.root.position.z = (Math.random() - 0.5) * 10;


			player.character.loadWellKnownSkin('agentsmith');
			player.setNickname(user_id);

			gamers.push(user_id, player);
			document.body.addEventListener('keydown', function(event){
				doKeyActions.call(player.controls.input, event.keyCode, event.shiftKey, true);
				console.log('key:'+event.keyCode+' press down');
			});

			document.body.addEventListener('keyup', function(event){
				doKeyActions.call(player.controls.input, event.keyCode, event.shiftKey, false);
			});
			
			EVENTS.setEvents( function(key, isKeydown) {
    			doKeyActions.call(player.controls.input, key, false, isKeydown);
    		});
			//var sprite=createTextSprite('Name', player.character.root.position);
			//player.add(sprite);
			return player;
		}

		function destroyLittleMan(user_id) {
			var plyr = gamers.get(user_id);
			if (!plyr) return;
			scene.remove(plyr.character.root);
			gamers.remove(user_id);
			console.log('destroyLittleman');
			console.log(scene);
		}

		function littleManMessages(message) {
			var player = gamers.get(message.user_id);
			if (!player) return;
			player.setNickname(message.nickname);
		}

		gamers.all().forEach( function(g) {
			littleMen.push(createLittleMan());
		});
		
		player1 = littleMen[0];
		player2 = littleMen[1];
		
		player1.setSay('你好, 我叫小丑!');
		player2.setSay('我也叫小丑!')

		
		//////////////////////////////////////////////////////////////////////////////////
		//		controls.input based on keyboard				//
		//////////////////////////////////////////////////////////////////////////////////

		var doKeyActions = function(key, shift, isKeydown){
			var input = this;
			if( key === 'W'.charCodeAt(0) )	input.up	= isKeydown;
			if( key === 'S'.charCodeAt(0) )	input.down	= isKeydown;
			if( key === 'A'.charCodeAt(0) )	input.left	= isKeydown;
			if( key === 'D'.charCodeAt(0) )	input.right	= isKeydown;
			if( key === 'Q'.charCodeAt(0) )	input.strafeLeft= isKeydown;
			if( key === 'E'.charCodeAt(0) )	input.strafeRight= isKeydown;

			// to support arrows because tsate asked me :)
			if( key === 38 )			input.up	= isKeydown;
			if( key === 40 )			input.down	= isKeydown;
			if( key === 37 && !shift )	input.left	= isKeydown;
			if( key === 39 && !shift )	input.right	= isKeydown;
			if( key === 37 &&  shift )	input.strafeLeft= isKeydown;
			if( key === 39 &&  shift )	input.strafeRight= isKeydown;
		};


		document.body.addEventListener('keydown', function(event){
			littleMen.forEach(function(lm) {
				doKeyActions.call(lm.controls.input, event.keyCode, event.shiftKey, true);
			});
			console.log('key:'+event.keyCode+' press down');
		});

		document.body.addEventListener('keyup', function(event){
			littleMen.forEach(function(lm) {
				doKeyActions.call(lm.controls.input, event.keyCode, event.shiftKey, false);
			});
		});

		ioevents.init(createLittleMan, 
					  destroyLittleMan, 
					  doKeyActions,
					  littleManMessages);
		/*
		ioevents.init(gamers, createLittleMan, (function(obj, callback){
			return function(key, isKeydown){
				obj.forEach(
					(function(cb){
						return function(lm){
							cb.call(lm.controls.input, key, false, isKeydown);
						};
					})(callback)
				);
			};
		})(littleMen, doKeyActions));
		*/
		//////////////////////////////////////////////////////////////////////////////////
		//		render the scene						//
		//////////////////////////////////////////////////////////////////////////////////
		updateFcts.push(function(){
			renderer.render( scene, camera );
		})

		//////////////////////////////////////////////////////////////////////////////////
		//		loop runner							//
		//////////////////////////////////////////////////////////////////////////////////
		var lastTimeMsec= null
		requestAnimationFrame(function animate(nowMsec){
			// keep looping
			requestAnimationFrame( animate );
			// measure time
			lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
			var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
			lastTimeMsec	= nowMsec
			// call each update function
			updateFcts.forEach(function(updateFn){
				updateFn(deltaMsec/1000, nowMsec/1000)
				});
		});

		// DOM Events
		$(window).resize(function() {
			$(document.body).height($(window).height());
			renderer.setSize( $(window).width(), $(window).height());
		});

});