/**
 * Created by Ronald Corazza on 12-07-2018.
 */
'use strict';
var utilities = require('../components/utilities');

module.exports = function(sequelize, DataTypes) {
  var UsersServicesProfilesAlbums = sequelize.define('UsersServicesProfilesAlbums',  {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    album_id: {
        type: DataTypes.BIGINT,
        primaryKey: false,
        allowNull: false,
    },
    usersServicesProfiles_id: {
        type: DataTypes.BIGINT,
        primaryKey: false,
        allowNull: false,
    },
    albumsNameVariationId: {
        type: DataTypes.BIGINT,
        primaryKey: false,
        allowNull: false,
    },
  }, {
    tableName: 'mclk_usersServicesProfiles_albums', 
    timestamps: false,
    underscored: true,

    classMethods: {
		  associate: function associate(models) {
			//User.hasMany(models.OAuthClient);
			//UsersServicesProfilesData.hasOne(models.UsersServicesProfiles, {sourceKey: 'usersServicesProfiles_id', foreignKey: 'id'});
            UsersServicesProfilesAlbums.belongsTo(models.UsersServicesProfiles, {sourceKey: 'usersServicesProfiles_id', foreignKey: 'id'});
            UsersServicesProfilesAlbums.belongsTo(models.Album, {sourceKey: 'album_id', foreignKey: 'id'});
            UsersServicesProfilesAlbums.belongsTo(models.AlbumsNameVariations, {sourceKey: 'albumNameVariationId', foreignKey: 'id'});
        }
    }
  });
  
  return UsersServicesProfilesAlbums;
}

