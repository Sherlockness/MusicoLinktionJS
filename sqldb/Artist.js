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
		/*associate: function associate(models) {
			//User.hasMany(models.OAuthClient);
			console.log('User.belongsToMany(models.ServicesProfiles');
			User.belongsToMany(models.ServicesProfiles, { through: models.UsersServicesProfiles , foreignKey: 'user_id', otherKey: 'service_profile'});
			User.hasMany(models.UsersServicesProfiles, { foreignKey: 'user_id', source_key: 'id' });
		},*/
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
			existsByLfm: function(){
				return new Promise((resolve,reject) => {
					Artist.findOne({
						where: {id_lfm: this.id_lfm}
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
			},
		}
  });

  return Artist;
}

