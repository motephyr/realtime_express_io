define(["/js/vendor/OBJMTLLoader.js",
	    "/js/vendor/MTLLoader.js"], function(OBJMTLLoader) {
	LittleMan3DPy = function () {
	};

    
    LittleMan3DPy.prototype.loadModel = function(modelId, callback) {
    	
    	var loader = new THREE.OBJMTLLoader();
	    var files = ['.obj', '.mtl'].map(function(extname) {
	      return '/proxy/api/figurines/raw/' + modelId + '/' + modelId + extname;
	    });
	    
	    loader.load(files[0], files[1], callback);
  	};

  	LittleMan3DPy.prototype.simulate = function() {

  	}


	return LittleMan3DPy;
});