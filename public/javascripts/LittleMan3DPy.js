define("LittleMan3DPy", ["/js/vendor/OBJMTLLoader.js",
	    "/js/vendor/MTLLoader.js"], function(OBJMTLLoader) {
	LittleMan3DPy = {};
    LittleMan3DPy.loadModel = function(modelId, callback) {
    	
    	var loader = new THREE.OBJMTLLoader();
	    var files = ['.obj', '.mtl'].map(function(extname) {
	      return '/proxy/api/figurines/raw/' + modelId + '/' + modelId + extname;
	    });
	    
	    loader.load(files[0], files[1], callback);
  	};

  	LittleMan3DPy.loadEiffel = function(callback) {
  		var loader = new THREE.OBJMTLLoader();
	    var files = ['.obj', '.mtl'].map(function(extname) {
	    	console.log('/image/eiffel/Parijs' + extname);
	      return '/image/eiffel/Parijs' + extname;
	    });
	    loader.load(files[0], files[1], callback);
  	};

  	return LittleMan3DPy;

});