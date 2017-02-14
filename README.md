## Background ##
<br/>
There are various solutions to creating Javascript 'classes' with public and private variables and methods. The current common solutions include putting public methods into 'this' ([see](http://javascript.crockford.com/private.html)), Private data via ES6 class constructor ([see](http://exploringjs.com/es6/ch_classes.html)), Private data via a '_' naming convention ([see](http://exploringjs.com/es6/ch_classes.html)), Private data via WeakMaps ([see](http://exploringjs.com/es6/ch_classes.html)), Private data via Symbols ([see](http://exploringjs.com/es6/ch_classes.html)) and others.

The above methods have the following disadvantages:

 - Ugly syntax - ending up with lots of 'this', 'this._', defining methods inside the constructor etc
 
 - Error prone - especially if a user decides to call a 'private' method 

 - Complicated - the use of WeakMaps or Symbols make the code hard to read with lots of extra 'boiler' code

 - No clear separation of the public interface (header) of the class from the implementation.

## Solution ##
<br/>
Below is a better, simpler solution with the following advantages:

 - no need for 'this', 'this._', that/self, weakmaps, symbols etc. Clear and straightforward 'class' code 

 - private variables and methods are _really_ private

 - public interface is clear and separated from the implementation as a proxy to private methods

 - easy support for composition



## Usage ##
<br/>
 - `<script src="https://rawgit.com/kofifus/New/master/new.min.js"></script>`

 - a class is a function with no parameters - `function C()`
 
 - return a dictionary of public methods (the puclic interface) from 'class'

  - if you need to store the instance ('self'), get it from 'this' in the constructor ('class' function).

 - create an instance with New - `let o=C.New(..);`

 - for composition return add a 'composed' property to the returned header with a 'New'ed class or array of 'New'ed classes: ` 

     - `return { composed: ClassToCompose.New(..), ... }` 
     - `return { composed: [CtoC1.New(..), CtoC2.New(..)], ...`


## Examples##
<br/>
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
<br/>
**Complete class (constructor & attributes & self)**

```
function ColoredDiv(elem, state=true) {
	// private variables & methods
	
	const self=this; // useful to transfer the instance to callbacks etc

	function toggle(newState) {
		let oldState=state;
		if (typeof newState==='undefined') state=!state; else state=newState;
		elem.style.color=(state ? 'red' : 'blue');
		console.log('self instanceof ColoredDiv == '+(self instanceof ColoredDiv)); // true
	}

	function red() { toggle(true); }
	function blue() { toggle(false); }
	
	// constructor

	//console.log('this instanceof ColoredDiv = '+this instanceof ColoredDiv); // true
	if (!elem || !elem.tagName) throw 'ColoredDiv ctor invalid params';
	elem.onclick = e => toggle() ;
	toggle(state);

	// public interface
	return {
		red,  // color elem red
		blue, // color elem blue
		get state() { return state; },
		set state(s) { toggle(s); }
	};
}

let myDiv1=document.getElementById('myDiv1');
let coloredDiv = ColoredDiv.New(myDiv1);
console.log('coloredDiv instanceof ColoredDiv === '+(coloredDiv instanceof ColoredDiv)); // true
coloredDiv.blue();

let myDiv2=document.getElementById('myDiv2');
let coloredDiv2 = ColoredDiv.New(myDiv2, false);
setTimeout( () => {	coloredDiv2.state=true; }, 1000);
```
<br/>
**composition**
```
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

function C2(v) {
	function getC2V() {
		return v;
	}
	
	function getV() {
		return v;
	}
	
	if (typeof v === 'undefined') v=-1;

	return {
		getC2V,
		getV
	};
}

// class with ctor and composed with C2(2)
function C3(v) {
	function getC3V() {
		return v;
	}
	
	function getV() {
		return v;
	}
	
	if (typeof v === 'undefined') v=-1;

	return {
		composed: C2.New(v-1), // compose C2
		getC3V,
		getV
	};
}

// class with ctor and composed with C1 and C3(3)
function C4(v) {
	function getC4V() {
		return v;
	}
	
	function getV() {
		return v;
	}
	
	if (typeof v === 'undefined') v=-1;

	function ctor(v_) {
		v=(typeof v_ === 'undefined' ? -1 : v_ );
		return [C1.New(), C3.New(v-1)]; // compose C1 & C3
	}
	
	return {
		composed: [C1.New(), C3.New(v-1)], // compose C1 & C3
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
```
## Notes ##
<br/>
 - Create instances with inst=MyClass.New(...) instead of inst=new MyClass(...)

 - Remember to return the ctor with the public interface. The ctor will not be available after construction ends.

 - You cannot use shorthand syntax for private methods.

 - 'this' inside 'ctor' is the instance and can be stored for later if needed (see 'self' in the example). 'this' is 'undefined' inside all other private methods. Don't use 'this' ! use closures .... before ES6 'this' was a necessary evil, now it is simply evil.
 
 - This pattern does not work well with inheritance, that is an object created with Derived.New() cannot access methods from Base. Personally I am trying to avoid inheritance (see [here](https://javascriptweblog.wordpress.com/2010/12/22/delegation-vs-inheritance-in-javascript/)) and use composition.

## Example ##
<br/>
See a running example at [plunkr](https://plnkr.co/edit/CsXGSdZs1sfnbhwj8ldT)
















