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

/**
 * initialization
 * @param cigar: CIGAR string (e.g. 45M23S)
 *
 * setting the following values
 *   this.arr     : [{type: "M", num: 23}, ...]
 *   this.maxMkey
 *   this.anchor
 **/
CIGAR.prototype.init = function(cigar) {
  this.str = cigar;
  var arr = [];
  cigarr = cigar.split(/([A-Z=])/);
  cigarr.pop();

  var current, maxMkey, anchor = 0;

  cigarr.forEach(function(v, i) {
    var key = i >> 1;

    // character
    if (i & 1) {

      // match
      if (v == 'M') {
        if ( maxMkey == null) {
          anchor  = key; // first M position
          maxMkey = key; // max M position
        }
        else if (maxMkey != null && arr[maxMkey].num < arr[key].num) {
          maxMkey = key;
        }
      }
      arr[key].type = v;
    }
    // number
    else {
      arr[key] = {num : Number(v)};
    }
  });

  this.arr = arr;
  this.maxMkey = maxMkey;
  this.anchor = anchor;
};


/**
 * get left breakpoint length until max M
 *
 * e.g. 11S 4M 2D 40M  => [11S 4M 2D] are broken (not match) => return 11 + 4 
 *
 * returns 0 when there is no leftside break
 * @return integer
 **/
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


/**
 * get right breakpoint length until max M
 *
 * e.g. 40M 2D 4M 11S => [2D 4M 11S] are broken (not match) => return 11 + 4 
 *
 * returns 0 when there is no rightside break
 * @return integer
 **/
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

/**
 * get total sequence length
 *
 * e.g.
 *   25S1D25M -> 25 + 25 = 50
 *   25S1S25M -> 25 + 1 + 25 = 51
 **/
CIGAR.prototype.len = function() {
  if (this._len) return this._len;
  var len = 0;
  this.arr.forEach(function(v) {
    len += CIGAR.lenCount(v);
  });
  this._len = len;
  return len;
};


/**
 * get position of the L breakpoint
 *
 * coordinate system is decided by the given argument (the same as the argument)
 *
 * @param integer pos: matched position of the read
 * @return integer : leftside breakpoint
 *
 * "POS" column in SAM format stands for first matched (not clipped) position.
 * e.g.
 *    POS   : 9
 *    SEQ   : ATCGGTT
 *    CIGAR : 3S4M
 *
 *    then, mapping state is like...
 *    
 *    reference CAAGGTT
 *    read      ATCGGTT
 *                 |
 *    position     9
 *
 *   -------------------------------------
 *    NOT like
 *
 *    reference CAAGGTT
 *    read      ATCGGTT
 *              |
 *    position  9
 *   -------------------------------------
 *
 **/
CIGAR.prototype.getLBreak = function(pos) {
  if (!this.matchL()) return -1;
  if (!pos) pos = 0;
  pos = Number(pos);
  if (this.anchor >= this.maxMkey) {
    return pos;
  }
  return pos + this.getGap();
};


/**
 * get position of the R breakpoint
 *
 * coordinate system is decided by the given argument (the same as the argument)
 *
 * @param integer pos: matched position of the read
 * @return integer : rightside breakpoint
 **/
CIGAR.prototype.getRBreak = function(pos) {
  if (!this.matchR()) return -1;
  if (!pos) pos = 0;
  pos = Number(pos);
  if (this.anchor >= this.maxMkey) {
    return pos + this.arr[this.anchor].num;
  }
  return pos + this.getGap() + this.arr[this.maxMkey].num;
};

/**
 * gap between reference and actual read
 *
 * e.g.
 *   45S 6M 2D 43M => 45S, 8Gap
 **/
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


/**
 * count the length of the read for each character
 **/
CIGAR.lenCount = function(el) {
  return (el.type.match(/[MS=XI]/)) ? el.num : 0;
};

/**
 * count the length of the part of the reference mapped by the read for each character
 **/
CIGAR.refLenCount = function(el) {
  //return (el.type.match(/[MS=XDNP]/)) ? el.num : 0;
  return (el.type.match(/[MS=XDN]/)) ? el.num : 0;
};

module.exports = CIGAR;
