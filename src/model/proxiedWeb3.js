// using a custom promisify, we might want to change it later
// const {promisify} = require('util');
const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }

      resolve(res);
    })
  );

// simple proxy to promisify the web3 api. It doesn't deal with edge cases like web3.eth.filter and contracts.
exports.proxiedWeb3Handler = {
  // override getter                               
  get: (target, name) => {              
    const inner = target[name];                            
    if (inner instanceof Function) {                       
      // Return a function with the callback already set.  
      return (...args) => promisify(cb => inner(...args, cb));
     } else if (typeof inner === 'object') {                
      // wrap inner web3 stuff                             
      return new Proxy(inner, proxiedWeb3Handler);         
    } else {                                               
      return inner;                                        
    }                                                      
  },                                                       
};

