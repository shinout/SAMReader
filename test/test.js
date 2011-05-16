var SamAlignment = require('../SamAlignment');
var SamHeader = require('../SamHeader');
var SamReader = require('../SamReader');
var CIGAR = require('../CIGAR');
var test = require('./shinout.test');


/* CIGAR test */

[ '108M'
, '16M36D58M'
, '12M36S12M30D'
].forEach(function(v) {
  var cigar = new CIGAR(v);
  test('equal', cigar.matchL(), 0, cigar.str + ': L matched incorrectly');
  test('equal', cigar.matchR(), 0, cigar.str + ': R matched incorrectly');
});
test('result', 'CIGAR NO Matching test');

// L match
[ '19S89M'
, '16S36D58M12I'
, '12S3M30D30I13M'
].forEach(function(v) {
  var cigar = new CIGAR(v);
  test('ok', cigar.matchL() > 0 , cigar.str + ': L didn\'t matched');
  test('equal', cigar.matchR(), 0, cigar.str + ': R matched incorrectly');
});
test('result', 'CIGAR L Matching test');


// R match
[ '89M33S'
, '16M36D58M12S'
, '3M30D30I13S'
].forEach(function(v) {
  var cigar = new CIGAR(v);
  test('equal', cigar.matchL(), 0, cigar.str + ': L matched incorrectly');
  test('ok', cigar.matchR() > 0 , cigar.str + ': R didn\'t matched');
});
test('result', 'CIGAR R Matching test');


// total length
(function(){
  var cigar = new CIGAR('23S83M');
  test('equal', cigar.len(), 23+83, cigar.str + ': invalid length');

  cigar = new CIGAR('23S3D83M');
  test('equal', cigar.len(), 23 + 83, cigar.str + ': with D invalid length');

  cigar = new CIGAR('23S3I83M17S');
  test('equal', cigar.len(), 23 + 3 + 83 + 17, cigar.str + ': with I invalid length');

  test('result', 'CIGAR Matching length test');
})();




// match length
(function(){
  var cigar = new CIGAR('23S83M');
  test('equal', cigar.matchL(), 23, cigar.str + ': L invalid length');

  cigar = new CIGAR('23S3D83M');
  test('equal', cigar.matchL(), 23, cigar.str + ': L with D invalid length');

  cigar = new CIGAR('23S3I83M17S');
  test('equal', cigar.matchL(), 26, cigar.str + ': L with I invalid length');
  test('equal', cigar.matchR(), 17, cigar.str + ': R invalid length');

  cigar = new CIGAR('23S6M3D81M1D19S');
  test('equal', cigar.matchL(), 23 + 6, cigar.str + ': L with D,M invalid length');
  test('equal', cigar.matchR(), 19, cigar.str + ': R with D invalid length');

  cigar = new CIGAR('23S6M4I33M3I4M19S');
  test('equal', cigar.matchL(), 23 + 6 + 4, cigar.str + ': L with I,M invalid length');
  test('equal', cigar.matchR(), 19 + 4 + 3, cigar.str + ': R with I,M invalid length');

  test('result', 'CIGAR Matching length test');
})();




/* SamAlignment static function unit test */
var alflgs = SamAlignment.parseFlags(4095)
test('deepEqual', alflgs.multiple, true, 'bit flag failure');
test('deepEqual', alflgs.allmatches, true, 'bit flag failure');
test('deepEqual', alflgs.unmapped, true, 'bit flag failure');
test('deepEqual', alflgs.next_unmapped, true, 'bit flag failure');
test('deepEqual', alflgs.reversed, true, 'bit flag failure');
test('deepEqual', alflgs.next_reversed, true, 'bit flag failure');
test('deepEqual', alflgs.first, true, 'bit flag failure');
test('deepEqual', alflgs.last, true, 'bit flag failure');
test('deepEqual', alflgs.secondary, true, 'bit flag failure');
test('deepEqual', alflgs.lowquality, true, 'bit flag failure');
test('deepEqual', alflgs.duplicate, true, 'bit flag failure');

var reverses = SamAlignment.parseFlags(16);
test('deepEqual', reverses.multiple, false, 'bit flag failure');
test('deepEqual', reverses.allmatches, false, 'bit flag failure');
test('deepEqual', reverses.unmapped, false, 'bit flag failure');
test('deepEqual', reverses.next_unmapped, false, 'bit flag failure');
test('deepEqual', reverses.reversed, true, 'bit flag failure');
test('deepEqual', reverses.next_reversed, false, 'bit flag failure');
test('deepEqual', reverses.first, false, 'bit flag failure');
test('deepEqual', reverses.last, false, 'bit flag failure');
test('deepEqual', reverses.secondary, false, 'bit flag failure');
test('deepEqual', reverses.lowquality, false, 'bit flag failure');
test('deepEqual', reverses.duplicate, false, 'bit flag failure');


test('result', 'bit flag test');


var options = SamAlignment.parseOptions('X0:i:1\tX1:i:1\tXA:Z:chr4,+191043977,75M,3;\tMD:Z:72C0T1\tRG:Z:xxxeras20101201.7\tXG:i:0\tAM:i:0\tNM:i:2\tSM:i:23\tXM:i:2\tXO:i:0\tXT:A:U'.split('\t'));

test('equal', options.X0.type, 'i', 'invalid type');
test('equal', options.X0.value, '1', 'invalid value');

test('equal', options.XA.type, 'Z', 'invalid type');
test('equal', options.XA.value, 'chr4,+191043977,75M,3;', 'invalid value');

test('equal', options.MD.type, 'Z', 'invalid type');
test('equal', options.MD.value, '72C0T1', 'invalid value');

test('equal', options.RG.type, 'Z', 'invalid type');
test('equal', options.RG.value, 'xxxeras20101201.7', 'invalid value');

test('equal', options.XG.type, 'i', 'invalid type');
test('equal', options.XG.value, '0', 'invalid value');

test('equal', options.NM.type, 'i', 'invalid type');
test('equal', options.NM.value, '2', 'invalid value');

test('equal', options.SM.type, 'i', 'invalid type');
test('equal', options.SM.value, '23', 'invalid value');

test('equal', options.XM.type, 'i', 'invalid type');
test('equal', options.XM.value, '2', 'invalid value');

test('equal', options.XO.type, 'i', 'invalid type');
test('equal', options.XO.value, '0', 'invalid value');

test('equal', options.XT.type, 'A', 'invalid type');
test('equal', options.XT.value, 'U', 'invalid value');

test('result', 'parse options test');

/* SamAlignment object test */

var line = 'SAMPLE#0\t163\tchr1\t11786\t0\t75M\t=\t11920\t209\tATTTGCCGGATTTCCTTTGCTGTTCCTGCATGTAGTTTAAACGAGATTGCCAGCACCGGGTATCATTCACCATTT\tfcffffffffffffffffcfffdefffffffffffeffffffceffefffffffffffff`caddddddeddddd\tX0:i:1\tX1:i:1\tXA:Z:chr4,+191043977,75M,3;\tMD:Z:72C0T1\tRG:Z:xxxeras20101201.7\tXG:i:0\tAM:i:0\tNM:i:2\tSM:i:23\tXM:i:2\tXO:i:0\tXT:A:U';

var sa = new SamAlignment(line);

test('equal', Object.keys(sa).length, 14, 'invalid prop length');
test('equal', sa.name, 'SAMPLE#0', 'invalid prop: name');
test('equal', typeof sa.flags, 'object', 'invaid prop type: object');
test('deepEqual', sa.flags.last, true, 'invaid prop: flags.last');
test('equal', sa.rname, 'chr1', 'invaid prop type: rname');
test('equal', sa.pos, 11786, 'invaid prop type: pos');
test('equal', sa.mapq, 0, 'invaid prop type: mapq');
test('ok', sa.cigar instanceof CIGAR, 'invalid prop type: CIGAR');
test('equal', sa.cigar.str, '75M', 'invalid prop: cigar');
test('equal', sa.rnext, '=', 'invalid prop: rnext');
test('equal', sa.pnext, '11920', 'invalid prop: pnext');
test('equal', sa.tlen, '209', 'invalid prop: tlen');
test('equal', sa.seq.length, 75, 'invalid prop: seq');
test('equal', sa.qual.length, 75, 'invalid prop: qual');
test('equal', sa.options.XT.type, 'A', 'invalid prop: options.XT');
test('result', 'SamAlignment object test');



/* SamHeader test */
var headerlines = [
  '@HD\tVN:1.0\tSO:coordinate',
  '@SQ\tSN:chr1\tLN:249250621',
  '@SQ\tSN:chr2\tLN:243199373',
  '@SQ\tSN:chr3\tLN:198022430',
  '@SQ\tSN:chr4\tLN:191154276'
];

var h1 = new SamHeader(headerlines[0]);
test('equal', h1.tag, 'HD', 'invalid prop: tag');
test('equal', h1.values.length, 2, 'invalid values length');
test('equal', h1.values.VN, '1.0', 'invalid value VN');
test('equal', h1.values.SO, 'coordinate', 'invalid value SO');

var h2 = new SamHeader(headerlines[1]);
test('equal', h2.tag, 'SQ', 'invalid prop: tag');
test('equal', h2.values.length, 2, 'invalid values length');
test('equal', h2.values.SN, 'chr1', 'invalid value SN');
test('equal', h2.values.LN, 249250621, 'invalid value LN');

var h3 = new SamHeader(headerlines[2]);
test('equal', h3.tag, 'SQ', 'invalid prop: tag');
test('equal', h3.values.length, 2, 'invalid values length');
test('equal', h3.values.SN, 'chr2', 'invalid value SN');
test('equal', h3.values.LN, 243199373, 'invalid value LN');

var h4 = new SamHeader(headerlines[3]);
test('equal', h4.tag, 'SQ', 'invalid prop: tag');
test('equal', h4.values.length, 2, 'invalid values length');
test('equal', h4.values.SN, 'chr3', 'invalid value SN');
test('equal', h4.values.LN, 198022430, 'invalid value LN');

var h5 = new SamHeader(headerlines[4]);
test('equal', h5.tag, 'SQ', 'invalid prop: tag');
test('equal', h5.values.length, 2, 'invalid values length');
test('equal', h5.values.SN, 'chr4', 'invalid value SN');
test('equal', h5.values.LN, 191154276, 'invalid value LN');

test('result', 'SamHeader test');

/* SamReader test */
var sam = new SamReader(__dirname + '/sample3000.sam');

sam.on('header', function(hd) {
  console.log(hd);
});

sam.on('alignment', function(data) {
  //console.log(data);
});

sam.on('end', function() {
  console.log("end");
  test('result', 'SamReader test');
});
