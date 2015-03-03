var _ = require('underscore');

module.exports = function(io) {

	// Calculate a random position used for food & snakes.
	this.randomPos = function() {
		return {
			x: parseInt(Math.random() * this.width),
			y: parseInt(Math.random() * this.height)
		};
	};

	// Dimensions of play area
	this.width = 80;
	this.height = 40;

	var that = this; // that makes the current object accessible from an inner function
	this.terrain = function() {
		// Range starts at 0 if no min is given.
		return _.range(that.height).map(function() {
			return _.range(that.width).map(function() { return "."; });
		});
	};

	this.snakes = [];
	this.food = [];
	this.invinciblePos = this.randomPos();

	// Place a new snake (ie: new player)
	this.placeSnake = function(snake) {
		this.snakes.push(snake);        // Add a snake to the snakes array
		snake.setPos(this.randomPos()); // Place randomly on the map
	};

	this.moveSnake = function(snake, movement) {

		var that = this; // Java script scope hack.


		// Invincible mode
		if(snake.invincible){
			if(snake.color === 'red'){
				snake.color = 'orange';
			}else{
				snake.color = 'red';
			};
		}else{
			snake.color = snake.realcolor;
		};

		// Nice and simple edge wrapping
		x = snake.head().x + movement.x;
		if (x >= this.width) { x = 0; }
		if (x < 0) { x = this.width - 1; }

		y = snake.head().y + movement.y;
		if (y >= this.height) { y = 0; }
		if (y < 0) { y = this.height - 1; }

		// Create the next position for snake
		var newPos = {x: x, y: y};

		// Flattern all snake bits into a long array of hash coordinates
		snakeBits = _(this.snakes).chain().map(function(snake) {
			return snake.positions 
		}).flatten().value();

		// Check if we hit another snake
		if(snakeBits.length > 1 && snake.invincible === false){
			_(snakeBits).each(function(bit) {
				if(_.isEqual(newPos, bit)){ // Has hit

					// disable snake
					snake.alive = false;
				};
			});
			
			if(snake.alive === false && snake.zombie !== true) {
				random = parseInt(Math.random() * 3);

				switch(random){
				case 0:	// Corpse
					snake.character = "X";
					snake.zombie = false;
					io.sockets.emit('announce', snake.name+" hit something and became a corpse!");
					break;

				case 1:	// Zombie (Still automoves)
					snake.zombie = true;
					snake.character = "Z";
					io.sockets.emit('announce', snake.name+" hit something and became a zombie!");
					break;
					
				case 2: // Food
					_(snake.positions).each(function(bit){
						// Create food at position
						that.food.push(bit);  // doesn't work
					});

					// Remove snake altogether
					that.snakes = _.reject(that.snakes, function(s){
						return _.isEqual(snake, s);
					});
					io.sockets.emit('announce', snake.name+" hit something and became food!");
					break;
				};
			};
		};
		
		// Check if we ate any of the foods or invincible tokens
		if(snake.alive){
			_(this.food).each(function(pos) {
				if(_.isEqual(newPos, pos)){
					// remove the correct food from the array
					that.food =  _.reject(that.food, function(f) { return _.isEqual(newPos, f); });
					snake.length++;   // Increase players snake
					that.placeFood(); // Place a new food item randomly on the map.
				};
			});

			if(_.isEqual(newPos, that.invinciblePos)){
				that.placeInvincible();
				snake.invincible = true;
			};
		};
		
		snake.setPos(newPos); // MOVE snake
	}; // moveSnake

	this.placeInvincible = function() {
		this.invinciblePos = this.randomPos();
	};

	this.placeFood = function() {
		this.food.push(this.randomPos());
	};

	this.toString = function() {
		var result = this.terrain();

		// Multi-food
		_(this.food).each(function(pos) {
			result[pos.y][pos.x] = '+';
		});

		// Invincible
		result[this.invinciblePos.y][this.invinciblePos.x] = "*";

		// Render multiple snakes, one per person
		_(this.snakes).each(function(snake) {
			_(snake.positions).each(function(pos) {
				result[pos.y][pos.x] = "<b style='color:" + snake.color + "'>" + snake.character + "</b>";
			});
		});

    var leader = _(this.snakes).chain()
      .filter(function(s) { return s.alive; })
      .map(function(s) { return { name: s.name, score: s.positions.length }; })
      .sortBy('score')
      .reverse()
      .first().value();

    if (leader !== undefined) {
      io.sockets.emit('score', leader.name+" is leading with a score of "+leader.score);
    } else {
      io.sockets.emit('score', "");
    }

		return _(result).map(function(row) {
			return row.join("") + "<br />";
		}).join("");
	};

	// Auto move snakes on the map
	this.startAutoMoving = function(opts) {
		var that = this;
		var interval = 250; // 0.3 seconds
		var autoMover = function() {
			_(that.snakes).each(function(snake) {
				if(snake.alive || snake.zombie){
					that.moveSnake(snake, snake.lastDirection);
				};
			});
			opts.afterEachMove();
		};
		setInterval(autoMover, interval);
	};
};

