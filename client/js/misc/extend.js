/*
 * Basic extend() helper fn
 */
module.exports = function() {
  var objs = [].slice.call(arguments,0)
    , obj = objs.shift() || {};

  while(objs.length>0) {
    var next = objs.shift();
    for(var k in next) {
      if(next[k] !== undefined) obj[k] = next[k];
    }
  }
  return obj;
};