## Background
There are various solutions to creating Javascript 'classes' with public and private variables and methods. The current common solutions include putting public methods into 'this' ([see](http://javascript.crockford.com/private.html)), Private data via ES6 class constructor ([see](http://exploringjs.com/es6/ch_classes.html)), Private data via a '_' naming convention ([see](http://exploringjs.com/es6/ch_classes.html)), Private data via WeakMaps ([see](http://exploringjs.com/es6/ch_classes.html)), Private data via Symbols ([see](http://exploringjs.com/es6/ch_classes.html)) and others.

The above methods have the following disadvantages:

 - Ugly syntax - ending up with lots of 'this', 'this._', defining methods inside the constructor etc
 
 - Error prone - especially if a user decides to call a 'private' method 

 - Complicated - the use of WeakMaps or Symbols make the code hard to read with lots of extra 'boiler' code

 - No clear separation of the public interface (header) of the class from the implementation.

## Solution

Below is a better, simpler solution with the following advantages:

 - no need for this, this.\_, that/self, weakmaps, symbols etc. Clear and straightforward 'class' code 

 - private variables and methods are _really_ private in closure

 - public interface is clear, separated from the implementation ande defined at the top of the class

 - easy support for composition

## Usage
 - `<script src="https://rawgit.com/kofifus/New/master/new.min.js"></script>`

 - a class is a function with no parameters - `function C()`
 
 - return a dictionary of public methods (the puclic interface) from 'class'

 - if you need to store the instance ('self'), get it from 'this' in the constructor ('class' function).

 - create an instance with New - `let o=C.New(..);`

 - for composition return add a 'composed' property to the returned header with a 'New'ed class or array of 'New'ed classes: ` 

     - `return { composed: ClassToCompose.New(..), ... }` 
     - `return { composed: [CtoC1.New(..), CtoC2.New(..)], ...`


## Examples
**Simple class**
```javascript
function Counter() {
  // public interface
  const proxy = {
    advance,  // advance counter and get new value
    reset,    // reset value
    value     // get value
  }
	
  // private variables and methods
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
    
  return proxy;
}
    	
    let counter=Counter.New();
    console.log(counter instanceof Counter); // true
    counter.reset(100);
    console.log('Counter next = '+counter.advance()); // 101
    console.log(Object.getOwnPropertyNames(counter)); // ["advance", "reset", "value"]
```

**Complete class (with 'self' and constructor code)**

```javascript
function ColoredDiv(elem, state=true) {
	// public interface
	const proxy = {
		red,  // color elem red
		blue, // color elem blue
		get state() { return state; }, // get toggle state
		set state(s) { toggle(s); }    // set toggle state
  	}

	// private variables and methods
	
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

	return proxy;
}

let myDiv1=document.getElementById('myDiv1');
let coloredDiv = ColoredDiv.New(myDiv1);
console.log('coloredDiv instanceof ColoredDiv === '+(coloredDiv instanceof ColoredDiv)); // true
coloredDiv.blue();

let myDiv2=document.getElementById('myDiv2');
let coloredDiv2 = ColoredDiv.New(myDiv2, false);
setTimeout( () => {	coloredDiv2.state=true; }, 1000);
```

**composition**
```javascript
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
		return [C1.New(), C3.New(v-1)]; // compose C1 and C3
	}
	
	return {
		composed: [C1.New(), C3.New(v-1)], // compose C1 and C3
		getC4V,
		getV
	};
}

let c3=C3.New(3); // composed with C2
console.log('c3 C2V = '+c3.getC2V()); // 2 from composing C2
console.log('c3 C3V = '+c3.getC3V()); // 3
console.log('c3 V = '+c3.getV());     // 3

let c4=C4.New(4); // composed with C1 and C3
console.log('c4 C1V = '+c4.getC1V()); // 1 from composing C1
console.log('c4 C2V = '+c4.getC2V()); // 2 from composing C3
console.log('c4 C3V = '+c4.getC3V()); // 3 from composing C3
console.log('c4 C4V = '+c4.getC4V()); // 4
console.log('c4 V = '+c4.getV());     // 4
```
## Notes

 - Create instances with inst=MyClass.New(...) instead of inst=new MyClass(...)

 - 'this' inside the constructor ('class' function) is the instance and can be stored for later if needed (see 'self' in the example). 'this' is 'undefined' inside all other private methods. You really only need to store 'this' in order to pass it back in event callback etc, don't use 'this' ! use closures .... before ES6 'this' was a necessary evil, now it is simply evil.
 
 - This pattern is not meant to work well with inheritance, that is an object created with Derived.New() cannot access methods from Base. Instead it supports composition (see [here](https://javascriptweblog.wordpress.com/2010/12/22/delegation-vs-inheritance-in-javascript/)).
 
 - Like any method that does not use prototypes, every instance will hold all it's private methods. However modern javascript engines are highly optimized for this and nexted functions overhead is just a functio object. Still, New may not be suitable where a very big number of instances of the 'class' are created.

## Example
<br/>
See a running example at [plunkr](https://plnkr.co/edit/plKDXuX9US7JCnYwVnp8)
















