// https://github.com/kofifus/New.js
if (typeof Function.prototype.New === 'undefined') {
  Function.prototype.New = function(...args) {
    function copyProps(to, from) {
      // not using object.assign so we can copy get/set
      Object.getOwnPropertyNames(from).forEach(key => {
        if (!to.hasOwnProperty(key)) Object.defineProperty(to, key, Object.getOwnPropertyDescriptor(from, key));
      });
    }

    // create header 
    let header = {};
    Object.setPrototypeOf(header, this.prototype); // fix prototype for instanceof
    copyProps(header, this.call(header, ...args));

    // fill instance with composed properties
    if (header.composed) {
      if (!Array.isArray(header.composed)) header.composed = [header.composed];
      header.composed.forEach(props => copyProps(header, props));
      delete header.composed;
    }

    return header;
  }
}
