var mysql = require( 'mysql' )

function mysqlController( params ) {
  if( ! params ) params = { }
  
  this.host = ( params.host ) ? params.host : '0.0.0.0'
  this.port = ( params.port ) ? params.port : 3306
  this.user = ( params.user ) ? params.user : 'root'
  this.password = ( params.password ) ? params.password : '******'
  this.database = ( params.database ) ? params.database : 'db'
  this.connection = null
  this.escape = mysql.escape
  this.storedProcedures = { }
}

var MC = mysqlController.prototype

MC.init = function( ) {
  this.connection = mysql.createConnection( {
    host : this.host,
    port : this.port,
    user : this.user,
    password : this.password,
    database: this.database,
    multipleStatements: true
  } )
  this.connect( )
}

MC.handleDisconnect = function( ) {
  var self = this
  
  this.init( ) // Recreate the connection, since
               // the old one cannot be reused.

  this.connection.on( 'error', function( err ) {
    if( err.code === 'PROTOCOL_CONNECTION_LOST' ) { }
  } )
}

MC.storedQuery = function( name ) {
  return ( this.storedProcedures[ name ] ) ? this.storedProcedures[ name ] : false
}

MC.connect = function( ) {
  var self = this
  this.connection.connect( function( err ) {
    if( err ) console.log( err )
  } )
}

MC.query = function( query, cb ) {
  if( ! query ) return
  var self = this
  var rows = [ ]
  this.init( )
  query = this.connection.query( query )
  query.on( 'result', function( _rows ) {
    rows.push( _rows )
  } )
  this.connection.end( function( err ) {
    if( cb ) cb( rows )
  } )
}

module.exports = mysqlController