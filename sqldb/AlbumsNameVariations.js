/**
 * Created by Sherlockness on 25-09-2018.
 */
'use strict';
var utilities = require('../components/utilities');


module.exports = function(sequelize, DataTypes) {
  var AlbumsNameVariations = sequelize.define('AlbumsNameVariations',  {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    album_id: {
      type: DataTypes.BIGINT,
      primaryKey: false,
      allowNull: false,
    },
    service_type: DataTypes.STRING(5),
    service_id: DataTypes.STRING(100),
    title: DataTypes.STRING(1000),
  }, 
  {
    tableName: 'mclk_albumsNameVariations', // oauth_users 
    timestamps: false,
    underscored: true,

    classMethods: {
		/*associate: function associate(models) {
			Artist.belongsToMany(models.Artist, { as: 'FatherArtists', through: models.ArtistsFathers , foreignKey: 'artitst_id', otherKey: 'father_id'});
			Artist.hasMany(model.Artist)
		}*/
	},

	instanceMethods: {
		existsByTitle: function(vTitle){
			return new Promise((resolve,reject) => {
				AlbumsNameVariations.findOne({
					where: {title: vTitle}
				}).then(nv => {
					if(nv === null){
						reject({
							status:'error',
							message:'album name variation not found'
						});
					}else{
						resolve(nv);
					}
				});
			})
		}
	}
  });

  return AlbumsNameVariations;
}

