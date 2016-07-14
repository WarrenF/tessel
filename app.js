var express = require( 'express' );
var app = express( );
var config = require( __dirname + '/config' );
var cons = require( 'consolidate');
var fs = require('fs');
var routes = require( __dirname + '/routes' )( express, app, cons, config, fs );
