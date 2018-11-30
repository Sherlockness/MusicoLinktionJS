'use strict';
var sqldb = require('./../sqldb');
var ModelArtist = sqldb.Artist;

function ArtistLibrary(_artist){
    this.Artist = ModelArtist.build({
        name:_artist.name,
        id_lfm:_artist.id_lfm
    });
    this.Albums = {};
    this.SubArtists = {};
}
var ModelAlbum = sqldb.Album;
function AlbumLibrary(_album) {
    this.Album = ModelAlbum.build({
        title:_album.title,
        id_lfm:_album.id_lfm
    });
    this.Tracks = [];
}

function Library() {
    var library = {
        artists:{}
    };
    
    return library;
}
exports.LibraryArtist = ArtistLibrary;
exports.LibraryAlbum = AlbumLibrary;
exports.Library = Library;
/*var Track = sqldb.Track

function LibraryArtist(_artistName){
    var Artist = sqldb.Artist;
    var libraryArtist = sequelize.define('LibraryArtist', extend(Artist.schema, {someOtherField:DataTypes.Text}), Artist.options);
    var libraryArtist = {
        Name:_artistName,
        Albums:{}
    }
    return libraryArtist;
}

function LibraryAlbum(_artistName, _title){
    var libraryAlbum = {
        ArtistName:_artistName,
        Title:_title,
        Tracks:[]
    }
    return libraryAlbum;
}

function LibraryTrack(_artistName,_albumTitle,_trackTitle){
    var libraryTrack = {
        ArtistName : _artistName,
        AlbumTitle : _albumTitle,
        TrackTitle : _trackTitle
    }
    return libraryTrack;
}

function Library() {
    var library = {
        artists:{}
    };
    
    return library;
  }

  exports.LibraryArtist = LibraryArtist;
  exports.LibraryAlbum = LibraryAlbum;
  exports.LibraryTrack = LibraryTrack;
  exports.Library = Library;*/
