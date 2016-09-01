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
I came up with what I believe is a better solution with the following advantages:

 - no need for 'this._', that/self, weakmaps, symbols etc. Clear and straightforward 'class' code 

 - private variables and methods are _really_ private and have the correct 'this' binding

 - No use of 'this' at all which means clear code that is much less error prone (as a side note, before ES6 'this' was a necessary evil, now it is simply evil, an evil we can do without).
 
 - public interface is clear and separated from the implementation as a proxy to private methods

## Code ##

**Boilerplate - Define 'New' for all functions:**

    if (typeof Function.prototype.New === 'undefined') {
    	Function.prototype.New= function(...args) {
    		let opts={ ctor: null };  // ATM only ctor,
    		let pub=Reflect.construct(this, [ opts ]); // create & get public interface
    		Object.setPrototypeOf(pub, this.prototype); // fix prototype for instanseof
    		if (args.length>0 && !opts.ctor) throw('New with arguments but missing ctor !'); // no ctor to send arguments
    		if (opts.ctor) opts.ctor(...args); // call ctor with arguments
    		return pub;
    	}
    }

    
**Simple class - no constructor or attributes:**

    function Counter() {
    	// private variable & methods
    	let count=0;
    
    	function next() {
    	  return ++count;
    	}
    	
    	function reset(newCount) {
    	  count=newCount;
    	}
    
    	// public interface
    	return {
    		next,  // get next value
    		reset, // reset value
    	}
    }
    
    let counter=Counter.New();
    console.log(counter instanceof Counter);
    counter.reset(100);
    console.log('Counter next = '+counter.next());
     

   

**Complete class - with constructor and attributes:**

    function ColoredDiv(opts) {
    	// private variable & methods
    	let elem;
    	let state; // true=red, false=blue
    
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
    	opts.ctor = function(elem_, state_=true) {
    	  elem=elem_;
    	  state=state_
    
    	  elem.onclick = e => {
    	    e.currentTarget.style.fontSize='12px';
    	    toggle();
    	  }
    	  
    	  toggle(state_);
    	}
    	
    	// public interface
    	return {
    		red,  // color elem red
    		blue, // color elem blue
    		get state() { return state; },
    		set state(s) { toggle(s); }
    	}
    }
    
    let myDiv1=document.getElementById('myDiv1');
    let coloredDiv = ColoredDiv.New(myDiv1);
    console.log(coloredDiv instanceof ColoredDiv);
    
    coloredDiv.blue();

## Caviets ##

 - constructor has to be defined with opts.ctor so that 'New' can call it with the right arguments, a bit ugly but easy enough
 
 - The way the code is ATM there is not much support for inheritance, but I'm sure this can be added quite easily. Personally I am trying to avoid inheritance in favor of composition.

## Example ##

See a running example at [plunkr](https://plnkr.co/edit/aLp6Jj1MAUo8qBM7GvPs)




