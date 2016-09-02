## Background ##

There are various solutions to creating Javascript 'classes' with public and private variables and methods. The current common solutions are:

 - putting public methods into 'this' and using closures with the 'that=this' hack for private methods.
(see: [http://javascript.crockford.com/private.html](http://javascript.crockford.com/private.html))

 - Private data via ES6 class constructor
 (see: [http://exploringjs.com/es6/ch_classes.html](http://exploringjs.com/es6/ch_classes.html))
 
 - Private data via a '_' naming convention
  (see: [http://exploringjs.com/es6/ch_classes.html](http://exploringjs.com/es6/ch_classes.html))

 - Private data via WeakMaps
  (see: [http://exploringjs.com/es6/ch_classes.html](http://exploringjs.com/es6/ch_classes.html))

 - Private data via Symbols
  (see: [http://exploringjs.com/es6/ch_classes.html](http://exploringjs.com/es6/ch_classes.html))

<br />
I ended up dissatisfied with all of these solutions for the following reasons:

 - Ugly syntax - ending up with lot's of 'this._', defining methods inside the constructor etc
 
 - Error prone - especially the issue of 'this' inside private methods not referring to the instance unless you remember the confusing 'that=this' hack

 - Complicated - the use of WeakMaps or Symbols make the code hard to read with lot's of extra 'boiler' code

 - No clear separation of the public interface (proxy) of the class from the implementation

Solution
---------
Below is a better, simpler solution with the following advantages:

 - no need for 'this._', that/self, weakmaps, symbols etc. Clear and straightforward 'class' code 

 - private variables and methods are _really_ private and have the correct 'this' binding

 - No use of 'this' at all which means clear code that is much less error prone (as a side note, before ES6 'this' was a necessary evil, now it is simply evil, an evil we can do without).
 
 - public interface is clear and separated from the implementation as a proxy to private methods

 - supports static class methods

## Code ##

**Boilerplate - Define 'New' for all functions:**

    if (typeof Function.prototype.New === 'undefined') {
    	Function.prototype.New= function(...args) {
    		// create instance & get interface
    		let pubInterface=Reflect.construct(this, []); 
    		if (!pubInterface || typeof pubInterface!=='object' || Array.isArray(pubInterface) || typeof pubInterface==='function' || Object.keys(pubInterface).length===0) throw 'New - invalid interface';
    		Object.setPrototypeOf(pubInterface, this.prototype); // fix prototype for instanceof
    
    		// ctor
    		let ctor=pubInterface.ctor;
    		if (ctor && typeof ctor!=='function') throw 'New - invalid ctor';
    		if (args.length>0 && !ctor) throw('New - missing ctor'); // no ctor to send arguments
    		delete pubInterface.ctor; // remove ctor from interface
    		if (ctor) ctor(...args); 
    
    		return pubInterface;
    	}
    }

**Simple class - no constructor or attributes:**

    function Counter() {
    	// private variables & methods
    	let count=0;
    
    	function advance() {
    		return ++count;
    	}
    	
    	function reset(newCount) {
    		count=newCount;
    	}
    	
    	function value() {
    		return count;
    	}
    
    	// public interface
    	return {
    		advance,  // advance counter and get new value
    		reset, // reset value
    		value  // get value
    	}
    }
    	
    let counter=Counter.New();
    console.log(counter instanceof Counter); // true
    counter.reset(100);
    console.log('Counter next = '+counter.advance()); // 101

**Complete class - with constructor, attributes & static methods:**

    function ColoredDiv() {
    	// private variables & methods
    	let elem;
    	let state; // true=red, false=blue
    
    	// create static instance counter
    	if (!ColoredDiv.staticCounter) ColoredDiv.staticCounter=Counter.New();
    
    	function toggle(newState) {
    		let oldState=state;
    		if (typeof newState==='undefined') state=!state; else state=newState;
    		elem.style.color=(state ? 'red' : 'blue');
    	}
    
    	function red() {
    		toggle(true);
    	}
    	
    	function blue() {
    		toggle(false);
    	}
    	
    	// constructor
    	function ctor(elem_, state_=true) {
    		console.log('ctor');
    		elem=elem_;
    		state=state_
    
    		elem.onclick = e => toggle() ;
    		
    		toggle(state_);
    		
    		// update static instance counter
    		ColoredDiv.staticCounter.advance();
    	}
    	
    	// static methods
    	ColoredDiv.NumInstances = function() {
    		return ColoredDiv.staticCounter.value();
    	}
    
    	// public interface
    	return {
    		ctor,
    		red,  // color elem red
    		blue, // color elem blue
    		get state() { return state; },
    		set state(s) { toggle(s); }
    	};
    }
    
    let myDiv1=document.getElementById('myDiv1');
    let coloredDiv = ColoredDiv.New(myDiv1);
    console.log(coloredDiv instanceof ColoredDiv); // true
    coloredDiv.blue();
    
    let myDiv2=document.getElementById('myDiv2');
    let coloredDiv2 = ColoredDiv.New(myDiv2, false);
    setTimeout( () => {
    	coloredDiv2.state=true;
    }, 1000);

console.log(ColoredDiv.NumInstances()); // 2
## Caviets ##

 - You need to remember to return the ctor with the public interface. The ctor will not be available construction ends.

 - The way the code is ATM there is not much support for inheritance, but I'm sure this can be added quite easily. Personally I am trying to avoid inheritance in favor of composition.

## Example ##

See a running example at [plunkr](https://plnkr.co/edit/aLp6Jj1MAUo8qBM7GvPs)






