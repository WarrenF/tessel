// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/*********************************************
Create a server that responds to every request by taking a picture and piping it directly to the browser.
*********************************************/

var av = require('tessel-av');
var os = require('os');
var fs = require('fs');
var path = require('path');
var http = require('http');
var tessel = require('tessel');
var accel = require('accel-mma84').use(tessel.port['A']);
var port = 8881;
var camera = new av.Camera();
var server = http.createServer( handleRequest );
var imgPath = path.join( __dirname, 'out.jpg');

// Initialize the accelerometer.
accel.on('ready', function () {
  // Stream accelerometer data
  accel.on('data', function (xyz) {
    console.log( 'X: ' + xyz[0].toFixed(2) );
    if ( xyz[0] <= 1.01 && xyz[0] >= 0.99 ) {
      console.log( 'Say cheese!!' );
      camera.capture( ).on('data', function(data) {
        fs.writeFile(imgPath, data);
      });
    }
  });
});

accel.on('error', function(err){
  console.log('Error:', err);
});

function handleRequest( request, response ) {
  response.writeHead(200, { 'Content-Type': 'image/jpg' });
  try {
    var rstream = fs.createReadStream(imgPath);
    rstream.pipe(response);
  } catch (e) {
    // do nothing yet
  }
}



server.listen(port, () => console.log(`http://${os.hostname()}.local:${port}`));
