var Scene = Scene||{};

Scene.MainScene = function(){
    var map;
    var layer;
    var player;
    var cursor;
    var facing = 'down';
    var bounce;
    var speed = 100;
    var mapData;
    var highlight;
    var items = [];
    var itemData;
    var itemLayer;
    var playerBag = [];
    var selected;
    this.preload = function(){
        game.load.tilemap('map','data/map.json',null,Phaser.Tilemap.TILED_JSON);
        game.load.json('item','data/item.json');
        game.load.image('caomian','resource/caomian.png');
        game.load.image('shuimian1','resource/shuimian1.png');
        game.load.image('shuimian2','resource/shuimian2.png');
        game.load.image('shuimian3','resource/shuimian3.png');
        game.load.image('treeA','resource/treeA.png');
        game.load.image('treeB','resource/treeB.png');
        game.load.image('treeC','resource/treeC.png');
        game.load.image('tumian','resource/tumian.png');
        game.load.spritesheet('hero','resource/person3.png',88,88);
        game.load.image('meat','resource/meat.png');
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
        game.load.image('btn_use','resource/btn_use.png');
        game.load.image('btn_close','resource/btn_close.png');
        game.load.image('btn_abandon','resource/btn_abandon.png');
        //高光
        game.load.image('highlight','resource/highlight.png');
    }
    this.create = function(){

        game.scale.scaleMode = 2

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

        itemLayer = game.add.group();

        player = game.add.sprite(200,200,'hero');
        player.animations.add('down',[0,1,2,3],12,true);
        player.animations.add('left',[4,5,6,7],12,true);
        player.animations.add('right',[8,9,10,11],12,true);
        player.animations.add('up',[12,13,14,15],12,true);
        player.anchor.set(0.5,0.9);
        player.isMove = false;
        player.face = 'down';

        highlight = game.add.image(200,200,'highlight');
        highlight.anchor.set(0.5);
        highlight.visible = false;

        layer2 = map.createLayer('layer 2');
        layer2.resizeWorld();

        mapData = layer.layer.data;
        cursor = game.input.keyboard.createCursorKeys();
        game.camera.follow(player,3);
        createUI();

        makeItem(200,200,'meat');

        game.input.onUp.add(playerMove,this);
    }

    this.update = function(){
        itemHitTest();
        if(game.input.activePointer.isDown && !game.input.activePointer.targetObject){
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
        //获取道具信息
        itemData = game.cache.getJSON('item');

        var bag = game.add.sprite(0,0,'bag');
        bag.position.set(game.width - bag.width,game.height - bag.height);
        bag.fixedToCamera = true;
        var attackButton = game.add.image(0,0,'attack');
        attackButton.position.set(attackButton.width/2+10,game.height - attackButton.height/2);
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

        //道具
        for(var i = 0;i < 8;i++){
            var lattice = new Phaser.Image(game,0,0,'meat');
            lattice.width = 58;
            lattice.height = 58;
            lattice.x = 36+(i*77);
            lattice.y = 24;
            lattice.itemType = null;
            lattice.inputEnabled = true;
            lattice.events.onInputUp.add(function(e){
                selected = e;
                btnList.visible = true;
                btnList.cameraOffset.x = bagX + e.x - 12;
            },this);
            lattice.visible = false;
            playerBag.push(lattice);
            bag.addChild(lattice);
        }
        var bagX = bag.x;
        var btnList = game.add.group();
        btnList.fixedToCamera = true;
        btnList.visible = false;
        btnList.cameraOffset.setTo(bag.x+24,bag.y-25);
        var btn_use = btnList.create(0,-90,'btn_use');
        btn_use.inputEnabled = true;
        btn_use.events.onInputUp.add(function(){
            if (selected) {
                selected.itemType = false;
                selected.visible = false;
                btnList.visible = false;
            }
        },this);
        var btn_abandon = btnList.create(0,-45,'btn_abandon');
        btn_abandon.inputEnabled = true;
        btn_abandon.events.onInputUp.add(function(){
            if(selected){
                abandonItem(player.position.x,player.position.y,selected.itemType);
                selected.itemType = null;
                selected.visible = false;
                btnList.visible = false;
            }
        },this);
        var btn_close = btnList.create(0,0,'btn_close');
        btn_close.inputEnabled = true;
        btn_close.events.onInputUp.add(function(){
            btnList.visible = false;
        },this);
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
        if (player.isMove||pointer.targetObject) {return;}
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

    function makeItem(x,y,type){
        var item = itemLayer.create(x,y,type);
        item.itemType = type;
        items.push(item);
        item.anchor.set(0.5);
    }

    function attackEnemy(pointer){
        console.log(pointer)
        console.log('attck');
    }

    function itemHitTest(){
        var rect = new Phaser.Rectangle(player.x,player.y,80,80);
        for(var i = 0;i < items.length;i++){
            if (Phaser.Rectangle.contains(rect,items[i].x,items[i].y)) {
                var hasBag = false;
                for(var j = 0;j < 8;j++){
                    if(playerBag[j].itemType == null){
                        hasBag = playerBag[j];
                        break;
                    }
                }
                if(hasBag){
                    hasBag.visible = true;
                    hasBag.itemType = items[i].itemType;
                    hasBag.setTexture(items[i].texture);
                    items[i].visible = false;
                    items[i].kill();
                    items.splice(i,1);
                    i--;
                }
            };
        }
    }

    function abandonItem(x,y,type){
        x = ~~(x/80);
        y = ~~(y/80);
        var position = randomMapPosition(x,y);
        makeItem((x+position.x)*80+40,(y+position.y)*80+40,type);
    }

    function randomMapPosition(x,y){
        do{
            var raw = Math.round((Math.random()-0.5)*2);
            var columns = Math.round((Math.random()-0.5)*2);
        }while(!(1<x+columns&&x+columns<126&&1<raw+y&&raw+y<70&&mapData[y+raw][x+columns].index!=5&&!(raw==0&&columns==0)))

        return {x:columns,y:raw};
    }
}