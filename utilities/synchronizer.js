require("../utilities/prototyping");
// model dependencies
var sqldb = require('../sqldb');
var libraryModel = require('../sqldb/Library');
var User = sqldb.User;
var ArtistsNameVariations = sqldb.ArtistsNameVariations;
var AlbumsNameVariations = sqldb.AlbumsNameVariations;
var ArtistsFathers = sqldb.ArtistsFathers;
var AlbumsArtists = sqldb.AlbumsArtists;

// log dependencies
var d = new Date();
var m = d.getMonth()+1;
var y = d.getFullYear();
var dy = d.getDate();
var h = d.getHours();
var i = d.getMinutes();
var s = d.getSeconds();
var now = y.toString()+m.toString()+dy.toString()+"-"+h+"_"+i+"_"+s;
const winston = require('winston');
const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'logs/synchronizer_'+now+'.log.json' })
    ]
});

// module dependencies
var async = require("async");
var levenshtein = require('fast-levenshtein');
var Enumerable = require('linq');

function Ranker(album){
    this.Rank = 0;
    this.Album = album;
}

function DiscogsSynchronizer(userId,library,discogsDB,sourceProfilePrefix){
    this.DiscogsDB = discogsDB;
    this.LibraryToSync = library;
    this.UserId = userId;
    this.SourceProfilePrefix = sourceProfilePrefix;
    this.LibraryElementsToRemove = [];
    var self = this;

    this.CleanLibrary = function(){
        return new Promise((resolve,reject) => {
            console.log("Clean it");
            async.eachSeries(self.LibraryElementsToRemove,function(element,endRemoveElement){
                console.log(element);
                async.eachSeries(element,function(e,endElement){
                    console.log(e.artistName);
                    delete self.LibraryToSync.artists[e.artistName].Albums[e.albumTitle];
                    if(Object.keys(self.LibraryToSync.artists[e.artistName].Albums).length == 0){
                        delete self.LibraryToSync.artists[e.artistName];
                    }
                    endElement();
                },function(){
                    endRemoveElement();
                });
                
            },function(){
                resolve("done");
            });
        });
    }

    this.FindBestMatch = function(_collection,_comparisonProperty,_comparisonElement){
        return new Promise((resolve,reject) => {
            var rankingResults = [];
            async.eachSeries(_collection,function(element,endRanking){
                var ranker = new Ranker(element);
                ranker.rank = levenshtein.get(element[_comparisonProperty],_comparisonElement);
                var threshold = 1;
                if(element[_comparisonProperty].length > _comparisonElement.length)
                {
                    threshold = element[_comparisonProperty].length;
                }else{
                    threshold = _comparisonElement.length;
                }
                var percentValue = 100 / threshold;
                var differencePercentage = ranker.rank * percentValue;
                ranker.score = 100 - differencePercentage;
                rankingResults.push(ranker);
                endRanking();
            },function(){
                var bestMatch = Enumerable.from(rankingResults).orderByDescending("$.score",function(key,value){
                    return value;
                }).first();
                resolve(bestMatch.Album);
            });
        });   
    }

    this.GetMasterRelease = function(_masterReleaseId){
        return new Promise((resolve,reject) => {
            self.DiscogsDB.getMaster(_masterReleaseId,function(err, data){
                if(!err){
                    resolve(data);
                }else{
                    reject(err);
                }
            });
        });
    }

    this.GetRelease = function(_releaseId){
        return new Promise((resolve,reject) => {
            self.DiscogsDB.getRelease(_releaseId,function(err, data){
                if(!err){
                    resolve(data);
                }else{
                    reject(err);
                }
            });
        });
    }

    this.SearchForResults = function(_query,_params){
        return new Promise((resolve,reject) => {
            self.DiscogsDB.search(_query,_params,function(err, data, rateLimit){
                if(data.results == null){
                    logger.log('info', 
                                'Discogs Search failed', 
                                _query,_params,err);
                    reject('Discogs Search failed');
                }else{
                    resolve(data.results);
                }
            });
        });
    }
    // test
    this.Sync = function(){
        return new Promise((resolve,reject) => {
            async.eachSeries(self.LibraryToSync.artists,function(artistToSync,endLibraryArtist){
                async.eachSeries(artistToSync.Albums,function(albumToSync,endLibraryAlbum){
                    console.log("____________________________________________________________________________");
                    console.log("Synchro discogs for "+artistToSync.Artist.name+" - "+albumToSync.Album.title);
                    console.log("____________________________________________________________________________");
                    var query = albumToSync.Album.title;
                    var params = {
                        artist: artistToSync.Artist.name,
                        releaseTitle: albumToSync.Album.title,
                        type: 'master'
                    }

                    console.log("Searching... ");

                    self.SearchForResults(query,params).then(r => {
                        self.FindBestMatch(r,"title",artistToSync.Artist.name+" - "+albumToSync.Album.title).then(bestMatch => {
                            self.GetMasterRelease(bestMatch.id).then(masterRelease => {
                                if(masterRelease.artists != null){
                                    self.SyncElements(artistToSync,albumToSync,masterRelease,params.type).then(elementToRemove => {
                                        self.LibraryElementsToRemove.push(elementToRemove);
                                        endLibraryAlbum();
                                    });
                                }
                            }).catch(err => {
                                logger.log('info', 
                                'Get Master Release Failed', 
                                err);
                                endLibraryAlbum();
                            });
                        }).catch(err => {
                            logger.log('info', 
                            'Find Master Best Match Failed', 
                            err);
                            endLibraryAlbum();
                        });
                    }).catch(err => {
                        params = {
                            artist: artistToSync.Artist.name,
                            releaseTitle: albumToSync.Album.title,
                            type: 'release'
                        };
                        self.SearchForResults(query,params).then(r => {
                            self.FindBestMatch(r,"title",artistToSync.Artist.name+" - "+albumToSync.Album.title).then(bestMatch => {
                                self.getRelease(bestMatch.id).then(release => {
                                    if(release.artists != null){
                                        self.SyncElements(artistToSync,albumToSync,release,params.type).then(elementToRemove => {
                                            self.LibraryElementsToRemove.push(elementToRemove);
                                            endLibraryAlbum();
                                        });
                                    }
                                }).catch(err => {
                                    logger.log('info', 
                                    'Get Release Failed', 
                                    err);
                                    endLibraryAlbum();
                                })
                            }).catch(err => {
                                logger.log('info', 
                                    'Find Release Best Match Failed', 
                                    err);
                                endLibraryAlbum();
                            });
                        }).catch(err => {
                            logger.log('info', 
                                    'Search Release Failed', 
                                    err);
                            endLibraryAlbum();
                        });
                        endLibraryAlbum();
                    });
                },
                function(){
                    endLibraryArtist();
                });
            },
            function(){
                self.CleanLibrary();
                resolve(self.LibraryToSync);
            });
            
        });
    }
    
    this.SyncElements = function(_artistToSync,_albumToSync,_discogsMaster,_discType){
        return new Promise((resolve,reject) => {
            var results = {
                name:"",
                artists:[],
                service_type:self.SourceProfilePrefix,
                service_id:_artistToSync.Artist["id_"+self.SourceProfilePrefix]
            };
            var toRemove = [];
            // Composed artists : Iterate through all artists (Ex : DJ Food & DK)
            async.eachSeries(_discogsMaster.artists,function(da,endDiscogsArtist){
                results.name+=da.name+" "+da.join+" ";
                var subArtist = new libraryModel.LibraryArtist({
                    name:da.name
                });
                subArtist.Artist.id_disc = da.id;
                results.artists.push(subArtist);
                endDiscogsArtist();
            },function(){
                results.name = results.name.replace(/^\,+|\,+$/g, '').trim();
                console.log(_artistToSync.Artist.name+" != "+results.name);
                if(_artistToSync.Artist.name != results.name){
                    toRemove.push({
                        artistName:_artistToSync.Artist.name,
                        albumTitle:_albumToSync.Album.title
                    });
                    // Fill library with new official artists
                    if(!self.LibraryToSync.artists.hasOwnProperty(results.name)){
                        self.LibraryToSync.artists[results.name] = new libraryModel.LibraryArtist({
                            name:results.name
                        });
                        console.log(results.artists.length);
                        if(results.artists.length > 1){
                            self.LibraryToSync.artists[results.name].SubArtists = results.artists;
                        }else{
                            if(results.artists.length == 1){
                                self.LibraryToSync.artists[results.name].Artist.id_disc = results.artists[0].id_disc;
                            }
                        }
                    }
                    
                    /* Check if this name variation exist and set it in object */
                    var nameVariationExists = Enumerable.from(self.LibraryToSync.artists[results.name].NameVariations).where(function(nv){return nv.name == _artistToSync.Artist.name},function(key,value){
                        return value;
                    }).count() == 0?false:true;
                    
                    if(!nameVariationExists){
                        var nv = ArtistsNameVariations.build({
                            name:_artistToSync.Artist.name,
                            service_type:self.SourceProfilePrefix,
                            service_id:_artistToSync.Artist["id_"+self.SourceProfilePrefix]
                        });
                        nv.service_id = _artistToSync.Artist["id_"+self.SourceProfilePrefix];
                        nv.service_type = self.SourceProfilePrefix;
                        self.LibraryToSync.artists[results.name].NameVariations.push(nv);
                    }
                    

                    // Fill Album into artist
                    if(!self.LibraryToSync.artists[results.name].Albums.hasOwnProperty(_discogsMaster.title)){
                        var la = new libraryModel.LibraryAlbum({
                            title:_discogsMaster.title
                        });
                        la.id_disc = _discogsMaster.id;
                        self.LibraryToSync.artists[results.name].Albums[_discogsMaster.title] = la;
                    }

                    // if album from dicogs has not the same title as the album to sync
                    // check name variations ans set it
                    if(_albumToSync.Album.title != _discogsMaster.title){
                        var nameVariationExists = Enumerable.from(self.LibraryToSync.artists[results.name].Albums[_discogsMaster.title].NameVariations).where(function(nv){return nv.name == _albumToSync.Album.title},function(key,value){
                            return value;
                        }).count() == 0?false:true;
                        if(!nameVariationExists){
                            var nv = AlbumsNameVariations.build({
                                title:_albumToSync.Album.title
                            });
                            nv.service_type = self.SourceProfilePrefix;
                            nv.service_id = _albumToSync.Album["id_"+self.SourceProfilePrefix];
                            self.LibraryToSync.artists[results.name].Albums[_discogsMaster.title].NameVariations.push(nv);
                        }
                    }
                }else{
                    // Update artists with info received from discogs
                    self.LibraryToSync.artists[results.name].Artist.id_disc = results.artists[0].Artist.id_disc;
                    // if album from dicogs has not the same title as the album to sync
                    // - album must be removed from the existing artist
                    // - check name variations ans set it
                    if(_albumToSync.Album.title != _discogsMaster.title){
                        // Remove album
                        toRemove.push({
                            artistName:_artistToSync.Artist.name,
                            albumTitle:_albumToSync.Album.title
                        });

                        // check if album already exist in object
                        // - create one if not
                        if(!self.LibraryToSync.artists[results.name].Albums.hasOwnProperty(_discogsMaster.title)){
                            // Create it
                            var la = new libraryModel.LibraryAlbum({
                                title:_discogsMaster.title
                            });
                            la.id_disc = _discogsMaster.id;
                            self.LibraryToSync.artists[results.name].Albums[_discogsMaster.title] = la;
                        }
                        
                        // Check if name vaiation exists in object
                        // if not create one
                        var nameVariationExists = Enumerable.from(self.LibraryToSync.artists[results.name].Albums[_discogsMaster.title].NameVariations).where(function(nv){return nv.name == _albumToSync.Album.title},function(key,value){
                            return value;
                        }).count() == 0?false:true;
                        if(!nameVariationExists){
                            var nv = AlbumsNameVariations.build({
                                title:_albumToSync.Album.title
                            });
                            nv.service_type = self.SourceProfilePrefix;
                            nv.service_id = _albumToSync.Album["id_"+self.SourceProfilePrefix];
                            self.LibraryToSync.artists[results.name].Albums[_discogsMaster.title].NameVariations.push(nv);
                        }
                    }else{
                        self.LibraryToSync.artists[results.name].Albums[_discogsMaster.title].Album.id_disc = _discogsMaster.id;
                        self.LibraryToSync.artists[results.name].Albums[_discogsMaster.title].Album.disc_type = _discType;
                    }

                }
                resolve(toRemove);
            });
            
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
                        if(sp.prefix == this.SourceProfilePrefix)
                        {
                            this.SourceProfileId = sp.id;
                        }
                        endServicesProfiles(this);
                    },function(err,rep){
                        async.eachSeries(self.LibraryToSync.artists,function(artistToSync,endLibraryArtist){
                            console.log(artistToSync.Artist);
                            if(artistToSync.Artist["id_"+self.SourceProfilePrefix] != ""){
                                /* search for artist in database with its source id (lfm,disc,...)  */
                                artistToSync.Artist["existsBy"+self.SourceProfilePrefix.capitalize()](artistToSync.Artist["id_"+self.SourceProfilePrefix]).then(artistDB => {
                                    if(artistToSync.Artist.name != artistDB.name){
                                        self.ArtistToRemove.push(artistToSync.Artist.name);
                                    }
                                    self.LibraryToSync.artists[artistDB.name].Artist = artistDB;
                                    // Browse Albums for this artist in this source
                                    async.eachSeries(artistToSync.Albums,function(albumToSync,endArtistAlbum){
                                        /* search for album in database with its source id (lfm,disc,...) */
                                        albumToSync.Album["existsBy"+self.SourceProfilePrefix.capitalize()]().then(albumDB => {
                                            if(albumToSync.Album.title != albumDB.title){
                                                self.AlbumToRemove.push(albumToSync.title);
                                            }
                                            self.LibraryToSync.artists[artistDB.name].Albums[albumDB.title].Album = albumDB;
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
    this.SyncToDatabase = function(){
        return new Promise((resolve,reject) => {
            User.getById(this.UserId).then(function(result){
                User.loadProfiles(result.dataValues,sqldb).then(u => {
                    async.eachSeries(u.ServicesProfiles,function(sp,endServicesProfiles){
                        if(sp.prefix == this.SourceProfilePrefix)
                        {
                            this.SourceProfileId = sp.id;
                        }
                        endServicesProfiles(this);
                    },function(err,rep){
                        async.eachSeries(self.LibraryToSync.artists,function(artistToSync,endLibraryArtist){
                            // Artist has no dicogs id
                            // means composite artist (has sub artist) or not found in discogs
                            //if(artistToSync.Artist.hasOwnProperty("id_disc") != ""){
                                self.SyncArtistToDatabase(artistToSync).then(syncedArtist => {
                                    artistToSync = syncedArtist;
                                    if(artistToSync.SubArtists.length > 1){
                                        async.eachSeries(artistToSync.SubArtists,function(composedArtistToSync,endComposedArtist){
                                            self.SyncArtistToDatabase(composedArtistToSync).then(composedSyncedArtist => {
                                                composedArtistToSync = composedSyncedArtist;
                                                var artistFather = ArtistsFathers.build({
                                                    artist_id:composedSyncedArtist.Artist.id,
                                                    father_id:syncedArtist.Artist.id
                                                });
                                                artistFather.save().then(fatherArtistSaved => {
                                                    endComposedArtist();
                                                });
                                            })
                                        },function(){
                                            endLibraryArtist();
                                        });
                                    }else{
                                        endLibraryArtist();
                                    }
                                });
                            //}else{
                                // Artist is composite artist
                                
                            //}
                        },
                        function(){
                            resolve(self.LibraryToSync);
                        });
                    });
                });
            });
        });
    }
    
    this.SyncArtistToDatabase = function(_artist){
        /* search for artist in database with its source id (lfm,disc,...)  */
        return new Promise((resolve,reject) => {
            _artist.Artist["existsByDisc"](_artist.Artist["id_disc"]).then(artistDB => {
                _artist.Artist = artistDB;
                if(_artist.Albums.length > 0){
                    self.SyncAlbumsToDatabase(_artist.Albums,artistDB).then(albums => {
                        _artist.Albums = albums;
                        resolve(_artist);
                    }); 
                }else{
                    resolve(_artist);
                }
            }).catch(err => {
                _artist.Artist.save().then(savedArtist => {
                    console.log(_artist.Artist.NameVariations);
                    async.eachSeries(_artist.NameVariations,function(nv,endNameVariationsSync){
                        nv.artist_id = savedArtist.id;
                        nv.existsByName(nv.name).then(nvDB => {
                            nv = nvDB;
                            endNameVariationsSync();
                        }).catch(err => {
                            console.log('does not exist');
                            nv.save().then(savedNv => {
                                nv = savedNv;
                                endNameVariationsSync();
                            }).catch(errorNameVariation => {
                                logger.log('info', 
                                    'Save artist name variation to database failed', 
                                    errorNameVariation);
                                reject('SyncArtistToDatabase - Error Saving Artist Name Variation');
                            })
                        })
                    },function(err,rep){
                        _artist.Artist = savedArtist;
                        console.log('End Name Variation');
                        //self.LibraryToSync.artists[savedArtist.name].Artist = savedArtist;
                        self.SyncAlbumsToDatabase(_artist.Albums,savedArtist).then(albums => {
                            _artist.Albums = albums;
                            resolve(_artist);
                        }).catch(errorAlbums => {
                            logger.log('info', 
                            errorAlbums);
                            reject('SyncArtistToDatabase - '+errorAlbums.toString());    
                        });
                        
                    });
                }).catch(errorArtist => {
                    logger.log('info', 
                        'Save artist to database failed', 
                        errorArtist);
                    reject('SyncArtistToDatabase - Error Saving Artist');
                });
            });
        });
    }
    this.SyncAlbumsToDatabase = function(_albums,_artist){
        return new Promise((resolve,reject) => {
            console.log('sync albums to database');
             // Browse Albums for this artist in this source
             async.eachOf(_albums,function(albumToSyncValue,AlbumToSyncKey,endArtistAlbum){
                /* search for album in database with its source id (lfm,disc,...) */
                albumToSyncValue.Album["existsByDisc"](albumToSyncValue.Album.id_disc).then(albumDB => {
                    _albums[AlbumToSyncKey].Album = albumDB;
                    async.eachSeries(_albums[AlbumToSyncKey].NameVariations,function(nv,endNameVariationsSync){
                        nv.album_id = albumDB.id;
                        nv.existsByTitle(nv.title).then(nvDB => {
                            nv = nvDB;
                            endNameVariationsSync();
                        }).catch(err => {
                            nv.save().then(savedNv => {
                                nv = savedNv;
                                endNameVariationsSync();
                            }).catch(errorNameVariation => {
                                logger.log('info', 
                                    'Save album name variation to database failed', 
                                    errorNameVariation);
                                reject('SyncAlbumsToDatabase - Error Saving Album Name Variation');
                            })
                        })
                    },function(err,rep){
                        endArtistAlbum();
                    });
                    
                }).catch(err => {
                    albumToSyncValue.Album.save().then(savedAlbum => {
                        _albums[AlbumToSyncKey].Album = savedAlbum;
                        
                        async.eachSeries(_albums[AlbumToSyncKey].NameVariations,function(nv,endNameVariationsSync){
                            nv.album_id = savedAlbum.id;
                            nv.existsByTitle(nv.title).then(nvDB => {
                                nv = nvDB;
                                endNameVariationsSync();
                            }).catch(err => {
                                nv.save().then(savedNv => {
                                    nv = savedNv;
                                    endNameVariationsSync();
                                }).catch(errorNameVariation => {
                                    logger.log('info', 
                                        'Save album name variation to database failed', 
                                        errorNameVariation);
                                    reject('SyncAlbumsToDatabase - Error Saving Album Name Variation');
                                })
                            })
                        },function(err,rep){
                            var albumsArtists = AlbumsArtists.build({
                                artist_id:_artist.id,
                                album_id:savedAlbum.id
                            });
                            albumsArtists.save().then(albumsArtistsSaved => {
                                endArtistAlbum();
                            });
                            //endArtistAlbum();
                        });
                    }).catch(errorSaveAlbum => {
                        logger.log('info', 
                                    'Save album to database failed', 
                                    errorSaveAlbum);
                        reject('SyncAlbumsToDatabase - Error Saving Album');      
                    });
                });
            },function(){
                resolve(_albums);
            });
        });
    }
}
exports.MCLKSynchronizer = MCLKSynchronizer;
exports.DiscogsSynchronizer = DiscogsSynchronizer;