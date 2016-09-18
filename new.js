"use strict";

// https://github.com/kofifus/New.js
if (typeof Function.prototype.New === 'undefined') {
	Function.prototype.New= function(...args) {
		// get public interface
		let header=this();
		if (!header || typeof header!=='object' || Array.isArray(header) || typeof header==='function' || Object.keys(header).length===0) throw 'New - invalid interface';
		Object.setPrototypeOf(header, this.prototype); // fix prototype for instanceof
		
		// ctor
		let ctor=header.ctor, composed;
		if (ctor && typeof ctor!=='function') throw 'New - invalid ctor';
		if (args.length>0 && !ctor) throw('New - missing ctor'); // no ctor to send arguments
		if (ctor) {
			composed=ctor(...args);
			delete header.ctor; // remove ctor from interface
		}

		// compose
		if (composed) {
			if (!Array.isArray(composed) && typeof composed != 'function') composed=[composed];
			composed.forEach(a => {
				if (!a || Array.isArray(a) || typeof a == 'function' || Object.keys(a).length===0) throw 'New - invalid composition';
				let props = Object.getOwnPropertyNames(a);
				props.forEach(key => { if (!header.hasOwnProperty(key)) Object.defineProperty(header, key, Object.getOwnPropertyDescriptor(a, key)); });
			});
		}

		return header;
	}
}
