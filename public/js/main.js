( function( ) {
  var self = this, socket;

  self.params = {};
  self.params.jqueryScript = '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js';
  self.params.scripts = [
    '//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js',
    '/js/ie10-viewport-bug-workaround.js',
    '/js/jquery.waypoints.min.js',
  ];
  self.params.sections = [
    '#section1'
  ];

  self.getURLParam = function( name ) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
  }

  self.loadScript = function( script ) {
    var element = document.createElement( 'script' );
    element.src = script;
    document.body.appendChild( element );
  };

  self.scriptsLoaded = function( ) {

    self.params.volume = 1;
    self.params.body = $( 'body' );
    self.params.connectionStatus = $( '.connectionStatus' );
    self.startGame( );

  };

  self.startGame = function ( ) {

    //TODO: SETUP MUSIC/SOUNDS

    setTimeout( function ( ) {
      self.loadWebSocket( );
    }, 1000 );

    /*
    self.params.sounds = {
      music: new Howl( {
        urls: ['audio/music.mp3?noCache=' + Math.random( ) ],
        volume: self.params.volume,
        buffer: true
      } )
    };
    */

  };

  self.loadWebSocket = function( ) {

    var socketFunc = this;
    var socket = io( );
    var room = 'game';

    console.log( 'emit!' );
    socket.emit( 'connectToRoom', room );

    /*
    socketFunc.playMusic = function ( ) {
      self.params.sounds.music.volume( self.params.volume ).play( );
      self.params.musicIsPlaying = true;
      self.params.startMusicButton.attr( 'disabled', 'disabled' ).text( 'Music is playing!' ).addClass( 'pulse' ).addClass( 'infinite' ).removeClass( 'rubberBand' );
      self.params.startMusicLabel.text( 'Music is playing!' ).addClass( 'pulse' ).addClass( 'infinite' ).removeClass( 'rubberBand' );
      self.params.syncMusic.fadeIn( );
    };

    socketFunc.stopMusic = function ( ) {
      self.params.sounds.music.pause( );
      self.params.musicIsPlaying = false;
      self.params.startMusicButton.removeAttr( 'disabled' ).text( 'Start Music' ).removeClass( 'infinite' );
    };

    socketFunc.destroyMusic = function ( ) {
      self.params.sounds.music.unload( );
    };
    */

    socket.on( 'connectedToRoom', function( room ){
      self.params.connectionStatus.text( 'Connected!' ).removeClass( 'flash' ).css( 'color', 'lightgreen' );
    } );

    /*
    socket.on( 'stopMusic', function( ) {
      socketFunc.stopMusic( );
    } );
    */
    socket.on( 'newUserConnection', function( sessionId ) {
      console.log( sessionId + ' connected' );
    } );

    socket.on( 'disconnect', function( sessionId ) {
      console.log( sessionId + ' disconnected' );
    } );

  };

  self.init = function( ) {
    //Load jQuery first

    self.loadScript( self.params.jqueryScript );

    var postLoadScriptInterval = setInterval( function ( ) {
      if ( !window.$ ) return;
      clearInterval( postLoadScriptInterval );

      //Load the rest of the scripts in order
      $.each( self.params.scripts, function ( i, v ) {
        self.loadScript( v );
        if ( i == self.params.scripts.length -1 ) {
          var allScriptsLoadedInterval = setInterval( function ( ) {
            if ( typeof $.fn.scrollspy != 'function' || typeof $.fn.waypoint != 'function' ) return;
            clearInterval( allScriptsLoadedInterval );
            self.scriptsLoaded( )
          }, 100 );
        }
      } );

    }, 100 );
  };

  //Post load all the things!
  if ( window.addEventListener ) window.addEventListener( 'load', self.init, false );
  else if ( window.attachEvent ) window.attachEvent( 'onload', self.init );
  else window.onload = self.init;
} )( );
