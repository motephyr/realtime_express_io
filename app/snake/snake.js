var _ = require('underscore');

module.exports = function(name) {

	// Setup some attributes for the snake.
	this.name = name;
	this.character = (this.name === null || this.name[0] === undefined) ? '#' : this.name[0];
	this.positions = [];
	this.head = function() { return _(this.positions).last(); };
	this.length = 1;

	this.alive = true;
	this.zombie = false;

	this.invincible = true;
	var that = this;
	setInterval(function(){ that.invincible = false; }, 6000);

	this.randomColor = function(){
		colors=['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf']

		return colors[parseInt(Math.random() * colors.length)];
	}

	this.color = this.randomColor();
	this.realcolor = this.color;

	// Remember last direction for auto mover.
	this.lastDirection = {
		x: parseInt(Math.random() * 3) - 1,
		y: parseInt(Math.random() * 3) - 1
	};

	this.setPos = function(pos) {
		this.x = pos.x;
		this.y = pos.y;
		this.positions.push(pos);
		if (this.positions.length > this.length) { this.positions.shift(); }
	};
};

