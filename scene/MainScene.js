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
    var mapData;
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
        player = game.add.sprite(200,200,'hero');
        player.animations.add('down',[0,1,2,3],12,true);
        player.animations.add('left',[4,5,6,7],12,true);
        player.animations.add('right',[8,9,10,11],12,true);
        player.animations.add('up',[12,13,14,15],12,true);
        player.anchor.set(0.5,0.9);
        player.isMove = false;

        layer2 = map.createLayer('layer 2');
        layer2.resizeWorld();
        mapData = layer.layer.data;
        cursor = game.input.keyboard.createCursorKeys();
        game.camera.follow(player);
        createUI();
	}

	function update(){
        if(game.input.activePointer.isDown && !player.isMove){
            var playerPositionX = ~~(player.position.x/80);
            var playerPositionY = ~~(player.position.y/80);
            var position = getMapPoint(game.input.activePointer.worldX,game.input.activePointer.worldY);
            var endX = ~~(position.x/80);
            var endY = ~~(position.y/80);
            if ((playerPositionX != endX || playerPositionY != endY)&&mapData[endY][endX].index!=5){
                var path = findPath({x:playerPositionX,y:playerPositionY},{x:endX,y:endY});
                var node = path.pop();
                player.isMove = true;
                var tween = game.add.tween(player).to({x:node.x*80+40,y:node.y*80+40},speed).start();
                tween.onComplete.add(XEnd.bind(this,position,path),this);
            }
            // var facingX = (position.x - playerPosition.x);
            // facingX && (facingX /= Math.abs(facingX));
            // var facingY = (position.y - playerPosition.y);
            // facingY && (facingY /= Math.abs(facingY));
            // if(facingX || facingY){
            //     if(facingX){
            //         player.isMove = true;
            //     }
            //     else{

            //     }
            // }
        }
	}

    function XEnd(position,path){
        if(path.length <= 0){
            player.isMove = false;
            return;
        }
        var node = path.pop();
        var tween = game.add.tween(player).to({x:node.x*80+40,y:node.y*80+40},speed).start();
        tween.onComplete.add(XEnd.bind(this,position,path),this);

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

    function findPath(start,end){
        var point = function(obj){
            this.x = obj.x;
            this.y = obj.y;
            this.f = 0;
            this.g = 0;
            this.h = 0;
            this.inClose = false;
            this.parent = null;
        }
        point.prototype = {
            countF:function(){
                this.f = this.h + this.g;
            }
        }

        var openList = [];
        var closeList = [];
        var findPoint = function(x,y,obj){
            for(var key in obj){
                if(obj[key].x == x&&obj[key].y == y)return obj[key];
            }
            return false;
        }
        var start = new point(start);
        var end = new point(end);
        openList.push(start);
        while(openList.length > 0){
            openList.sort(compare);
            var parent = openList.shift(); 
            closeList.push(parent);
            if(parent.x == end.x && parent.y == end.y){
                break;
            }
            var x = parent.x;
            var y = parent.y;
            if (x<128&&y-1<72&&mapData[y-1][x].index!=5&&!findPoint(x,y-1,closeList)) {
                var p = findPoint(x,y-1,openList)
                if (p) {
                    var g = Math.abs(start.x-p.x)+Math.abs(start.y-p.y);
                    if (g < p.g) {
                        p.g = g;
                        p.countF();
                        p.parent = parent;
                    }

                }
                else{
                    p = new point({x:x,y:y-1});
                    p.g = parent.g+1;
                    p.h = Math.abs(end.x - x)+Math.abs(end.y-(y-1));
                    p.countF();
                    p.parent = parent;
                    openList.push(p);
                }
            }
            if (x<128&&y+1<72&&mapData[y+1][x].index!=5&&!findPoint(x,y+1,closeList)) {
                var p = findPoint(x,y+1,openList)
                if (p) {
                    var g = Math.abs(start.x-p.x)+Math.abs(start.y-p.y);
                    if (g < p.g) {
                        p.g = g;
                        p.countF();
                        p.parent = parent;
                    }

                }
                else{
                    p = new point({x:x,y:y+1});
                    p.g = parent.g+1;
                    p.h = Math.abs(end.x - x)+Math.abs(end.y-(y+1));
                    p.countF();
                    p.parent = parent;
                    openList.push(p);
                }
            }
            if (x-1<128&&y<72&&mapData[y][x-1].index!=5&&!findPoint(x-1,y,closeList)) {
                var p = findPoint(x-1,y,openList)
                if (p) {
                    var g = Math.abs(start.x-p.x)+Math.abs(start.y-p.y);
                    if (g < p.g) {
                        p.g = g;
                        p.countF();
                        p.parent = parent;
                    }

                }
                else{
                    p = new point({x:x-1,y:y});
                    p.g = parent.g+1;
                    p.h = Math.abs(end.x - (x-1))+Math.abs(end.y-y);
                    p.countF();
                    p.parent = parent;
                    openList.push(p);
                }
            }
            if (x+1<128&&y<72&&mapData[y][x+1].index!=5&&!findPoint(x+1,y,closeList)) {
                var p = findPoint(x+1,y,openList)
                if (p) {
                    var g = Math.abs(start.x-p.x)+Math.abs(start.y-p.y);
                    if (g < p.g) {
                        p.g = g;
                        p.countF();
                        p.parent = parent;
                    }

                }
                else{
                    p = new point({x:x+1,y:y});
                    p.g = parent.g+1;
                    p.h = Math.abs(end.x - (x+1))+Math.abs(end.y-y);
                    p.countF();
                    p.parent = parent;
                    openList.push(p);
                }
            }

        }
        var node = closeList.pop();
        var path = [];
        while(node.x != start.x || node.y != start.y){
            path.push(node);
            node = node.parent;
        }
        return path;
    }

    function compare(a,b){
        return a.f - b.f;
    }

})()