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
   const simpleLevel = new Level(simpleLevelPlan);
   console.log(`${simpleLevel.width} by ${simpleLevel.height}`);
   console.log("ehl")