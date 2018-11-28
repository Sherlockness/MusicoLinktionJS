/**
 * Created by Sherlockness on 25-09-2018.
 */
'use strict';
var utilities = require('./../components/utilities');


module.exports = function(sequelize, DataTypes) {
  var Album = sequelize.define('Album',  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    id_lfm: DataTypes.STRING(50),
    id_disc: DataTypes.BIGINT,
    disc_type: DataTypes.CHAR(1),
    title: DataTypes.TEXT,
  }, {
    tableName: 'mclk_albums', // oauth_users
    timestamps: false,
    underscored: true,

    classMethods: {
			associate: function associate(models) {
				Album.belongsToMany(models.Artist, { through: models.AlbumsArtists , foreignKey: 'album_id', otherKey: 'artist_id'});
			},
		},
		instanceMethods: {
			existsByName: function(vArtistname,vAlbumTitle){
				return new Promise((resolve,reject) => {
					Album.findOne({
						where: {title: vAlbumTitle},
						include : [
							{
									model: Artist,
									through: {
										attributes: ['id', 'name'],
										where: {
											name: vArtistname
										}
									}
							}]
					}).then(u => {
						if(u === null){
							reject({
								status:'error',
								message:'album not found'
							});
						}else{
							resolve(u);
						}
					});
				})
			},
			existsByLfm: function(vIdLfm){
				return new Promise((resolve,reject) => {
					Album.findOne({
						where: {id_lfm: vIdLfm}
					}).then(u => {
						if(u === null){
							reject({
								status:'error',
								message:'album not found'
							});
						}else{
							resolve(u);
						}
					});
				})
			},
			existsByDisc: function(vIdDisc){
				return new Promise((resolve,reject) => {
					Album.findOne({
						where: {id_disc: vIdDisc}
					}).then(u => {
						if(u === null){
							reject({
								status:'error',
								message:'album not found'
							});
						}else{
							resolve(u);
						}
					});
				})
			}
		}
  });

  return Album;
}

