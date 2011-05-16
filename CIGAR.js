/**
 * CIGAR Object
 * @author  SHIN Suzuki
 * @version 0.0.1
 */
function CIGAR(cigar) {
  if (cigar == null) {
    return null;
  }
  this.init(cigar);
}

CIGAR.prototype.init = function(cigar) {
  this.str = cigar;
  var arr = [];
  cigarr = cigar.split(/([A-Z=])/);
  cigarr.pop();

  var current, maxMkey, anchor = 0;

  cigarr.forEach(function(v, i) {
    var key = i >> 1;
    if (i & 1) {
      if (v == 'M') {
        if ( maxMkey == null) {
          anchor  = key; // first M position
          maxMkey = key; // max M position
        }
        else if (maxMkey !=null && arr[maxMkey].num < arr[key].num) {
          maxMkey = key;
        }
      }
      arr[key].type = v;
    }
    else {
      arr[key] = {num : Number(v)};
    }
  });

  this.arr = arr;
  this.maxMkey = maxMkey;
  this.anchor = anchor;
};

CIGAR.prototype.matchL = function() {
  if (this.L != null)
    return this.L;

  if (!this.arr[0] || this.arr[0].type != 'S' || !this.maxMkey) return 0;

  var ret = 0;
  for (var i=0; i<this.maxMkey; i++) {
    ret += CIGAR.lenCount(this.arr[i]);
  }
  this.L = ret;
  return ret;
};


CIGAR.prototype.matchR = function() {
  if (this.R != null)
    return this.R;

  if (!this.arr[0] || this.arr[this.arr.length -1].type != 'S' || this.maxMkey == null) return 0;
  var ret = 0;
  for (var i=this.arr.length-1; i>this.maxMkey; i--) {
    ret += CIGAR.lenCount(this.arr[i]);
  }
  this.R = ret;
  return ret;
};

CIGAR.prototype.len = function() {
  if (this._len) return this._len;
  var len = 0;
  this.arr.forEach(function(v) {
    len += CIGAR.lenCount(v);
  });
  this._len = len;
  return len;
};


CIGAR.prototype.getGap = function() {
  if (this.gap != null)
    return this.gap;
  if (this.maxMkey < this.anchor)
    return 0;
  var ret = 0;
  for (var i=this.anchor; i < this.maxMkey; i++) {
    ret += CIGAR.refLenCount(this.arr[i]);
  }
  this.gap = ret;
  return ret;
};

CIGAR.prototype.getLBreak = function(pos) {
  if (!this.matchL()) return -1;
  if (!pos) pos = 0;
  pos = Number(pos);
  if (this.anchor >= this.maxMkey) {
    return pos;
  }
  return pos + this.getGap();
};

CIGAR.prototype.getRBreak = function(pos) {
  if (!this.matchR()) return -1;
  if (!pos) pos = 0;
  pos = Number(pos);
  if (this.anchor >= this.maxMkey) {
    return pos + this.arr[this.anchor].num;
  }
  return pos + this.getGap() + this.arr[this.maxMkey].num;
};

CIGAR.lenCount = function(el) {
  return (el.type.match(/[MS=XI]/)) ? el.num : 0;
};

CIGAR.refLenCount = function(el) {
  //return (el.type.match(/[MS=XDNP]/)) ? el.num : 0;
  return (el.type.match(/[MS=XDN]/)) ? el.num : 0;
};

module.exports = CIGAR;
