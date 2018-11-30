var config = require('../config');
var sqldb = require('../sqldb');
var libraryModel = require('../sqldb/Library');
var User = sqldb.User;
var ServicesProfiles = sqldb.ServicesProfiles;
var USP = sqldb.UsersServicesProfiles;
var USPD = sqldb.UsersServicesProfilesData;
var async = require("async");
require("../utilities/prototyping");
var Discogs = require('disconnect').Client;
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/synchronizer.log.json' })
    ]
});

function DiscogsSynchronizer(userId,library,discogsDB){
    this.DiscogsDB = discogsDB;
    this.LibraryToSync = library;
    this.UserId = userId;
    this.ArtistToRemove = [];
    var self = this;

    this.Sync = function(){
        return new Promise((resolve,reject) => {
            async.eachSeries(self.LibraryToSync.artists,function(artistToSync,endLibraryArtist){
                async.eachSeries(artistToSync.Albums,function(albumToSync,endLibraryAlbum){
                    console.log(albumToSync);
                    var query = albumToSync.Album.title;
                    var params = {
                        artist: artistToSync.Artist.name,
                        releaseTitle: albumToSync.Album.title,
                        type: 'master'
                    }
                    self.DiscogsDB.search(query,params,function(err, data, rateLimit){
                        if(data.results.length > 0){
                            logger.log('info', 
                                'Discogs MASTER for '+artistToSync.Artist.name+" - "+albumToSync.Album.title, 
                                data.results[0]);
                            albumToSync.Album.id_disc = data.results[0].id;
                            albumToSync.Album.disc_type = data.results[0].type;
                            this.SyncArtist(albumToSync,data.results[0].artists).then(syncedArtist => {
                                artistToSync.SubArtists = syncedArtist;
                                endLibraryAlbum();
                            });
                            
                        }else{
                            params = {
                                artist: artistToSync.Artist.name,
                                releaseTitle: albumToSync.Album.title,
                                type: 'release'
                            }
                            self.DiscogsDB.search(query,params,function(err, data, rateLimit){
                                if(data.results.length > 0){
                                    logger.log('info', 
                                        'Discogs RELEASE for '+artistToSync.Artist.name+" - "+albumToSync.Album.title, 
                                        data.results[0]);
                                    albumToSync.Album.id_disc = data.results[0].id;
                                    albumToSync.Album.disc_type = data.results[0].type;
                                    console.log(rateLimit);
                                }else{
                                    logger.log('info', 
                                        'Discogs NO RESULTS for '+artistToSync.Artist.name+" - "+albumToSync.Album.title,"");
                                }
                                endLibraryAlbum();
                            });
                        }
                    });
                },
                function(){
                    endLibraryArtist();
                });
            },
            function(){
                resolve(self.LibraryToSync);
            });
            
        });
    }

    this.SyncArtist = function(_albumToSync,_discogsArtists){
        return new Promise((resolve,reject) => {
            var results = {
                name:"",
                subArtists:[]
            };
            if(_discogsArtists.length > 1){
                async.eachSeries(_discogsArtists.artists,function(da,endDiscogsArtist){
                    results.name+=da.name+" "+da.join;
                    results.subArtists.push(new libraryModel.LibraryArtist({
                        name:da.name,
                        id_disc:da.id
                    }));
                    endDiscogsArtist();
                },function(){
                    results.name.replace(/^\,+|\,+$/g, '').trim();
                    resolve(results);
                });
            }else{
                resolve(results);
            }
        });
    }
}
function MCLKSynchronizer(userId,library,sourceProfilePrefix){
    this.LibraryToSync = library;
    this.UserId = userId;
    this.SourceProfilePrefix = sourceProfilePrefix;
    this.SourceProfileId = 0;
    this.ArtistToRemove = [];
    this.ArtistToChange = [];
    var self = this;
    this.SyncFromDatabase = function(){
        return new Promise((resolve,reject) => {
            User.getById(this.UserId).then(function(result){
                User.loadProfiles(result.dataValues,sqldb).then(u => {
                    async.eachSeries(u.ServicesProfiles,function(sp,endServicesProfiles){
                        console.log(sp.prefix);
                        if(sp.prefix == this.SourceProfilePrefix)
                        {
                            this.SourceProfileId = sp.id;
                        }
                        endServicesProfiles(this);
                    },function(err,rep){
                        async.eachSeries(self.LibraryToSync.artists,function(artistToSync,endLibraryArtist){
                            if(artistToSync.Artist["id_"+self.SourceProfilePrefix] != ""){
                                /* search for artist in database with its source id (lfm,disc,...)  */
                                artistToSync.Artist["existsBy"+self.SourceProfilePrefix.capitalize()]().then(artistDB => {
                                    if(artistToSync.Artist.name != artistDB.name){
                                        self.ArtistToRemove.push(artistToSync.Artist.name);
                                    }
                                    self.LibraryToSync.artists[artistDB.name].Artist = artistDB;
                                    // Browse Albums for this artist in this source
                                    async.eachSeries(artistToSync.Albums,function(albumToSync,endArtistAlbum){
                                        /* search for album in database with its source id (lfm,disc,...) */
                                        albumToSync["existsBy"+self.SourceProfilePrefix.capitalize()]().then(albumDB => {
                                            if(albumToSync.title != albumDB.title){
                                                self.AlbumToRemove.push(albumToSync.title);
                                            }
                                            self.LibraryToSync.artists[artistDB.name].Albums[albumDB.title] = albumDB;
                                            endArtistAlbum();
                                        }).catch(err => {
                                            endArtistAlbum();
                                        });
                                    },function(){
                                        endLibraryArtist();
                                    });
                                }).catch(err => {
                                    endLibraryArtist();
                                });
                            }else{
                                endLibraryArtist();
                            }
                        },
                        function(){
                            resolve(self.LibraryToSync);
                        });
                    });
                });
            });
        });
    }
    
}
exports.MCLKSynchronizer = MCLKSynchronizer;
exports.DiscogsSynchronizer = DiscogsSynchronizer;