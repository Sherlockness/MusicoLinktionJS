var config = require('../config');
var sqldb = require('./../sqldb');
var libraryModel = require('./../sqldb/Library');
var User = sqldb.User;
var ServicesProfiles = sqldb.ServicesProfiles;
var USP = sqldb.UsersServicesProfiles;
var USPD = sqldb.UsersServicesProfilesData;
var Artist = sqldb.Artist;
var utilities = require('./../components/utilities');
var LastfmAPI = require('lastfmapi');
var Discogs = require('disconnect').Client;
var Synchronizer = require('./../utilities/synchronizer');

var authDiscogsObj = null;
var discogsDB=null;
const querystring = require('querystring');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/lastfm_job.log.json' })
    ]
});

var lfm = new LastfmAPI({
	'api_key' : config.lfm.key,
	'secret' : config.lfm.secret
});
var async = require("async");
var albumTraite = [];

var library = new libraryModel.Library();
var user_id = process.argv[2];
var job = process.argv[3];
switch(job){
    case 'getFullLibrary':
        getFullLibrary(user_id);
    break;
}

function getFullLibrary(userId){
    User.getById(userId).then(function(result){
        // load services profile
        User.loadProfiles(result.dataValues,sqldb).then(u => {
		    var hasProfile = false;
		    var profileData = null;
		    if(u.ServicesProfiles.length == 0){
			    console.log('Profile not available');
		    }
            /* Test */
            async.eachSeries(u.ServicesProfiles,function(sp,endServicesProfiles){
                console.log(sp.prefix);
                if(sp.prefix == 'disc')
		        {
                    USPD.getByUserAndServiceProfile(sp.UsersServicesProfiles.id).then(pd => {
                        var accessData = { method: 'oauth',
                        level: 2,
                        consumerKey: config.disc.key,
                        consumerSecret: config.disc.secret,
                        token: pd.token,
                        tokenSecret: pd.token_secret }
                        authDiscogsObj = new Discogs(accessData);
                        discogsDB = authDiscogsObj.database();
                        logger.log('info', 'DiscogsDatabase', discogsDB);
                        endServicesProfiles();
                    }).catch(err => {
                        console.log(err);
                        endServicesProfiles();
                    });
                }
		        if(sp.prefix == 'lfm')
		        {
			        USPD.getByUserAndServiceProfile(sp.UsersServicesProfiles.id).then(pd => {
                        lfm.setSessionCredentials(pd.username, pd.session_key);
                        endServicesProfiles();
			        }).catch(err => {
				        console.log('alaaarm !');
                        console.log(err);
                        endServicesProfiles();
			        });
                }
                
		    },function(err){
                // Get last fm library and sync it 
                buildLFMLibrary(0).then(r => {
                    var fs = require('fs');
                    fs.writeFile("/tmp/lfmLibrary_afterlfm.json", JSON.stringify(library, null, 2) , 'utf-8', function(err) {
                        if(err) {
                            return console.log(err);
                        }
                        console.log("The file was saved!");
                    });
                    // FROM Database synchronisation
                    var MCLKSync = new Synchronizer.MCLKSynchronizer(userId,library,'lfm');
                    MCLKSync.SyncFromDatabase().then(l => {
                        fs.writeFile("/tmp/lfmLibrary_afterMCLK.json", JSON.stringify(l, null, 2) , 'utf-8', function(err) {
                            if(err) {
                                return console.log(err);
                            }
                            console.log("The file was saved!");
                        });
                        // Discogs sync for element that do not exists in database
                        var DiscogsSync = new Synchronizer.DiscogsSynchronizer(userId,library,discogsDB,'lfm');
                        DiscogsSync.Sync().then(ld => {
                            var fs = require('fs');
                            fs.writeFile("/tmp/lfmLibraryAfterDiscogs.json", JSON.stringify(ld, null, 2) , 'utf-8', function(err) {
                                if(err) {
                                    return console.log(err);
                                }
                                console.log("The file was saved!");
                            });
                            MCLKSync.SyncToDatabase().then(l => {
                                var fs = require('fs');
                                fs.writeFile("/tmp/lfmLibraryAfterToDatabase.json", JSON.stringify(l, null, 2) , 'utf-8', function(err) {
                                    if(err) {
                                        return console.log(err);
                                    }
                                    console.log("The file was saved!");
                                });
                            });
                        });
                    });
                });
            });
        });
    }).catch(err => {
        console.log(err);
    });
}

// DEBUG Purpose


function buildLFMLibrary(artistPage){
	return new Promise((resolve,reject) => {
		var params = {
            'user' : lfm.sessionCredentials.username,
            'page' : parseInt(artistPage,10)+parseInt(1,10)
        }
        var cpt = 0;
        lfm.library.getArtists(params, function(err,artists){
            if(artists.artist.length != 0 && params.page < 2){
                artistPage = artists['@attr'].page;
                async.eachSeries(artists.artist,function(a,endArtists){
                    if(cpt < 1){
                        console.log('PROCESSING : '+a.name+' | page : '+artistPage+' | cpt : '+cpt);
                        buildLFMArtistLibrary(a,0).then(r => {
                            cpt++;
                            endArtists();
                        })
                    }else{
                        resolve("end of artists treatement");
                    }
                },function(err){
                    if(err != null){
                        console.log(err);
                    }else{
                        buildLFMLibrary(artistPage).then(r => {
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
                    //console.log(t);
                    if(albumTraite.indexOf(a.name+" - "+t.album['#text']) === -1){
                        if(!library.artists.hasOwnProperty(a.name)){
                            library.artists[a.name] = new libraryModel.LibraryArtist({
                                name:a.name,
                            });
                            library.artists[a.name].Artist.id_lfm = a.mbid;
                        }
                        library.artists[a.name].Albums[t.album['#text']] = new libraryModel.LibraryAlbum({
                            title:t.album['#text']
                        });
                        library.artists[a.name].Albums[t.album['#text']].Album.id_lfm = t.album.mbid;
                        console.log("album traite : "+a.name+" - "+t.album['#text']);
                        albumTraite.push(a.name+" - "+t.album['#text']);
                        endTrack();
                    }else{
                        endTrack();
                    }
                },function(err){
                    if(err != null){
                        resolve(err);
                    }else{
                        buildLFMArtistLibrary(a,tracksPage).then(r => {
                            if(r == 'end of tracks treatement'){
                                resolve(r);
                            }
                        })
                    }
                });
                
            }else{
                resolve("end of tracks treatement");
            }
        });
	});
}