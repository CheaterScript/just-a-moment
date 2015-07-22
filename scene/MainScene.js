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
        game.load.spritesheet('hero','resource/person2.png',88,88);
        //UI
        game.load.image('bag','resource/bag.png');
        game.load.image('attack','resource/attack.png');
        game.load.image('avatar','resource/avatar.png');
        game.load.image('health','resource/health.png');
        game.load.image('hungry','resource/hungry.png');
        game.load.image('repeat','resource/repeat.png');
        game.load.image('thirsty','resource/thirsty.png');
        game.load.image('health_bar','resource/health_bar.png');
        game.load.image('hungry_bar','resource/hungry_bar.png');
        game.load.image('repeat_bar','resource/repeat_bar.png');
        game.load.image('thirsty_bar','resource/thirsty_bar.png');
        //高光
        game.load.image('highlight','resource/highlight.png');
	}

    var map;
    var layer;
    var player;
    var cursor;
    var facing = 'down';
    var bounce;
    var speed = 100;
    var mapData;
    var highlight;
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
        player.face = 'down';

        layer2 = map.createLayer('layer 2');
        layer2.resizeWorld();

        highlight = game.add.image(200,200,'highlight');
        highlight.anchor.set(0.5);
        highlight.visible = false;
        mapData = layer.layer.data;
        cursor = game.input.keyboard.createCursorKeys();
        game.camera.follow(player,3);
        createUI();

        //添加事件
        game.input.onUp.add(playerMove,this);
	}

	function update(){
        if(game.input.activePointer.isDown){
            var playerPositionX = ~~(player.position.x/80);
            var playerPositionY = ~~(player.position.y/80);
            var position = getMapPoint(game.input.activePointer.worldX,game.input.activePointer.worldY);
            var endX = ~~(position.x/80);
            var endY = ~~(position.y/80);
            if ((playerPositionX != endX || playerPositionY != endY)&&mapData[endY][endX].index!=5&&1<endX&&endX<126&&1<endY&&endY<70){
                highlight.position.set(80*endX+40,80*endY+40);
                highlight.visible = true;
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
            player.animations.stop();
            console.log(player.face);
            switch(player.face){
                case 'left':player.frame = 4;
                    break;
                case 'right':player.frame = 8;
                    break;
                case 'down':player.frame = 0;
                    break;
                case 'up':player.frame = 12;
                    break;
            }
            return;
        }
        var playerPositionX = ~~(player.position.x/80);
        var playerPositionY = ~~(player.position.y/80);
        var node = path.pop();
        playerAnimation(node.x-playerPositionX,node.y-playerPositionY);
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
        attackButton.inputEnabled = true;
        attackButton.events.onInputDown.add(function(){
            attackButton.scale.set(0.8);
        },this);
        attackButton.events.onInputUp.add(function(){
            attackButton.scale.set(1);
        },this);
        attackButton.events.onInputOut.add(function(){
            attackButton.scale.set(1);
        },this);
        var avatar = game.add.sprite(0,0,'avatar');
        avatar.fixedToCamera = true;
        //Bar
        var barX = avatar.width+25;
        player.healthBar = game.add.sprite(barX,0,'health_bar');
        player.healthBar.fixedToCamera = true;
        player.hungryBar = game.add.sprite(barX,30,'hungry_bar');
        player.hungryBar.fixedToCamera = true;
        player.thirstyBar = game.add.sprite(barX,60,'thirsty_bar');
        player.thirstyBar.fixedToCamera = true;
        player.repeatBar = game.add.sprite(barX,90,'repeat_bar');
        player.repeatBar.fixedToCamera = true;
        //mask
        var mask = game.add.graphics(barX,0);
        mask.fixedToCamera = true;
        mask.beginFill(0xeeeeee);
        mask.drawRect(0,0,149,18);
        player.healthBar.mask = mask;

        mask = game.add.graphics(barX,30);
        mask.fixedToCamera = true;
        mask.beginFill(0xeeeeee);
        mask.drawRect(0,0,149,18);
        player.hungryBar.mask = mask;

        mask = game.add.graphics(barX,60);
        mask.fixedToCamera = true;
        mask.beginFill(0xeeeeee);
        mask.drawRect(0,0,149,18);
        player.thirstyBar.mask = mask;

        mask = game.add.graphics(barX,90);
        mask.fixedToCamera = true;
        mask.beginFill(0xeeeeee);
        mask.drawRect(0,0,149,18);
        player.repeatBar.mask = mask;

        barX-=25;
        var healthBarBorder = game.add.sprite(barX,0,'health');
        healthBarBorder.fixedToCamera = true;
        var hungryBarBorder = game.add.sprite(barX,30,'hungry');
        hungryBarBorder.fixedToCamera = true;
        var thirstyBarBorder = game.add.sprite(barX,60,'thirsty');
        thirstyBarBorder.fixedToCamera = true;
        var repeatBarBorder = game.add.sprite(barX,90,'repeat');
        repeatBarBorder.fixedToCamera = true;
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

    function playerMove(pointer){
        highlight.visible = false;
        if (player.isMove) {return;}
        var playerPositionX = ~~(player.position.x/80);
        var playerPositionY = ~~(player.position.y/80);
        var position = getMapPoint(pointer.worldX,pointer.worldY);
        var endX = ~~(position.x/80);
        var endY = ~~(position.y/80);
        if ((playerPositionX != endX || playerPositionY != endY)&&mapData[endY][endX].index!=5&&1<endX&&endX<126&&1<endY&&endY<70){
            var path = findPath({x:playerPositionX,y:playerPositionY},{x:endX,y:endY});
            var node = path.pop();
            player.isMove = true;
            player.face = '';
            playerAnimation(node.x-playerPositionX,node.y-playerPositionY);
            var tween = game.add.tween(player).to({x:node.x*80+40,y:node.y*80+40},speed).start();
            tween.onComplete.add(XEnd.bind(this,position,path),this);
        }
    }

    function playerAnimation(faceX,faceY){
        console.log(faceX,faceY);
        if (faceX != 0) {
            if(faceX < 0){
                if(player.face == 'left')return;
                player.face = 'left';
                player.animations.play('left');
            }
            else{
                if(player.face == 'right')return;
                player.face = 'right';
                player.animations.play('right');
            }
        }else{
            if(faceY < 0){
                if(player.face == 'up')return;
                player.face = 'up';
                player.animations.play('up');
            }
            else{
                if(player.face == 'down')return;
                player.face = 'down';
                player.animations.play('down');
            }
        }
    }

    function StageTouchDown(pointer){
        if (player.isMove) {return;}
    }

})()