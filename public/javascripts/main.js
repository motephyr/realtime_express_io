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

		ioevents.init();

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

		var player	= new THREEx.MinecraftPlayer()
		//player.character.root.position.y = -3;
		
		
		scene.add(player.character.root)

		updateFcts.push(function(delta, now){
			player.update(delta, now)
		})
		
		// load a well known skin
		player.character.loadWellKnownSkin('joker');
				//////////////////////////////////////////////////////////////////////////////////
		//		controls.input based on keyboard				//
		//////////////////////////////////////////////////////////////////////////////////

		document.body.addEventListener('keydown', function(event){
			var input	= player.controls.input
			if( event.keyCode === 'W'.charCodeAt(0) )	input.up	= true
			if( event.keyCode === 'S'.charCodeAt(0) )	input.down	= true
			if( event.keyCode === 'A'.charCodeAt(0) )	input.left	= true
			if( event.keyCode === 'D'.charCodeAt(0) )	input.right	= true
			if( event.keyCode === 'Q'.charCodeAt(0) )	input.strafeLeft= true
			if( event.keyCode === 'E'.charCodeAt(0) )	input.strafeRight= true

			// to support arrows because tsate asked me :)
			if( event.keyCode === 38 )			input.up	= true
			if( event.keyCode === 40 )			input.down	= true
			if( event.keyCode === 37 && !event.shiftKey )	input.left	= true
			if( event.keyCode === 39 && !event.shiftKey )	input.right	= true
			if( event.keyCode === 37 &&  event.shiftKey )	input.strafeLeft= true
			if( event.keyCode === 39 &&  event.shiftKey )	input.strafeRight= true
		})
		document.body.addEventListener('keyup', function(event){
			var input	= player.controls.input

			if( event.keyCode === 'W'.charCodeAt(0) )	input.up	= false
			if( event.keyCode === 'S'.charCodeAt(0) )	input.down	= false
			if( event.keyCode === 'A'.charCodeAt(0) )	input.left	= false
			if( event.keyCode === 'D'.charCodeAt(0) )	input.right	= false
			if( event.keyCode === 'Q'.charCodeAt(0) )	input.strafeLeft= false
			if( event.keyCode === 'E'.charCodeAt(0) )	input.strafeRight= false


			// to support arrows because tsate asked me :)
			if( event.keyCode === 38 )			input.up	= false
			if( event.keyCode === 40 )			input.down	= false
			if( event.keyCode === 37 ||  event.shiftKey )	input.left	= false
			if( event.keyCode === 39 ||  event.shiftKey )	input.right	= false
			if( event.keyCode === 37 || !event.shiftKey )	input.strafeLeft= false
			if( event.keyCode === 39 || !event.shiftKey )	input.strafeRight= false
		})


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