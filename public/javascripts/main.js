requirejs.config({
	paths: {
		jquery: '/js/jquery.min',
		three: '/js/three.min',
		ioevents: '/js/events',
		parallax: '/js/parallax.min',
		gamers: '/js/gamers',
		datgui: '/bower_components/dat.gui/dat.gui',
		LittleMan3DPy: '/js/LittleMan3DPy'
	},
	shim: {
		'parallax' : {
			exports: 'Parallax'
		},
		'datgui': {
			exports: 'dat'
		}
	}
});

requirejs(['jquery',
		   'ioevents',
		   'gamers',
		   'datgui', 
		   'LittleMan3DPy',
		   'background', 
		   'three',
		   '/bower_components/threex/src/threex.minecraft/package.require.js',
		   '/bower_components/threex.text/package.require.js',
		   '/js/THREEx.KeyboardState.js'], function($, ioevents, Gamers, dat, LittleMan3DPy) {

		//ioevents.init();
		var gamers = new Gamers();
		

		for(var i=0; i < 2; i++) {
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
		
		var ambient = new THREE.AmbientLight( 0x101030 );
    	scene.add( ambient );

    	var directionalLight = new THREE.DirectionalLight( 0xfffaf5 );
	    directionalLight.position.set( 0, 0, 1 );
	    scene.add( directionalLight );

	    var backLight = new THREE.DirectionalLight( 0xffeedd );
	    backLight.position.set( 0, 0, -1 );
	    scene.add( backLight );
    	
		camera.position.set(1, 1, 15);

		camera.lookAt( new THREE.Vector3(0, 0, 0) ); 
										 


		littleMen = [];


		function getRandomSkin() {
			var skins = Object.keys(THREEx.MinecraftChar.skinWellKnownUrls);
			var N = skins.length;
			var i = Math.floor(Math.random() * N)
			return skins[i];
		}

		Math.uniform = function(min, max) {
			return Math.random() * (max - min) + min;
		}

		function createLittleMan(user_id, modelId) {
			console.log(user_id);
			if (!modelId) {
				var player	= new THREEx.MinecraftPlayer();
				scene.add(player.character.root);
				updateFcts.push(function(delta, now){
					player.update(delta, now);
				});
				player.character.root.position.x = Math.uniform(-5, 5);
				//player.character.root.position.y = (Math.random() - 0.5) * 2;
				player.character.root.position.z = Math.uniform(5, 10);

				player.character.loadWellKnownSkin(getRandomSkin());
				player.setNickname("人客");

				gamers.push(user_id, player);

				document.body.addEventListener('keydown', function(event){
					doKeyActions(user_id, event.keyCode, event.shiftKey, true);
					console.log('key:'+event.keyCode+' press down');
				});

				document.body.addEventListener('keyup', function(event){
					doKeyActions(user_id, event.keyCode, event.shiftKey, false);
				});
				
				EVENTS.setEvents( function(user_id, key, isKeydown) {
	    			doKeyActions(user_id, key, false, isKeydown);
	    		});
			} else {
				console.log(modelId);
				LittleMan3DPy.loadModel(modelId, function(object) {
					var oldModel = gamers.get(user_id);
					if (oldModel){
						gamers.remove(user_id);
						scene.remove(oldModel);
					};
					gamers.push(user_id, object);
					object.position.x = (Math.random() - 0.5) * 3;
					object.position.y = -0.5;
					object.position.z =  8;
					var s = .015;
					object.scale.set(s, s, s);
			        object.children.forEach(function(child) {
			          child.material.specular = new THREE.Color( 0x000000 );
			        });
			        //console.log(object);
					scene.add(object);
				});
			}

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
			if (message.nickname) player.setNickname(message.nickname);
			if (message.saying) player.setSay(message.saying);
		}

		gamers.all().forEach( function(g) {
			littleMen.push(createLittleMan());
		});

		
		player1 = littleMen[0];
		player1.setNickname("舉牌小人1");
		player1.character.root.position.z = 7;
		player2 = littleMen[1];
		player2.setNickname("舉牌小人2");

		player1.setSay('記得千萬不要宣傳蔡正元罷免案喔!!!');
		player2.setSay('歡迎光臨!');

		//modelId = 421039200975;
		//createLittleMan("fdsafdafs", modelId);

		
		//////////////////////////////////////////////////////////////////////////////////
		//		controls.input based on keyboard				//
		//////////////////////////////////////////////////////////////////////////////////

		var doKeyActions = function(user_id, key, shift, isKeydown){
			//var input = this;
			if (!gamers.get(user_id)) return;
			var input = gamers[user_id].controls.input;
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
		
		//////////////////////////////////////////////////////////////////////////////////
		//		dat.gui
		//////////////////////////////////////////////////////////////////////////////////
		function startDatGUI() {
			var gui = new dat.GUI();
			dat.GUI.toggleHide();
			var direction = { x: 0, y: -2, z: -10};

			var cameraPos = gui.addFolder('Camera Position');
			cameraPos.add(camera.position, 'x', -100, 100).step(1);
			cameraPos.add(camera.position, 'y', -100, 100).step(1);
			cameraPos.add(camera.position, 'z', -100, 200).step(1);
			
			var cameraLookAt = gui.addFolder('Camera LookAt');
			var control1 = cameraLookAt.add(direction, 'x', -50, 50);
			control1.onChange(function(value){
				camera.lookAt(new THREE.Vector3(direction.x, 
												direction.y,
												direction.z));
			});
			var control2 = cameraLookAt.add(direction, 'y', -50, 50);
			control2.onChange(function(value){
				camera.lookAt(new THREE.Vector3(direction.x, 
												direction.y,
												direction.z));
			});
			var control2 = cameraLookAt.add(direction, 'z', -50, 50);
			control2.onChange(function(value){
				camera.lookAt(new THREE.Vector3(direction.x, 
												direction.y,
												direction.z));
			});

		};

		
		
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