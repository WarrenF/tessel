// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/*********************************************
Create a server that responds to every request by taking a picture and piping it directly to the browser.
*********************************************/

var av = require('tessel-av');
var os = require('os');
var http = require('http');
var port = 8881;
var camera = new av.Camera();

http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/jpg' });

  camera.capture().pipe(response);

}).listen(port, () => console.log(`http://${os.hostname()}.local:${port}`));
