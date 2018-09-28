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
var authDiscogsObj = null;
const querystring = require('querystring');
var lfm = new LastfmAPI({
	'api_key' : config.lfm.key,
	'secret' : config.lfm.secret
});
var async = require("async");


var user_id = process.argv[2];
var job = process.argv[3];
console.log(user_id);
console.log(job);
switch(job){
    case 'getFullLibrary':
        getFullLibrary(user_id);
    break;
}

function getFullLibrary(userId){
    User.getById(userId).then(function(result){
        User.loadProfiles(result.dataValues,sqldb).then(u => {
		    var hasProfile = false;
		    var profileData = null;
		    if(u.ServicesProfiles.length == 0){
			    console.log('Profile not available');
		    }
        
            async.eachSeries(u.ServicesProfiles,function(sp,endServicesProfiles){
                console.log(sp.prefix);
                if(sp.prefix == 'disc')
		        {
                    USPD.getByUserAndServiceProfile(sp.UsersServicesProfiles.id).then(pd => {
                        var accessData = {
                            'oauth_token':pd.token,
                            'oauth_token_secret':pd.tokenSecret
                        }
                        authDiscogsObj = new Discogs(accessData);
                        endServicesProfiles();
                    }).catch(err => {
                        console.log(err);
                        endServicesProfiles();
                    });
                }
		        if(sp.prefix == 'lfm')
		        {
			        USPD.getByUserAndServiceProfile(sp.UsersServicesProfiles.id).then(pd => {
                        console.log(" getByUserAndServiceProfile ");
                        lfm.setSessionCredentials(pd.username, pd.session_key);
                        console.log(lfm);
                        endServicesProfiles();
			        }).catch(err => {
				        console.log('alaaarm !');
                        console.log(err);
                        endServicesProfiles();
			        });
                }
                
		    },function(err){
                buildLFMLibrary(0).then(r => {
                    console.log(r);
                });
            });
        });
    }).catch(err => {
        console.log(err);
    });
}

function buildLFMLibrary(artistPage){
	return new Promise((resolve,reject) => {
        console.log(lfm);
		var params = {
            'user' : lfm.sessionCredentials.username,
            'page' : parseInt(artistPage,10)+parseInt(1,10)
        }
        lfm.library.getArtists(params, function(err,artists){
            if(artists.artist.length != 0){
                artistPage = artists['@attr'].page;
                async.eachSeries(artists.artist,function(a,endArtists){
                    console.log('PROCESSING : '+a.name+' | page : '+artistPage);
                    buildLFMArtistLibrary(a,0).then(r => {
                        console.log(r);
                        endArtists();
                    })
                },function(err){
                    console.log("endArtists page - "+artistPage);
                    if(err != null){
                        console.log(err);
                    }else{
                        buildLFMLibrary(artistPage).then(r => {
                            console.log(r);
                            if(r == 'end of artists treatement'){
                                resolve(r);
                            }
                        });
                    }
                });
            }else{
                resolve("end of artists treatement");
            }
            
        });
	});
}

function buildLFMArtistLibrary(a,tracksPage){
	return new Promise((resolve,reject) => {
        var querystring = require("querystring");
        var encodedArtistName = querystring.escape(a.name);
        console.log(encodedArtistName);
        var params = {
            'user' : lfm.sessionCredentials.username,
            'artist':encodedArtistName,
            'page':parseInt(tracksPage,10)+parseInt(1,10)
        }
        lfm.user.getArtistTracks(params, function(err, artistTracks){
            if(artistTracks.track.length != 0){
                tracksPage = artistTracks['@attr'].page;
                async.eachSeries(artistTracks.track,function(t,endTrack){
                    /* TRACK PROCESSING */
                    console.log(a.name+" - "+t.album['#text']);
                    var query = {
                        artist: a.name,
                        releaseTitle: t.album['#text'],
                        type: 'master'
                    }
                    var discogsDB = authDiscogsObj.database();
                    discogsDB.search(query).then(function(result){ 
                        console.log(result);
                        endTrack();
                    })
                    endTrack();
                },function(err){
                    if(err != null){
                        resolve(err);
                    }else{
                        buildLFMArtistLibrary(a,tracksPage).then(r => {
                            console.log(r);
                            if(r == 'end of tracks treatement'){
                                resolve(r);
                            }
                        })
                    }
                    console.log("end tracks of artist---------------------------------------------------");
                });
                
            }else{
                resolve("end of tracks treatement");
            }
        });
	});
}