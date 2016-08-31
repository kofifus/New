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

 - No use of 'this' at all which means clear code that is much less error prone
 
 - public interface is clear and separated from the implementation as a proxy to private methods

## Boiler Code ##

**Define 'New' method for all functions:**

    "use strict";
    
    Function.prototype.New = function(...args) {
      let inst=Object.create(null); // the new instance
      let ctorContainer={ ctor: null }; 
      let pub=this.call(inst, ctorContainer); // get public interface
      if (args.length>0 && !ctorContainer.ctor) throw('New with arguments but missing ctor !'); // no ctor to send arguments
      if (ctorContainer.ctor) ctorContainer.ctor(...args); // call ctor with arguments
      return pub;
    }
    
**Simple class - no constructor or attributes:**

    
    function Class() {
    	// private interface, 'this' here is the instance
    
    	// private variables
    	let privateVar=0;
    
    	// private methods - use ONLY arrow functions for correct 'this' binding
    	let method = (v1, v2) => {
    	  return privateVar+v1+v2; // do something
    	};
    	
    	// public interface
    	return {
    		method,  // do something
    	};
    }
      
    let instance=Class.New();
    instance.method(0, 1);

**Complete class - with constructor and attributes:**

    
    function ColoredElem(ctor) {
    	// private variables
    	let elem, elemColor='red';
    
    	// private methods - use ONLY arrow functions for correct 'this' binding
    	let method1 = () => {
    	  elem.style.color=elemColor;
    	  return elemColor;
     };
   
     let changeColor = () => {
    	  return method1(); // call another private method
    	};
 	
    	// constructor
    	ctor.ctor = elem_ => {
    	  elem=elem_;
    
    	  elem.onclick = e => {
    	    e.currentTarget.style.fontSize='12px';
    	  };
    	};
    
    	// public interface
    	return {
    		changeColor,  // change color
    		set color(c) { elemColor=c; }
    	};
    }
    
    let myDiv=document.getElementById('myDiv');
    let coloredElem=ColoredElem.New(myDiv1);
    coloredElem.color='blue';
    coloredElem.changeColor();
    
    
## Caviets ##

 - constructor has to be defined with ctor.ctor so as to be known to 'New', a bit ugly but easy enough
 
 - The way the code is ATM there is not much support for inheritance, but I'm sure this can be added quite easily. Personally I am trying to avoid inheritance in favor of composition.

## Example ##

See a running more elaborate example at [plunkr](https://plnkr.co/edit/aLp6Jj1MAUo8qBM7GvPs)

