/**
 * Created by Ronald Corazza on 12-07-2018.
 */
'use strict';
var utilities = require('./../components/utilities');

module.exports = function(sequelize, DataTypes) {
  var UsersServicesProfilesArtists = sequelize.define('UsersServicesProfilesArtists',  {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    artist_id: {
        type: DataTypes.BIGINT,
        primaryKey: false,
        allowNull: false,
    },
    usersServicesProfiles_id: {
        type: DataTypes.BIGINT,
        primaryKey: false,
        allowNull: false,
    },
    artistNameVariationId: {
        type: DataTypes.BIGINT,
        primaryKey: false,
        allowNull: false,
    },
  }, {
    tableName: 'mclk_usersServicesProfiles_artists', 
    timestamps: false,
    underscored: true,

    classMethods: {
		associate: function associate(models) {
			//User.hasMany(models.OAuthClient);
			//UsersServicesProfilesData.hasOne(models.UsersServicesProfiles, {sourceKey: 'usersServicesProfiles_id', foreignKey: 'id'});
            UsersServicesProfilesArtists.belongsTo(models.UsersServicesProfiles, {sourceKey: 'usersServicesProfiles_id', foreignKey: 'id'});
            UsersServicesProfilesArtists.belongsTo(models.Artist, {sourceKey: 'artist_id', foreignKey: 'id'});
            UsersServicesProfilesArtists.belongsTo(models.ArtistsNameVariations, {sourceKey: 'artistNameVariationId', foreignKey: 'id'});
        }
    }
  });
  
  return UsersServicesProfilesArtists;
}

