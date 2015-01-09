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

		ioevents.init();
		var gamers = new Gamers();
		
		for(var i=0; i < 30; i++) {
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

		function LittleMan() {
			var player	= new THREEx.MinecraftPlayer();
			scene.add(player.character.root);
			updateFcts.push(function(delta, now){
				player.update(delta, now);
			});
			player.character.root.position.x = (Math.random() - 0.5) * 3;
			//player.character.root.position.y = (Math.random() - 0.5) * 2;
			player.character.root.position.z = (Math.random() - 0.5) * 10;


			player.character.loadWellKnownSkin('agentsmith');
			player.setNickname('史密斯');
			//var sprite=createTextSprite('Name', player.character.root.position);
			//player.add(sprite);
			return player;
		}

		gamers.all().forEach( function(g) {
			littleMen.push(LittleMan());
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


		/////////////////////
		// add text
		/////////////////////
		function createTextSprite(msg, position) {
			var canvas1 = document.createElement('canvas');
			canvas1.width = 1000;
			canvas1.height = 1000;
			var context1 = canvas1.getContext('2d');
			context1.font = "Bold 100px Helvetica";
			context1.fillStyle = "rgba(255,0,0,0.95)";
			context1.fillText(msg, 0, 300);

		  	// canvas contents will be used for a texture
		  	var texture1 = new THREE.Texture(canvas1)
		    texture1.needsUpdate = true;
			var material = new THREE.SpriteMaterial( { map: texture1 } );	
			var sprite = new THREE.Sprite( material );
			sprite.scale.set( 1, 1, 1 );

			console.log(position);
			sprite.position.x = position.x + 0.2;
			sprite.position.y = position.y + 1.2;
			sprite.position.z = camera.position.z - 3;
			//scene.add(sprite);
			return sprite;
		}
		
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

		function Flow(){
		var self, stack = [], timerId = setTimeout(function(){ timerId = null; self._next(); }, 0);
		return self = {
			destroy : function(){ timerId && clearTimeout(timerId); },
			par	: function(callback, isSeq){
				if(isSeq || !(stack[stack.length-1] instanceof Array)) stack.push([]);
				stack[stack.length-1].push(callback);
				return self;
			},seq	: function(callback){ return self.par(callback, true);	},
			_next	: function(err, result){
				var errors = [], results = [], callbacks = stack.shift() || [], nbReturn = callbacks.length, isSeq = nbReturn == 1;
				for(var i = 0; i < callbacks.length; i++){
					(function(fct, index){
						fct(function(error, result){
							errors[index]	= error;
							results[index]	= result;		
							if(--nbReturn == 0)	self._next(isSeq?errors[0]:errors, isSeq?results[0]:results)
						}, err, result)
					})(callbacks[i], i);
				}
			}
		}
	};

});