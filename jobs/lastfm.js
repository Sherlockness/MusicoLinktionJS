var config = require('../config');
var sqldb = require('./../sqldb');
var User = sqldb.User;
var ServicesProfiles = sqldb.ServicesProfiles;
var USP = sqldb.UsersServicesProfiles;
var USPD = sqldb.UsersServicesProfilesData;
var Artist = sqldb.Artist;
var utilities = require('./../components/utilities');
var LastfmAPI = require('lastfmapi');
var Discogs = require('disconnect').Client;
var DiscogsRequestData;
const querystring = require('querystring');
var lfm = new LastfmAPI({
	'api_key' : config.lfm.key,
	'secret' : config.lfm.secret
});
var async = require("async");

var job = process.argv[2];
var user = process.argv[3];
switch(job){
    case 'getFullLibrary':
        getFullLibrary(user);
    break;
}

/*function getFullLibrary(user){
    User.
}*/