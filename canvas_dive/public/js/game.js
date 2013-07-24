( function() {
  var pressed = {},
  player,
  ctx,
  monolith,
  effects,
  ground,
  KEY_SPACEBAR,
  catSprite,
  tick,
  keyMap;

  keyMap = {
    space: 32,
    j: 74,
    l: 76
  }


  function Box(x,y,w,h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  Box.prototype.fillRect = function(ctx) {
    ctx.fillRect(this.x,this.y,this.w,this.h);
  };
  Box.prototype.getRight = function() { return this.x + this.w; };
  Box.prototype.getLeft = function() { return this.x; };
  Box.prototype.getTop = function() { return this.y; };
  Box.prototype.getBottom = function() {
    return this.y + this.h;
  };

  Box.prototype.setRight  = function(right) { this.x = right - this.w; };
  Box.prototype.setLeft   = function(left)  { this.x = left; };
  Box.prototype.setBottom = function(bottom) { this.y = bottom - this.h; };
  Box.prototype.setTop    = function(top) { this.y = top; };

  Box.prototype.intersects = function(box) {
    if(this.getRight() >= box.getLeft() && this.getLeft() <= box.getRight()) {
      if(this.getBottom() >= box.getTop() && this.getTop() <= box.getBottom()) {
        return true;
      }
    }
    return false;
  };

  function Player() {
    this.constructor.apply(this, arguments);
    this.dx = 0;
    this.dy = 0;
    this.jumpStrength = 3;
    this.runSpeed = 3;
  }
  Player.prototype = new Box();
  Player.prototype.constructor = Box;

  Player.prototype.jump = function() { this.dy === 0 ? this.dy = this.jumpStrength : null; }
  Player.prototype.goLeft = function() { this.dx = -this.runSpeed; }
  Player.prototype.goRight = function() { this.dx = this.runSpeed; }

  function createSprite(source, offsetX, offsetY, options) {
    var image = new Image();
    image.src = source;
    incrementer = 
    image.addAnimation = function(name, startPosY, frameCount) {
      this[name] = []
      for(var _i = 0; _i < frameCount; _i++) {
        this[name].push({x: offsetX + _i*64, y: offsetY + startPosY*64});
      }
    };

    image.index = 0;
    image.currentAnimation = '';
    return image
  }

  function setup() {
    catSprite = createSprite("images/kitty.png", 0, 7);
    catSprite.addAnimation('idle', 0, 4);
    catSprite.addAnimation('walk', 1, 8);
    catSprite.addAnimation('walkBack', 1, 8, { reverse: true });
    catSprite.addAnimation('jumping', 2, 8);

    player = new Player(0,300,50,100);
    monolith = new Box(300,200,50,200);

    ctx = document.getElementById('canvas').getContext('2d');

    effects = [];
    ground = 400;
    KEY_SPACEBAR = 32;
    tick = 0;

    document.addEventListener('keydown',function(e) {
      console.log(e.keyCode);
      pressed[e.keyCode] = true;
    });
    document.addEventListener('keyup',  function(e) {
      pressed[e.keyCode] = false;
    });
  }

  function gameLoop() {
    processInput();
    updateGameState();
    checkConditions();
    processAnimations();
    draw();
    window.requestAnimFrame(gameLoop);
  }

  function processInput() {
    if(pressed[keyMap.space]) player.jump();
    if(pressed[keyMap.j]) player.goLeft();
    if(pressed[keyMap.l]) player.goRight();
  }


  function updateGameState() {
    player.y -= player.dy;
    player.dy -= 0.1;
    player.x += player.dx;
    player.dx = Math.abs(player.dx) * 0.5;

    if(player.getBottom() > ground) {
      player.setBottom(ground);
      player.dy = 0;
    }
  }

  function checkConditions() {
    if(player.intersects(monolith)) {
      console.log("player hit the monolith.");

      var effect = new ParticleEffect();
      effect.x = player.x;
      effect.y = 400-player.h/2;
      effect.max = 100;
      effect.initParticle = function(part) {
        part.dy = rand(-5,5);
        part.dx = rand(-3,0);
        part.color = randColor();
        return part;
      };
      effects.push(effect);
      player.x = 0;
    }
  }

  function processAnimations() {
    if(player.getBottom() < ground) {
      catSprite.currentAnimation = 'jumping';
    } else if(pressed['J'.charCodeAt(0)] == true || pressed['L'.charCodeAt(0)] == true) {
      catSprite.currentAnimation = 'walk';
    } else {
      catSprite.currentAnimation = 'idle';
    }

    tick++;
    if(tick % 6 == 0) {
      catSprite.index++;
    }

    if(catSprite.index >= catSprite[catSprite.currentAnimation].length){
      catSprite.index = 0;
    }
  }

  function draw() {
    var slice;

    ctx.fillStyle = "#88ddff";
    ctx.fillRect(0,0,800,600);

    ctx.fillStyle = "#88ff00";
    ctx.fillRect(0,400,800,200);

    ctx.save();
    ctx.translate(player.x, player.y);
    slice = catSprite[catSprite.currentAnimation][catSprite.index];
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.drawImage(catSprite,
                  slice.x, slice.y,
                  64, 64,
                  -64-32,-64-32+8,
                  128*2,128*2);
                  ctx.restore();

                  ctx.fillStyle = "black";
                  monolith.fillRect(ctx);

                  effects.forEach(function(ef) {
                    ef.tick();
                    ef.draw(ctx);
                  });
  }
  function refresh() {
  }


  function rand(lo,hi) {
    return lo + Math.random()*(hi-lo);
  }

  function randColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
  }

  function ParticleEffect() {
    this.x = 0;
    this.y = 0;
    this.age = 0;
    this.parts = [];
    this.rate = 1;
    this.max = 10;
    this.maxage = 200;
    this.color = "#aaaaaa";
    this.alive = true;
    this.initParticle = function(part) {
      return part;
    }
    this.tick = function() {
      this.age++;
      if(this.age > this.maxage) {
        this.alive = false;
        return;
      }
      if((this.age % this.rate) == 0 && this.parts.length < this.max) {
        var part = {
          x:this.x,
          y:this.y,
          dx: rand(-3,3),
          dy: rand(-3,3),
          alpha:1,
          dalpha:-0.01,
          color: this.color,
        };
        this.parts.push(this.initParticle(part));
      }
      for(var i=0; i<this.parts.length; i++) {
        var p = this.parts[i];
        p.y += p.dy;
        p.x += p.dx;
        p.alpha += p.dalpha;
      }
    }
    this.draw = function(g) {
      if(!this.alive) return;
      g.save();
      for(var i=0; i<this.parts.length; i++) {
        var p = this.parts[i];
        if(p.alpha < 0) continue;
        g.fillStyle = p.color;
        g.globalAlpha = p.alpha;
        g.fillRect(p.x,p.y,20,20);
      }
      g.restore();
    }
  }

  setup();

  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      function( callback ){
      window.setTimeout(callback, 1000 / 60);
    };
  })();

  window.requestAnimFrame(gameLoop);


})()

