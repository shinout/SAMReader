/**
 * SAM header format
 * @author  SHIN Suzuki
 * @version 0.0.1
 */

/**
 * SAM header data
 * @constructor
 * @param {String} samline one line from SAM header data
 */
function SamHeader(samline) {
  if (samline.charAt(0) != '@') {
    return false;
  }

  var data = samline.split('\t');
  this.tag = data[0].slice(1);
  data.shift();
  this.values = {};
  data.forEach(function(v) {
    var kv = v.split(':');
    this.values[kv[0]] = kv[1];
  }, this);

  Object.defineProperty(this.values, 'length', {
    get: function(){return Object.keys(this).length}
  });
}

/* export */
module.exports = SamHeader;
