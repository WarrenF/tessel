( function( ) {
  var self = this, socket;

  self.params = {};
  self.params.jqueryScript = '/js/jquery.js';
  self.params.scripts = [
    '/js/bootstrap.js',
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
    self.params.instruction = $( '.instruction' );
    self.params.expectedInput = '';
    self.params.score = 0;
    self.params.scoreObj = $( '.score' );
    self.startGame( );

  };

  self.startGame = function ( ) {

    //TODO: SETUP MUSIC/SOUNDS
    setTimeout( function ( ) {
      self.loadWebSocket( );
    }, 1000 );


    self.params.sounds = {
      correct: new Howl( {
        urls: ['audio/correct.wav' ],
        volume: self.params.volume
      } ),
      wrong: new Howl( {
        urls: ['audio/wrong.wav' ],
        volume: self.params.volume
      } )
    };

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

    socket.on( 'connectedToRoom', function( room ) {
      setInterval( function ( ) {
        $.get( 'http://tosh.local:8881/', function( data ) {
          var input = '';
          if ( data.lifted ) input = 'flap';
          if ( data.rotated ) input = 'rotate';
          if ( input ) socket.emit( 'tellServerToSendInput', input );
        } );
      }, 100 );
      self.params.connectionStatus
        .text( 'Connected!' ).removeClass( 'flash' ).css( 'color', 'lightgreen' )
        .delay( 1000 )
        .fadeOut( 'slow' );

        setTimeout( function ( ) {
          self.params.instruction
            .removeClass( 'hide' );
          socket.emit( 'requestInstruction' );
        }, 1000 );

    } );

    socket.on( 'instruction', function( instruction ) {
      self.params.instruction.text( instruction + '!' );
      self.params.expectedInput = instruction;
    } );

    socket.on( 'input', function ( input ) {
      if ( input === self.params.expectedInput ) {
        self.params.score ++;
        self.params.scoreObj.text( self.params.score );
        self.params.sounds.correct.play( );
      } else {
        self.params.sounds.wrong.play( );
      }
      setTimeout( function ( ) {
        socket.emit( 'requestInstruction' );
      }, 10 );
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
            self.scriptsLoaded( );
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
