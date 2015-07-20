var game;
(function(){
	window.onload = function(){
			game = new Phaser.Game(800,480,Phaser.ATUO,'',{
			preload:preload,
			create:create,
			update:update
		});
	}

	function preload(){
        game.load.tilemap('map','data/map.json',null,Phaser.Tilemap.TILED_JSON);
        game.load.image('caomian','resource/caomian.png');
        game.load.image('shuimian1','resource/shuimian1.png');
        game.load.image('shuimian2','resource/shuimian2.png');
        game.load.image('shuimian3','resource/shuimian3.png');
        game.load.image('treeA','resource/treeA.png');
        game.load.image('treeB','resource/treeB.png');
        game.load.image('treeC','resource/treeC.png');
        game.load.image('tumian','resource/tumian.png');
        game.load.spritesheet('hero','resource/person1.png',88,88);
        //UI
        game.load.image('bag','resource/bag.png');
        game.load.image('attack','resource/attack.png');
        game.load.image('avatar','resource/avatar.png');
        game.load.image('health','resource/health.png');
        game.load.image('hungry','resource/hungry.png');
        game.load.image('repeat','resource/repeat.png');
        game.load.image('thirsty','resource/thirsty.png');
	}

    var map;
    var layer;
    var player;
    var cursor;
    var facing = 'down';
    var bounce;
    var speed = 100;
	function create(){
        map = game.add.tilemap('map');
        map.addTilesetImage('treeA');
        map.addTilesetImage('treeB');
        map.addTilesetImage('treeC');
        map.addTilesetImage('caomian');
        map.addTilesetImage('shuimian1');
        map.addTilesetImage('shuimian2');
        map.addTilesetImage('shuimian3');
        map.addTilesetImage('tumian');
        layer = map.createLayer('layer 1');
        layer.resizeWorld();
        layer2 = map.createLayer('layer 2');
        layer2.resizeWorld();

        player = game.add.sprite(200,200,'hero');
        player.animations.add('down',[0,1,2,3],12,true);
        player.animations.add('left',[4,5,6,7],12,true);
        player.animations.add('right',[8,9,10,11],12,true);
        player.animations.add('up',[12,13,14,15],12,true);
        player.anchor.set(0.5,0.9);
        player.isMove = false;

        cursor = game.input.keyboard.createCursorKeys();
        game.camera.follow(player);
        createUI();
	}

	function update(){
        if(game.input.activePointer.isDown && !player.isMove){
            var playerPosition = player.position;
            var position = getMapPoint(game.input.activePointer.worldX,game.input.activePointer.worldY);
            var facingX = (position.x - playerPosition.x);
            facingX && (facingX /= Math.abs(facingX));
            var facingY = (position.y - playerPosition.y);
            facingY && (facingY /= Math.abs(facingY));
            if(facingX || facingY){
                if(facingX){
                    player.isMove = true;
                    var tween = game.add.tween(player).to({x:position.x},speed*Math.abs((position.x - playerPosition.x)/80)).start();
                    tween.onComplete.add(XEnd.bind(this,facingY,position),this);
                }
                else{

                }
            }
        }
	}

    function XEnd(facingY,position){
        player.isMove = false;

    }

    function YEnd(){

    }

    function getMapPoint(x,y){
        x = ~~(x/80)*80+40;
        y = ~~(y/80)*80+40;
        return {x:x,y:y};
    }

    function createUI(){
        var bag = game.add.sprite(0,0,'bag');
        bag.position.set(800 - bag.width,480 - bag.height);
        bag.fixedToCamera = true;
        var attackButton = game.add.sprite(0,0,'attack');
        attackButton.position.set(attackButton.width/2+10,480 - attackButton.height/2);
        attackButton.anchor.set(0.5);
        attackButton.fixedToCamera = true;
        var avatar = game.add.sprite(0,0,'avatar');
        avatar.fixedToCamera = true;
        //Bar
        var barX = avatar.width;
        var healthBar = game.add.sprite(barX,0,'health');
        healthBar.fixedToCamera = true;
        var hungryBar = game.add.sprite(barX,30,'hungry');
        hungryBar.fixedToCamera = true;
        var thirstyBar = game.add.sprite(barX,60,'thirsty');
        thirstyBar.fixedToCamera = true;
        var repeatBar = game.add.sprite(barX,90,'repeat');
        repeatBar.fixedToCamera = true;
    }

})()