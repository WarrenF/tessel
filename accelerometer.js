// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/*********************************************
This basic accelerometer example logs a stream
of x, y, and z data from the accelerometer
*********************************************/

var tessel = require('tessel');
var os = require('os');
var port = '8881';
var http = require( 'http' );
var accel = require('accel-mma84').use(tessel.port['A']);
var redLED = tessel.led[0];     // rotate
var yellowLED = tessel.led[1];  // moved
var greenLED = tessel.led[2];   // lift
var answer = {
  lifted: false,
  rotated: false,
  moved: false
};

// Initialize the accelerometer.
accel.on('ready', function () {
  accel.on('data', function (xyz) {
    var x = xyz[0];
    var y = xyz[1];
    var z = xyz[2];
    answer.lifted = false;
    answer.rotated = false;
    answer.moved = false;

    if ( x <= -0.5 ) {
      redLED.on( ); // Rotated!
      answer.rotated = true;
    } else {
      redLED.off( );
    }
    if ( y <= 0 ) {
      yellowLED.on( ); // Moved up or down
      answer.moved = true;
    } else {
      yellowLED.off( );
    }
    if ( z <= -0.5 ) {
      greenLED.on( ); // Lifted
      answer.lifted = true;
    } else {
      greenLED.off( );
    }
  });
});

accel.on('error', function(err){
  console.log('Error:', err);
});

http.createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Request-Method', '*');
	response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	response.setHeader('Access-Control-Allow-Headers', '*');
  response.writeHead(200, { 'Content-Type': 'application/json'});
  response.write( JSON.stringify( answer, null, 3) );
  response.end( );
}).listen(port, () => console.log(`http://${os.hostname()}.local:${port}`));
