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
    } )

    socket.on( 'playMusicServer', function ( ) {
      io.sockets.emit( 'playMusic' )
    } )

    socket.on( 'syncUp', function ( pos ) {
      io.sockets.emit( 'syncMusic', pos )
    } )

    socket.on( 'stopMusicServer', function ( ) {
      io.sockets.emit( 'stopMusic' )
    } )

    socket.on( 'stopMusicServerForTrackUpdate', function ( ) {
      io.sockets.emit( 'stopMusicForTrackUpdate' )
    } )

    socket.on( 'requestMusicFromServer', function ( ) {
      io.sockets.emit( 'requestMusicFromAdmin' )
    } )

    socket.on( 'musicIsNotPlayingServer', function ( ) {
      io.sockets.emit( 'musicIsNotPlaying' )
    } )

    socket.on( 'requestMusicListFromServer', function ( ) {
      fs.readdir( './public/audio', function( err, files ) {
        socket.emit( 'musicList', files )
      } )
    } )

    socket.on( 'changeTrackServer', function ( file ) {
      if ( !file ) return false;
      var musicPath = './public/audio/';
      fs.unlink( musicPath + 'music.mp3', function( err ) {
        if ( err ) throw err;
        fs.createReadStream( musicPath + file ).pipe( fs.createWriteStream( musicPath + 'music.mp3' ) );
        setTimeout( function ( ) {
          io.sockets.emit( 'updatedTrack' );
        }, 10000 );
      } )
    } )

    socket.on('disconnect', function ( ) {
      io.sockets.emit( 'disconnect', sessionId )
    });

  } )

}
