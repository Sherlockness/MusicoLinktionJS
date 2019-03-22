/**
 * Created by Sherlockness on 25-09-2018.
 */
'use strict';
var utilities = require('../components/utilities');


module.exports = function(sequelize, DataTypes) {
  var ArtistsNameVariations = sequelize.define('ArtistsNameVariations',  {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    artist_id: {
      type: DataTypes.BIGINT,
      primaryKey: false,
      allowNull: false,
    },
    service_type: DataTypes.STRING(5),
    service_id: DataTypes.STRING(100),
    name: DataTypes.STRING(1000),
  }, 
  {
    tableName: 'mclk_artistsNameVariations', // oauth_users 
    timestamps: false,
    underscored: true,

    classMethods: {
		/*associate: function associate(models) {
			Artist.belongsToMany(models.Artist, { as: 'FatherArtists', through: models.ArtistsFathers , foreignKey: 'artitst_id', otherKey: 'father_id'});
			Artist.hasMany(model.Artist)
		}*/
	},

	instanceMethods: {
		existsByName: function(vName){
			return new Promise((resolve,reject) => {
				ArtistsNameVariations.findOne({
					where: {name: vName}
				}).then(nv => {
					if(nv === null){
						reject({
							status:'error',
							message:'artist name variation not found'
						});
					}else{
						resolve(nv);
					}
				});
			})
		}
	}
  });

  return ArtistsNameVariations;
}

