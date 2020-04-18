let simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@.....######...#..
..####.............#..
.....#+++++++++++++#..
.....###############..
......................`;

/**Now we define the level class. The descriptions must be written 
 * this way
 */
class Level{
    constructor(plan){
        let rows = plan.trim().split('\n').map(l=>[...l]);
        this.height = rows.length;
        this.width = rows[0].length;
        this.startActors = [];
        this.rows = rows.map((row,y)=>{
            return row.map((ch,x)=>{
                let type = levelChars[ch];
                if(typeof type=='string') return type;
                this.startActors.push(type.create(new Vec(x,y),ch));
                return "empty";
            });
        });
    }
}
/**Level class holds our actors and the array representation
 * of a level in Level.rows
 * Note the clever usage of ... operator to open up the string
 * 
 * also, in rows.map, notice the clear and concise, yet cleverly written code
 */

 /** Several things start expanding from class Level
  * We no wknow that there is an object levelchars, that probably holds charactere
  * Also, from the fact that type is being pushed into this.startActors, we know that 
  * type is either a string or an actor.
  * Also, we discover that actors have a create method, that takes yet another Vec class
  * And the character it was created from (we wonder why that is needed)
  * Also, when there is an actor, after pushing it in the startActors, we
  * return "empty for the background"
  */


  /**Now, instead of concluding, we expand the plot more */
  class State{
      constructor(level,actors,status){
          this.level = level;
          this.actors = actors;
          this.status = status;
      }
      static start(level){
          return new State(level,level.startActors,'playing');
      }
      get player(){
          return this.actors.find((a)=>a.type=='player');
      }
  }

/**The State class holds the state of the game, which includes the level,
 * and actors(why did we include characters in level then ?)
 * And the status of the game, which here is 'playing'.
 * There must be more statuses for it to make sense
 * Also, we create more expectations from Actors class
 * they must have a type property  
 * Another fun thing to notice is how a new state is returned by 
 * the start function 
 */

 /**
  * Let's close one small subplot. The Vec class. It's rather simple
  * Let's keep it immutable
  */
 class Vec{
     constructor(x,y){
         this.x = x;
         this.y = y;
     }
     plus(other){
         return new Vec(this.x+other.x,this.y+other.y);
     }
     times(k){
         return new Vec(k*this.x,k*this.y);
     }
 }

 /**
  * Now what we do next is intersting. Because it concludes a major
  * plot, while opening many others
  */
 class Player{
     constructor(pos,speed){
         this.pos = pos;
         this.speed = speed;
     }
     get type(){
         return 'player';
     }
     static create(pos){
         return new Player(pos.plus(new Vec(0,-0.5)),new Vec(0,0));
     }
 }
 Player.prototype.size = new Vec(0.8,1.5);

 /**
  * So we get to see an actor, and witness the type() getter and create(pos)
  * which we got a glimpse of in Level and State class
  * We also see speed, I wonder how we will implement the idea of speed
  * Also, from the static create method, we have added a vector 
  * that shifts the position up by -0.5. Why is that?
  * Maybe it has something to do with the player having a size y coordinate of 1.5
  * Also, notice that the size property is set on player.prototype
  * Which means it's not created everytime we create a new Instance of player
  * It's a good way to save processing power
  */

  /**
   * Now we have class Lava, another actor
   */
  class Lava{
      constructor(pos,speed,reset){
          this.pos = pos;
          this.speed = speed;
          this.reset = reset;
      }
      get type(){return 'lava';}
      static create(pos,ch){
          if(ch=='='){
              return new Lava(pos,new Vec(2,0));
          }else if(ch=='|'){
              return new Lava(pos,new Vec(0,2));
          }else if(ch=='v'){
              return new Lava(pos,new Vec(0,3),pos);
          }
      }
  }
  Lava.prototype.size = new Vec(1,1);

  /**
   * Notice the ways we create different lava with different speeds, 
   * based on the character we created the actor with. That's why we needed 
   * that character in class Level !!
   * Now, we also have a reset property that is equal to the vector holding the initial position
   * of the Lava
   */

   /**Coin */
   class Coin{
       constructor(pos,basePos,wobble){
           this.pos = pos;
           this.basePos = basePos;
           this.wobble = wobble;
       }
       get type(){return 'coin';}
       static create(pos){
           let basePos = pos.plus(new Vec(0.2,0.1));
           return new Coin(basePos,basePos,Math.random()*Math.PI*2);
       }
   }
   /**One thing we notice about the Coin class is that it 
    * has pos,basePos, and wobble, unlike these other actors, 
    * with speeds etc.
    */
   Coin.prototype.size = new Vec(0.6,0.6);
   const levelChars = {
       '.':'empty',
       '#':'wall',
       '+':'lava',
       '@':Player,
       'o':Coin,
       '=':Lava,
       'v':Lava,
       '|':Lava
   };
   /**The plot thins up. We have pretty much created our classes
    * 
    * Yet, it hasn't concluded on a good note, and we therefore know there is
    * more to come. Why, firstly, we still have to know how speed will act. It didn't
    * make sense to introduce it if we had to end like this.
    * Also, we don't have no game yet. Then, these actors are not
    * doing anything yet, apart from coming into existence and holding a bunch
    * of properties
    */

   /**Now, we start writing the drawing program */
   function elt(name,attrs,...children){
       let element = document.createElement(name);
       for(let attr in attrs){
           element.setAttribute(attr,attrs[attr]);
       }
       for(let child of children){
           element.appendChild(child);
       }
       return element;
   }
   /**Now we write the class for our display */
   class DOMDisplay{
       constructor(parent,level){
           this.dom = elt('div',{class:'game'},drawGrid(level));
           this.actorLayer = null;
           parent.appendChild(this.dom);
       }
       clear(){
           this.dom.remove();
       }
   }
   /**Now, this is interesting. What we want to see is
    * how all these different classes that all hold actors in one form
    * or another fit into each other
    * Also, we have another function drawGrid
    */
   const scale = 20;
   function drawGrid(level){
       return elt('table',{class:'background',
    style:`width:${level.width*scale}px`},
    ...level.rows.map(row=>{
        return elt('tr',{style:`height:${scale}px`},...row.map(type=>elt('td',{class:type})));
    }))
   }
   /**We draw actors seperately in a different div */
   function drawActors(actors){
       return elt('div',{},...actors.map((actor)=>{
           let rect = elt('div',{class:`actor ${actor.type}`});
           rect.style.height = `${actor.size.y*scale}px`
           rect.style.width = `${actor.size.x*scale}px`
           rect.style.left = `${actor.pos.x*scale}px`
           rect.style.top = `${actor.pos.y*scale}px`
           return rect;
       }));
   }
   /**Now, a way for DOMDisplay to refresh */
   DOMDisplay.prototype.syncState = function(state){
       if(this.actorLayer) this.actorLayer.remove();
       this.actorLayer = drawActors(state.actors);
       this.dom.appendChild(this.actorLayer);
       this.dom.className = `game ${state.status}`;
       this.scrollPlayerIntoView(state);
   }
   /**Now, this raises a few questions for me. Why are we setting this.dom.className again here
    * 
    * Is it changing in the middle ? We're redrawing the actors that's all, can game state change in that process?
    * Also, we see another person in the plot, scrollPlayerIntoView, which is likely a camera that follows the
    * player. It will be fun to implement
    */
   DOMDisplay.prototype.scrollPlayerIntoView = function(state){
       let width = this.dom.clientWidth;
       let height = this.dom.clientHeight;
       let left = this.dom.scrollLeft;
       let top = this.dom.scrollTop;
       let right = left + width;
       let bottom = top + height;
       let margin = width/3;
       let player = state.player;
       let center = player.pos.plus(player.size.times(0.5)).times(scale);
       if(center.x<left+margin){
           console.log("need to scroll");
           this.dom.scrollLeft = center.x - margin;
       }
       else if(center.x>right-margin){
           console.log("need to scroll");
           this.dom.scrollLeft = center.x + margin - width;
       }
       if(center.y<top+margin){
           this.dom.scrollTop = center.y - margin;
       }
       else if(center.y>bottom-margin){
           this.dom.scrollTop = center.y + margin - height;
       }
   }
   /**The above function is interesting in that there is some layout math going on
    * To figure that math, I will probably write another document someday. I do have a rough draft of why
    * this works the way it does. Which I'll put online anyway
    */
   /**Now comes the fun part. The interactions and collisions */
   Level.prototype.touches = function(pos,size,type){
       let xStart = Math.floor(pos.x);
       let xEnd = Math.ceil(pos.x+size.x);
       let yStart = Math.floor(pos.y);
       let yEnd = Math.ceil(pos.y+size.y);
       for(var y=yStart;y<yEnd;y++){
           for(var x=xStart;x<xEnd;x++){
               let isOutside = x<0 || x>=this.width || y<0 || y>=this.height;
               let here = isOutside?"wall":this.rows[y][x];
               if(here==type) return true;
           }
       }
       return false;
   }
   State.prototype.update = function(time,keys){
       let actors = this.actors.map(actor=>actor.update(time,this,keys));
       let newState = new State(this.level,actors,this.status);
       if(newState.status!="playing") return newState;
       let player = newState.player;
       if(this.level.touches(player.pos,player.size,'lava'))
       return new State(this.level,this.actors,'lost');
       for(let actor of actors){
           if(actor!=player&&overlap(actor,player)){
               newState = actor.collide(newState);
           }
       }
       return newState;
       }
   /**some things that are happening:
    * Time and keys as parameters, those are new
    * also, actors now have an update method each
    * Actors also have a collide method now, except the player, because
    * collide is being called by an actor when player collides with it
    * Player can't collide with itself
    * Now, we write the actor update methods
    */
    Lava.prototype.update = function(time,state){
       let newPos = this.pos.plus(this.speed.times(time));
       if(!state.level.touches(newPos,this.size,"wall")){
           return new Lava(newPos,this.speed,this.reset);
       }
       else if(this.reset){
           return new Lava(this.reset,this.speed,this.reset);
       }
       else{
           return new Lava(this.pos,this.speed.times(-1));
       }
   }
   const wobbleSpeed = 8, wobbleDist = 0.07;
   Coin.prototype.update = function(time){
    let wobble = this.wobble + time*wobbleSpeed;
    let wobblePos = Math.sin(wobble)*wobbleDist;
    return new Coin(this.basePos.plus(new Vec(0,wobblePos)),this.basePos,wobble);
   }

   const playerXSpeed = 7;
   const gravity = 30;
   const jumpSpeed = 17;

   Player.prototype.update = function(time,state,keys){
    let xSpeed = 0;
    if(keys.ArrowLeft) xSpeed-=playerXSpeed;
    if(keys.ArrowRight) xSpeed+=playerXSpeed;
    let pos = this.pos;
    let movedX = pos.plus(new Vec(xSpeed*time,0));
    if(!state.level.touches(movedX,this.size,'wall')){
        pos = movedX;
    }
    let ySpeed = this.speed.y + gravity*time;
    let movedY = pos.plus(new Vec(0,ySpeed*time));
    if(!state.level.touches(movedY,this.size,'wall')){
        pos = movedY;
    }
    else if(keys.ArrowUp && ySpeed>0){
        ySpeed = -jumpSpeed;
    }
    else{
        ySpeed = 0;
    }
    return new Player(pos,new Vec(xSpeed,ySpeed)); 
   }
   /**I missed the collide methods and overlap */
   function overlap(actor1,actor2){
       return actor1.pos.x+actor1.size.x > actor2.pos.x &&
       actor1.pos.x < actor2.pos.x + actor2.size.x &&
       actor1.pos.y + actor1.size.y > actor2.pos.y &&
       actor1.pos.y<actor2.pos.y + actor2.size.y;
   }
   Lava.prototype.collide = function(state){
       return new State(state.level,state.actors,'lost');
   }
   Coin.prototype.collide = function(state){
       let filtered = state.actors.filter(a=>a!=this);
       let status = state.status;
       if(!filtered.some(e=>e.type=='coin')) status = 'won';
       return new State(state.level,filtered,status);
   }
   /**Now we find a way to track keypresses  */
   function trackKeys(keys){
       let down = Object.create(null);
       function track(event){
           if(keys.includes(event.key)){
               down[event.key]=event.type=='keydown';
               event.preventDefault();
           }
       }
       window.addEventListener('keydown',track);
       window.addEventListener('keyup',track);
       return down;
   }
   const arrowKeys = trackKeys(["ArrowLeft","ArrowRight","ArrowUp"]);

   /**
    * Now we will run the game
    */
   function runAnimation(frameFunc){
       let lastTime = null;
       function frame(time){
           if(lastTime!=null){
               let timeStep = Math.min(time - lastTime,100)/1000;
               if(frameFunc(timeStep)==false)return;
           }
           lastTime = time;
           requestAnimationFrame(frame);
       }
       requestAnimationFrame(frame);
   }
   /**Some things I observe there
    * There is an encapsulated function that is calling itself, 
    * also we have to define frameFunc, which may return false to halt the animation
    */
   /**Now we create a runlevel function, that takes a level,and a display class */
function runLevel(level,Display){
    let display = new Display(document.body,level);
    let state = State.start(level);
    let ending = 1;
    return new Promise(resolve=>{
        runAnimation(time=>{
            state = state.update(time,arrowKeys);
            display.syncState(state);
            if(state.status=='playing'){
                return true;
            }
            else if(ending>0){
                ending-=time;
            }
            else{
                display.clear();
                resolve(state.status);
                return false;
            }
        });
    })
}
/**Some questions I have from this: Why are we using a Promise in the above?
 * Also, then, I noticed that the way the functions are built on top of each other is so cool
 * For example, the function passed to runAnimation is a type of frameFunc, which gets the ability
 * to return false to halt the animation (refer to the runAnimation function above).
 * Also, by the time the animation halts, we've already resolved our Promise, which means if there
 * is a function awaiting(this word is foreshadowing), then that will run too.
 */
async function runGame(plans, Display){
    for(let level=0;level<plans.length;){
        let status = await runLevel(new Level(plans[level]),Display);
        if(status=='won') level++;
    }
    console.log("You won !");
}

var GAME_LEVELS = [`                                                    
................................................................................
................................................................................
................................................................................
................................................................................
................................................................................
................................................................................
..................................................................###...........
...................................................##......##....##+##..........
....................................o.o......##..................#+++#..........
.................................................................##+##..........
...................................#####..........................#v#...........
............................................................................##..
..##......................................o.o................................#..
..#.....................o....................................................#..
..#......................................#####.............................o.#..
..#..........####.......o....................................................#..
..#..@.......#..#................................................#####.......#..
..############..###############...####################.....#######...#########..
..............................#...#..................#.....#....................
..............................#+++#..................#+++++#....................
..............................#+++#..................#+++++#....................
..............................#####..................#######....................
................................................................................
................................................................................
`,`                                                                     
................................................................................
................................................................................
....###############################.............................................
...##.............................##########################################....
...#.......................................................................##...
...#....o...................................................................#...
...#................................................=.......................#...
...#.o........################...................o..o...........|........o..#...
...#.........................#..............................................#...
...#....o....................##########.....###################....##########...
...#..................................#+++++#.................#....#............
...###############....oo......=o.o.o..#######.###############.#....#............
.....#...............o..o.............#.......#......#........#....#............
.....#....................#############..######.####.#.########....########.....
.....#.............########..............#...........#.#..................#.....
.....#..........####......####...#####################.#..................#.....
.....#........###............###.......................########....########.....
.....#.......##................#########################......#....#............
.....#.......#................................................#....#............
.....###......................................................#....#............
.......#...............o...........................................#............
.......#...............................................o...........#............
.......#########......###.....############.........................##...........
.............#..................#........#####....#######.o.........########....
.............#++++++++++++++++++#............#....#.....#..................#....
.............#++++++++++++++++++#..........###....###...####.o.............#....
.............####################..........#........#......#.....|.........#....
...........................................#++++++++#......####............#....
...........................................#++++++++#.........#........@...#....
...........................................#++++++++#.........##############....
...........................................##########...........................
................................................................................
`,`
......................................#++#........................#######....................................#+#..
......................................#++#.....................####.....####.................................#+#..
......................................#++##########...........##...........##................................#+#..
......................................##++++++++++##.........##.............##...............................#+#..
.......................................##########++#.........#....................................o...o...o..#+#..
................................................##+#.........#.....o...o....................................##+#..
.................................................#+#.........#................................###############++#..
.................................................#v#.........#.....#...#........................++++++++++++++##..
.............................................................##..|...|...|..##............#####################...
..............................................................##+++++++++++##............v........................
...............................................................####+++++####......................................
...............................................#.....#............#######........###.........###..................
...............................................#.....#...........................#.#.........#.#..................
...............................................#.....#.............................#.........#....................
...............................................#.....#.............................##........#....................
...............................................##....#.............................#.........#....................
...............................................#.....#......o..o.....#...#.........#.........#....................
...............#######........###...###........#.....#...............#...#.........#.........#....................
..............##.....##.........#...#..........#.....#.....######....#...#...#########.......#....................
.............##.......##........#.o.#..........#....##...............#...#...#...............#....................
.....@.......#.........#........#...#..........#.....#...............#...#...#...............#....................
....###......#.........#........#...#..........#.....#...............#...#####...######......#....................
....#.#......#.........#.......##.o.##.........#.....#...............#.....o.....#.#.........#....................
++++#.#++++++#.........#++++++##.....##++++++++##....#++++++++++.....#.....=.....#.#.........#....................
++++#.#++++++#.........#+++++##.......##########.....#+++++++##+.....#############.##..o.o..##....................
++++#.#++++++#.........#+++++#....o.................##++++++##.+....................##.....##.....................
++++#.#++++++#.........#+++++#.....................##++++++##..+.....................#######......................
++++#.#++++++#.........#+++++##.......##############++++++##...+..................................................
++++#.#++++++#.........#++++++#########++++++++++++++++++##....+..................................................
++++#.#++++++#.........#++++++++++++++++++++++++++++++++##.....+..................................................
`,`
..............................................................................................................
..............................................................................................................
..............................................................................................................
..............................................................................................................
..............................................................................................................
........................................o.....................................................................
..............................................................................................................
........................................#.....................................................................
........................................#.....................................................................
........................................#.....................................................................
........................................#.....................................................................
.......................................###....................................................................
.......................................#.#.................+++........+++..###................................
.......................................#.#.................+#+........+#+.....................................
.....................................###.###................#..........#......................................
......................................#...#.................#...oooo...#.......###............................
......................................#...#.................#..........#......#+++#...........................
......................................#...#.................############.......###............................
.....................................##...##......#...#......#................................................
......................................#...#########...########..............#.#...............................
......................................#...#...........#....................#+++#..............................
......................................#...#...........#.....................###...............................
.....................................##...##..........#.......................................................
......................................#...#=.=.=.=....#............###........................................
......................................#...#...........#...........#+++#.......................................
......................................#...#....=.=.=.=#.....o......###.......###..............................
.....................................##...##..........#.....................#+++#.............................
..............................o...o...#...#...........#.....#................##v........###...................
......................................#...#...........#..............#.................#+++#..................
.............................###.###.###.###.....o.o..#++++++++++++++#...................v#...................
.............................#.###.#.#.###.#..........#++++++++++++++#........................................
.............................#.............#...#######################........................................
.............................##...........##.........................................###......................
..###.........................#.....#.....#.........................................#+++#................###..
..#.#.........................#....###....#..........................................###.................#.#..
..#...........................#....###....#######........................#####.............................#..
..#...........................#...........#..............................#...#.............................#..
..#...........................##..........#..............................#.#.#.............................#..
..#.......................................#.......|####|....|####|.....###.###.............................#..
..#................###.............o.o....#..............................#.........###.....................#..
..#...............#####.......##..........#.............................###.......#+++#..........#.........#..
..#...............o###o.......#....###....#.............................#.#........###..........###........#..
..#................###........#############..#.oo.#....#.oo.#....#.oo..##.##....................###........#..
..#......@..........#.........#...........#++#....#++++#....#++++#....##...##....................#.........#..
..#############################...........#############################.....################################..
..............................................................................................................
..............................................................................................................
`,`
..................................................................................................###.#.......
......................................................................................................#.......
..................................................................................................#####.......
..................................................................................................#...........
..................................................................................................#.###.......
..........................o.......................................................................#.#.#.......
.............................................................................................o.o.o###.#.......
...................###................................................................................#.......
.......+..o..+................................................#####.#####.#####.#####.#####.#####.#####.......
.......#.....#................................................#...#.#...#.#...#.#...#.#...#.#...#.#...........
.......#=.o..#............#...................................###.#.###.#.###.#.###.#.###.#.###.#.#####.......
.......#.....#..................................................#.#...#.#...#.#...#.#...#.#...#.#.....#.......
.......+..o..+............o..................................####.#####.#####.#####.#####.#####.#######.......
..............................................................................................................
..........o..............###..............................##..................................................
..............................................................................................................
..............................................................................................................
......................................................##......................................................
...................###.........###............................................................................
..............................................................................................................
..........................o.....................................................#......#......................
..........................................................##.....##...........................................
.............###.........###.........###.................................#..................#.................
..............................................................................................................
.................................................................||...........................................
..###########.................................................................................................
..#.........#.o.#########.o.#########.o.##................................................#...................
..#.........#...#.......#...#.......#...#.................||..................#.....#.........................
..#..@......#####...o...#####...o...#####.....................................................................
..#######.....................................#####.......##.....##.....###...................................
........#=..................=................=#...#.....................###...................................
........#######################################...#+++++++++++++++++++++###+++++++++++++++++++++++++++++++++++
..................................................############################################################
..............................................................................................................
`];
window.onload = function(){
    this.runGame(this.GAME_LEVELS,DOMDisplay);
}