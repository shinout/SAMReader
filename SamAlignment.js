/**
 * SAM alignment data format
 * @author  SHIN Suzuki
 * @version 0.0.1
 */

/**
 * SAM alignment data
 * @constructor
 * @param {String} samline one line from SAM alignment data
 */
function SamAlignment(samline) {
  var data = samline.split('\t');
  if (data.length < 11 || data[0].charAt(0) == '@') {
    return false;
  }
  SamAlignment.registerProps(this);

  this.line    = samline;
  this.name    = data[0];
  this.flags   = data[1]; // lazy
  this.rname   = data[2];
  this.pos     = data[3];
  this.mapq    = data[4];
  this.cigar   = data[5]; // lazy
  this.rnext   = data[6];
  this.pnext   = data[7];
  this.tlen    = data[8];
  this.seq     = data[9];
  this.qual    = data[10];
  this.options = data.splice(11); // lazy
  this.valid   = true;
}


SamAlignment.registerProps = function(sam) {
  var that = {};
  /** props **/
  /* normal props */
  ['name', 'rname', 'pos', 'mapq', 'rnext', 'pnext', 'tlen', 'seq', 'qual']
  .forEach(function(prop) {
    Object.defineProperty(sam, prop, {
      get: function() {this.load; return that['_'+prop]},
      set: function(val){that['_'+prop] = val},
      enumerable: true
    });
  });

  /* lazy props */
  // flags
  Object.defineProperty(sam, 'flags', {
    get: function() { if (that._flags == null) {that._flags = SamAlignment.parseFlags(that._preflags);} return that._flags; },
    set: function(val) { that._preflags = val;},
    enumerable: true
  });

  // cigar
  Object.defineProperty(sam, 'cigar', {
    get: function() { if (that._CIGAR == null) {that._CIGAR = new (require('./CIGAR'))(that._cigar);} return that._CIGAR; },
    set: function(val) { that._cigar = val;},
    enumerable: true
  });

  // options
  Object.defineProperty(sam, 'options', {
    get: function() { if (that._options == null) {that._options = SamAlignment.parseOptions(that._preOptions);} return that._options; },
    set: function(val) { that._preOptions = val;},
    enumerable: true
  });

  // load
  Object.defineProperty(sam, 'load', {
    get: function() {
      if (that._load == null) {
        that._load = true;
        // dependency check
        if (this.flags.unmapped === true) {
          this.rname = null;
          this.pos   = null;
          this.cigar = null;
          this.mapq  = 255;
          this.flags.allmatches = null;
          this.flags.reversed = null;
          this.flags.secondary = null;
        }
        if (this.flags.multiple === false) {
          this.flags.allmatches = null;
          this.flags.next_unmapped = null;
          this.flags.next_reversed = null;
          this.flags.first = null;
          this.flags.last = null;
        }
        if (this.rname == null || this.rname == '*') {
          this.pos = null;
          this.cigar = null;
        }
        if (this.pos == null || this.pos == 0) {
          this.rname = null;
          this.cigar = null;
        }
        else {
          this.pos = Number(this.pos);
        }
        if (!this.mapq || this.mapq > 255 || this.mapq < 0) {
          this.mapq = 255;
        }
        else {
          this.mapq = Number(this.mapq);
        }
        if (this.pnext == null || this.pnext == 0) {
          this.rnext = null;
          this.flags.next_reversed = null;
        }
        if (this.rnext == null || this.rnext == '*') {
          this.flags.next_reversed = null;
        }
      }
      return that._load;
    }
  });
};

/* CONSTANT */

// FLAGS
Object.defineProperty(SamAlignment, 'FLAGS', {
  get: function() { return [
    'multiple',
    'allmatches',
    'unmapped',
    'next_unmapped',
    'reversed',
    'next_reversed',
    'first',
    'last',
    'secondary',
    'lowquality',
    'duplicate'
  ] }
});

/**
 * parse flags to the object format
 * @param {Number} bitflags
 * @returns {Object} 
 */
SamAlignment.parseFlags = function(bitflags) {
  var n = 0x01;
  var ret = {};
  SamAlignment.FLAGS.forEach(function(flagname) {
    ret[flagname] = (bitflags & n) ? true : false;
    n = n << 1;
  });
  return ret;
}

/**
 * parse options array to the object format
 * @param {Array} arr
 * @returns {Object} 
 */
SamAlignment.parseOptions = function(arr) {
  var ret = {};
  arr.forEach(function(v) {
    var kv = v.split(':');
    if (kv.length < 3) return;
    ret[kv[0]] = {type: kv[1], value: kv[2]};
  });
  return ret;
}

/* export */
module.exports = SamAlignment;
