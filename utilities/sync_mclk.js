var config = require('../config');
var sqldb = require('./../sqldb');
var libraryModel = require('./../sqldb/Library');
var User = sqldb.User;
var ServicesProfiles = sqldb.ServicesProfiles;
var USP = sqldb.UsersServicesProfiles;
var USPD = sqldb.UsersServicesProfilesData;
var async = require("async");
require("prototyping");

function MCLKSynchronizer(userId,library,sourceProfilePrefix){
    this.LibraryToSync = library;
    this.UserId = userId;
    this.SourceProfilePrefix = sourceProfilePrefix;
    this.SourceProfileId = 0;
    this.ArtistToRemove = [];

    function SyncFromDatabase(){
        User.getById(userId).then(function(result){
            User.loadProfiles(result.dataValues,sqldb).then(u => {
                async.eachSeries(u.ServicesProfiles,function(sp,endServicesProfiles){
                    console.log(sp.prefix);
                    if(sp.prefix == SourceProfilePrefix)
                    {
                        this.SourceProfileId = sp.id;
                    }
                    endServicesProfiles();
                },function(err){
                    async.eachSeries(LibraryToSync.artists,function(artistToSync,endLibraryArtist){
                        if(artistToSync["id_"+SourceProfilePrefix] != ""){
                            artistToSync["existsBy"+SourceProfilePrefix.capitalize()]().then(artistDB => {
                                if(artistToSync.name != artistDB.name){
                                    ArtistToRemove.push(artistToSync.name);
                                }
                                LibraryToSync.artists[artistDB.name] = artistDB;
                                endLibraryArtist();
                            }).catch(err => {
                                endLibraryArtist();
                            });
                        }
                    },
                    function(){
    
                    });
                });
            });
        });
    }
    
}
exports.MCLKSynchronizer = MCLKSynchronizer;