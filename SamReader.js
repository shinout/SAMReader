/**
 * SAM format Event Emitter
 * @author  SHIN Suzuki
 * @version 0.0.1
 */
var LineStream = require('linestream');
var EventEmitter = require('events').EventEmitter;
var SamAlignment= require('./SamAlignment');
var SamHeader = require('./SamHeader');

/**
 * SamReader
 * Emit 'samdata' event from readable stream
 * @extends EventEmitter
 * @param {ReadableStream} rstream 
 *
 */
function SamReader(rstream) {
  this.rstream = rstream || process.stdin;
  if (process.stdin === this.rstream) {
    process.stdin.resume();
  }
  var lstream = new LineStream(rstream, {trim: true});
  var self = this;

  lstream.on('line', function(line) {
    if (line.charAt(0) == '@') {
      var header = new SamHeader(line);
      self.emit('header', header);
      return;
    }

    var samobj = new SamAlignment(line);
    if (samobj) {
      self.emit('alignment', samobj);
    }
  });

  lstream.on('end', function() {
    self.emit('end');
  });
}

SamReader.prototype = new EventEmitter();
console.log(SamReader);

SamReader.SamAlignment= SamAlignment;
SamReader.SamHeader= SamHeader;

module.exports = SamReader;