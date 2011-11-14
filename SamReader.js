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
  this.rstream = rstream;

  var lstream = new LineStream(rstream);
  var self = this;

  lstream.on('data', function(line) {
    if (line.charAt(0) == '@') {
      var header = new SamHeader(line);
      self.emit('header', header);
      return;
    }

    var samobj = new SamAlignment(line);
    if (samobj.valid) {
      self.emit('alignment', samobj);
    }
  });

  lstream.on('end', function() {
    self.emit('end');
  });
}

SamReader.prototype = new EventEmitter();

SamReader.SamAlignment= SamAlignment;
SamReader.SamHeader= SamHeader;

module.exports = SamReader;
