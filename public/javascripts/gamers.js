define([], function() {
  var Gamers = function(){
      this.gamersList = [];
      this.last = null;
  };
  
  Gamers.prototype.next = function() {
      var newgamer = this.gamersList.shift();
      this.gamersList.push(newgamer);
      this.last = newgamer;
      return newgamer;
  };

  Gamers.prototype.prev = function() {
      return this.last;
  };

  Gamers.prototype.push = function(i) {
      this.gamersList.push(i);
  }; 

  Gamers.prototype.remove = function(i) {
      var idx = this.gamersList.indexOf(i);
      if (idx > -1) {
        this.gamersList.splice(idx, 1);
      }
  };

  Gamers.prototype.all = function() {
      return this.gamersList.slice(0);
  };
  

  Gamers.prototype.setActive = function(i) {
      this.last = i;
      var idx = this.gamersList.indexOf(i);
      var head = this.gamersList.splice(0, idx+1);
      this.gamersList = this.gamersList.concat(head);
  };

  return Gamers;
});