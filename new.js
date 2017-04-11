// https://github.com/kofifus/New.js
if (typeof Function.prototype.New === 'undefined') {
	Function.prototype.New=function(...args) {
    // not using object.assign so we can copy get/set
    function copyProps(to, from) { Object.getOwnPropertyNames(from).forEach(key => { if (!to.hasOwnProperty(key)) Object.defineProperty(to, key, Object.getOwnPropertyDescriptor(from, key)); }); }

		// create header 
		let header=Object.create(this.prototype);
		copyProps(header, this.call(header, ...args));
		
		// fill instance with composed properties
		if (header.composed) {
		  if (!Array.isArray(header.composed)) header.composed=[header.composed];
		  header.composed.forEach(props => copyProps(header, props));
		  delete header.composed;
		}

		return header;
	}
}
