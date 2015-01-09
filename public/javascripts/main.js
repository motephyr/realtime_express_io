requirejs.config({
	paths: {
		jquery: '/js/jquery.min',
		three: '/js/three.min',
		ioevents: '/js/events',
		parallax: '/js/parallax.min'
	},
	shim: {
		'parallax' : {
			exports: 'Parallax'
		}
	}
});

requirejs(['jquery',
		   'ioevents', 
		   'background', 
		   'three',
		   '/bower_components/threex/src/threex.minecraft/package.require.js',
		   '/js/THREEx.KeyboardState.js'], function($, ioevents) {

		
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
		
		camera.position.set(0, 1, 3);
		camera.lookAt( new THREE.Vector3(0, 2, -10) );

		//////////////////////////////////////////////////////////////////////////////////
		//		comment								//
		//////////////////////////////////////////////////////////////////////////////////

		var player	= new THREEx.MinecraftPlayer();
		//player.character.root.position.y = -3;
		
		
		scene.add(player.character.root);

		updateFcts.push(function(delta, now){
			player.update(delta, now)
		});
		
		// load a well known skin
		player.character.loadWellKnownSkin('joker');
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
			doKeyActions.call(player.controls.input, event.keyCode, event.shiftKey, true);
		})
		document.body.addEventListener('keyup', function(event){
			doKeyActions.call(player.controls.input, event.keyCode, event.shiftKey, false);
		})

		ioevents.init((function(obj, callback){
			return function(key, isKeydown){
				callback.call(obj.controls.input, key, false, isKeydown);
			};
		})(player, doKeyActions));
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