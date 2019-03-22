/**
 * Created by Sherlockness on 25-09-2018. 
 */
'use strict';
var utilities = require('./../components/utilities');


module.exports = function(sequelize, DataTypes) {
  var Artist = sequelize.define('Artist',  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    id_lfm: DataTypes.STRING(50),
		id_disc: DataTypes.BIGINT,
		name: DataTypes.STRING(1000),
  }, {
    tableName: 'mclk_artists', // oauth_users 
    timestamps: false,
    underscored: true,

    classMethods: {
		associate: function associate(models) {
			Artist.belongsToMany(models.Artist, { as: 'ArtistsFathers', through: models.ArtistsFathers , foreignKey: 'artist_id', otherKey: 'father_id'});
			Artist.belongsToMany(models.Album, { as: 'AlbumsArtists', through: models.AlbumsArtists , foreignKey: 'artist_id', otherKey: 'album_id'});
		}
	},

	instanceMethods: {
		existsByName: function(vArtistname){
			return new Promise((resolve,reject) => {
				Artist.findOne({
					where: {name: vArtistname}
				}).then(u => {
					if(u === null){
						reject({
							status:'error',
							message:'artist not found'
						});
					}else{
						resolve(u);
					}
				});
			})
		},
		existsByLfm: function(vIdLfm){
			return new Promise((resolve,reject) => {
				Artist.findOne({
					where: {id_lfm: vIdLfm}
				}).then(u => {
					if(u === null){
						reject({
							status:'error',
							message:'artist not found'
						});
					}else{
						resolve(u);
					}
				});
			})
		},
		existsByDisc: function(vIdDisc){
			return new Promise((resolve,reject) => {
				Artist.findOne({
					where: {id_disc: vIdDisc}
				}).then(u => {
					if(u === null){
						reject({
							status:'error',
							message:'artist not found'
						});
					}else{
						resolve(u);
					}
				});
			})
		}
	}
  });

  return Artist;
}

