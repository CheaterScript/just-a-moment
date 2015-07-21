Player = function(game, x, y, key, frame){

	Phaser.Sprite.call(this);
}

Player.prototype = {
	helloWorld:function(){
		console.log('a');
	}
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;