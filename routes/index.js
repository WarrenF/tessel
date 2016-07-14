module.exports = function( express, app, cons, config, fs ){

  //Start the server!
  var server = app.listen( config.server.port, function ( ) {
    console.log( 'Listening on port %s', config.server.port )
  } )

  //Express settings
  app.engine( 'html', cons.swig )
  app.set( 'view engine', 'html' )
  app.set( 'views', __dirname + '/../views' )
  app.use( express.static( 'public' ) )

  //Routes
  app.get( '/', function ( req, res ) {

    var viewObj = {}

    /*
    if ( req.query.warren == 1 ) {
      viewObj = { admin: true }
    }
    */

    res.render( 'index', viewObj )

  } )

  //Socket.io stuff!
  var io = require( 'socket.io' )( server )

  io.sockets.on( 'connection', function( socket ) {
    var sessionId = ( socket.request.sessionID ? socket.request.sessionID : socket.id )

    socket.on( 'connectToRoom', function ( room ) {
      socket.room = room
      socket.emit( 'connectedToRoom', room )
      io.sockets.emit( 'newUserConnection', sessionId )
    } );

    socket.on('disconnect', function ( ) {
      io.sockets.emit( 'disconnect', sessionId )
    });

    socket.on( 'requestInstruction', function ( ) {
      var randomnumber = Math.floor(Math.random() * (1 - 0 + 1) );
      var instructions = [ 'flap', 'rotate' ]
      socket.emit( 'instruction', instructions[randomnumber] );
    });

    socket.on( 'tellServerToSendInput', function ( ) {
      socket.emit( 'input', 'flap' );
    });

  } )

}
