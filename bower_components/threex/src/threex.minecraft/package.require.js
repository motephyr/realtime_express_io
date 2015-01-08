define( [ 'module'	// to set .baseURL
	, './threex.animation.js'
	, './threex.animations.js'
	, './threex.minecraft.js'
	, './threex.minecraftcharbodyanim.js'
	, './threex.minecraftcharheadanim.js'
	, './threex.minecraftcontrols.js'
	, './threex.minecraftplayer.js'
	], function(module){
	// set baseUrl for this extension
	THREEx.MinecraftChar.baseUrl	= module.uri+'/../';
});