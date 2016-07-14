var querystring = require( 'querystring' )

function socketController( params ) {
  this.data = null
  this.config = params.config
  this.mysql = params.mysql
  this.socket = params.socket
}

var SC = socketController.prototype

SC.addUser = function( data ) {
  var self = this
  self.data = querystring.parse( data )
  var query = 
    'INSERT IGNORE INTO ' + self.config.mysql.users_table + ' ' +
    'SET first_name = "' + self.data.firstName + '", ' +
    'last_name = "' + self.data.lastName + '", ' +
    'email = "' + self.data.email + '"'
  self.mysql.query( query )
  query = 
    'SELECT id from ' + self.config.mysql.users_table + ' ' +
    'WHERE email = "' + self.data.email + '"'
  self.mysql.query( query, function( res ) {
    self.addPositions( res )
  } )
  self.socket.broadcast.emit( 'addedUser', { first_name: self.data.first_name, last_name: self.data.last_name } )
}
  
SC.addPositions = function( res ) {
  if( ! ( res && res[0] && res[0].id )) return;
  
  var id = res[0].id
  var query = [ ]
  var self = this
  self.data.position.forEach( function( position, i ) {
    query.push(
      'INSERT IGNORE INTO ' + self.config.mysql.position_table + ' ' +
      'set user_id = ' + id + ', ' +
      'position = "' + position + '"'
    )
  } )
  self.mysql.query( query.join( ';' ))
}

module.exports = socketController