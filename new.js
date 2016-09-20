// https://github.com/kofifus/New.js
if (typeof Function.prototype.New === 'undefined') {
	Function.prototype.New= function(...args) {
		let isDict = d => (d !==undefined && d!==null && typeof d==='object' && d.constructor!==Array && d.constructor!==Date); 

		// get public interface
		let header=this();
		if (!isDict(header)) throw 'New - invalid interface';
		Object.setPrototypeOf(header, this.prototype); // fix prototype for instanceof
		
		// ctor
		let ctor=header.ctor, composed;
		if (ctor && typeof ctor!=='function') throw 'New - invalid ctor';
		if (args.length>0 && !ctor) throw('New - missing ctor'); // no ctor to send arguments
		if (ctor) {
			composed=ctor.call(header, ...args);
			delete header.ctor; // remove ctor from interface
		}

		// compose
		if (composed) {
			if (isDict(composed)) composed=[composed];
			if (composed.constructor!==Array) throw 'New - invalid composition';
			composed.forEach(a => {
				if (!isDict(a)) throw 'New - invalid composition';
				let props = Object.getOwnPropertyNames(a);
				props.forEach(key => { if (!header.hasOwnProperty(key)) Object.defineProperty(header, key, Object.getOwnPropertyDescriptor(a, key)); });
			});
		}

		return header;
	}
}
