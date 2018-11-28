/**
 * Created by Ronald Corazza on 12-07-2018.
 */
'use strict';
module.exports = function(sequelize, DataTypes) {
  var AlbumsArtists = sequelize.define('AlbumsArtists',  {
    album_id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      allowNull: false
    },
    artist_id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      allowNull: false
	  }
  }, {
    tableName: 'mclk_albums_artists', 
    timestamps: false,
    underscored: true,
    classMethods: {
      associate: function associate(models) {
        AlbumsArtists.hasOne(models.Artist, {foreignKey: 'id', sourceKey: 'artist_id'});
        AlbumsArtists.hasOne(models.Album, {foreignKey: 'id', sourceKey: 'album_id'});
      },
    },
  });
  
  return AlbumsArtists;
}

