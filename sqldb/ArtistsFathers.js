/**
 * Created by Sherlockness on 25-09-2018.
 */
'use strict';
var utilities = require('../components/utilities');


module.exports = function(sequelize, DataTypes) {
  var ArtistsFathers = sequelize.define('ArtistsFathers',  {
    artist_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
		},
		father_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
  }, {
    tableName: 'mclk_artists_fathers', // oauth_users
    timestamps: false,
    underscored: true,

    classMethods: {
		/*associate: function associate(models) {
			Artist.belongsToMany(models.Artist, { as: 'FatherArtists', through: models.ArtistsFathers , foreignKey: 'artitst_id', otherKey: 'father_id'});
			Artist.hasMany(model.Artist)
		} */
	},

	instanceMethods: {
		
	}
  });

  return ArtistsFathers;
}

