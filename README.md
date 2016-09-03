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

## Solution ##
Below is a better, simpler solution with the following advantages:

 - no need for 'this._', that/self, weakmaps, symbols etc. Clear and straightforward 'class' code 

 - private variables and methods are _really_ private and have the correct 'this' binding

 - No use of 'this' at all which means clear code that is much less error prone (as a side note, before ES6 'this' was a necessary evil, now it is simply evil, an evil we can do without).
 
 - public interface is clear and separated from the implementation as a proxy to private methods

 - supports static class methods

 - easy support for composition



## Usage ##

 - `<script src="https://rawgit.com/kofifus/BetterES6Classes/master/new.js"></script>`

 - a 'class' is a function with no parameters - `function C()`
 
 - return a dictionary of public methods (the puclic interface) from 'class'

 - if you need a constructor define a 'ctor' method and return it with the public interface. 'New' will call 'ctor' with the arguments passed to 'New'.

 - define static 'class' methods on the class itself - `C.staticM = function(..)`. Do not add them to the public interface or use 'this' inside them.

 - create an instance with 'New' - `var o=C.New(..);
 - for composition return a 'New' 'class' or array of classes from the ctor: ` 

     - `return ClassToCompose.New(..);` 
     - `return [CtoCompose1.New(..), CtoCompose2.New(..)];`


## Examples##
**Simple class - no constructor**

    function Counter() {
    	// private variables & methods
    	let count=0;
    
    	function advance() {
    		return ++count;
    	}
    	
    	function reset(newCount) {
    		count=(newCount || 0);
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
    console.log(Object.getOwnPropertyNames(counter)); // ["advance", "reset", "value"]

**Complete class (with constructor, attributes, static methods)**

// Complete class - with constructor, attributes & static methods



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
    		//console.log(this instanceof ColoredDiv); // true
    		if (!elem_ || !elem_.tagName) throw 'ColoredDiv ctor invalid params';
    		elem=elem_;
    		state=state_
    
    		// use e.currentTarget instead of 'this' in event handlers
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

**composition**

    // class with no ctor
    function C1() {
    	let v=1;
    	
    	function getC1V() {
    		return v;
    	}
    	
    	function getV() {
    		return v;
    	}
    	
    	return {
    		getC1V,
    		getV
    	};
    }
    
    // class with ctor
    function C2() {
    	let v;
    	
    	function getC2V() {
    		return v;
    	}
    	
    	function getV() {
    		return v;
    	}
    	
    	function ctor(v_) {
    		v=(v_ || -1);
    	}
    	
    	return {
    		ctor,
    		getC2V,
    		getV
    	};
    }
    
    // class with ctor and composed with C2(2)
    function C3() {
    	let v;
    	
    	function getC3V() {
    		return v;
    	}
    	
    	function getV() {
    		return v;
    	}
    	
    	function ctor(v_) {
    		v=(v_ || -1);
    		return C2.New(v-1); // compose C2
    	}
    
    	return {
    		ctor,
    		getC3V,
    		getV
    	};
    }
    
    // class with ctor and composed with C1 and C3(3)
    function C4() {
    	let v;
    	
    	function getC4V() {
    		return v;
    	}
    	
    	function getV() {
    		return v;
    	}
    	
    	function ctor(v_) {
    		v=(v_ || -1);
    		return [C1.New(), C3.New(v-1)]; // compose C1 & C3
    	}
    	
    	return {
    		ctor,
    		getC4V,
    		getV
    	};
    }
    
    
    let c3=C3.New(3); // composed with C2
    console.log('c3 C2V = '+c3.getC2V()); // 2 from composing C2
    console.log('c3 C3V = '+c3.getC3V()); // 3
    console.log('c3 V = '+c3.getV());     // 3
    
    let c4=C4.New(4); // composed with C1 & C3
    console.log('c4 C1V = '+c4.getC1V()); // 1 from composing C1
    console.log('c4 C2V = '+c4.getC2V()); // 2 from composing C3
    console.log('c4 C3V = '+c4.getC3V()); // 3 from composing C3
    console.log('c4 C4V = '+c4.getC4V()); // 4
    console.log('c4 V = '+c4.getV());     // 4

## Caviets ##

 - You need to remember to return the ctor with the public interface. The ctor will not be available after construction ends.

 - You cannot use shorthand syntax for private methods.

 - This pattern does not work well with inheritance, that is an object created with Derived.New() cannot access methods from Base. Personally I am trying to avoid inheritance (see [here](https://javascriptweblog.wordpress.com/2010/12/22/delegation-vs-inheritance-in-javascript/)) and use composition.

## Example ##

See a running example at [plunkr](https://plnkr.co/edit/MUnQABDe5seoVlXOrqfQ)















