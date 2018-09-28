/**
 * Created by Manjesh on 14-05-2016.
 */
'use strict';
var utilities = require('./../components/utilities');


module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User',  {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    username: DataTypes.STRING(32),
    password: DataTypes.STRING(32),
	mail: DataTypes.STRING(200),
    scope: DataTypes.STRING,
	mailValidation: DataTypes.INTEGER,
	mailValidated: DataTypes.BOOLEAN,
	mailValidationHost: DataTypes.STRING(200),
  }, {
    tableName: 'mclk_users', // oauth_users
    timestamps: false,
    underscored: true,

    classMethods: {
		associate: function associate(models) {
			//User.hasMany(models.OAuthClient);
			console.log('User.belongsToMany(models.ServicesProfiles');
			User.belongsToMany(models.ServicesProfiles, { through: models.UsersServicesProfiles , foreignKey: 'user_id', otherKey: 'service_profile'});
			User.hasMany(models.UsersServicesProfiles, { foreignKey: 'user_id', source_key: 'id' });
		},
		exists: function(vUsername){
			return new Promise((resolve,reject) => {
				User.findOne({
					where: {username: vUsername}
				}).then(u => {
					if(u === null){
						reject({
							status:'error',
							message:'user not found'
						});
					}else{
						resolve(u);
					}
				});
			})
		},
		registration: function(userData){
			return new Promise((resolve,reject) => {
				User.exists(userData.username).then(function(result){
					reject({
						status:'error',
						message:'user already exists'
					});
				}).catch(err => {
					User.create(userData).then(u => {
						resolve({
							status:'success',
							message:'user registered',
							user:{
								id: u.id,
								username: u.username
							}
						});
					});
				});
			})
		},
		login: function(userData,models){
			return new Promise((resolve,reject) => {
				User.exists(userData.username).then(function(result){
					var encryptedPassword = result.dataValues.password;
					if(utilities.compareEncryptedString(userData.password,encryptedPassword)){
						User.loadProfiles(result.dataValues,models).then(u => {
							console.log(u);
							resolve({
								status:'success',
								message:'connected',
								user: u
							});
						});
					}else{
						reject({
							status:'error',
							message:'password does not match'
						});
					}
				}).catch(err => {
					reject({
						status:'error',
						message:'user not found'
					});
				});
			})
		},
		getById: function(vId){
			return new Promise((resolve,reject) => {
				User.findOne({
					where: {id: vId}
				}).then(u => {
					if(u === null){
						reject({
							status:'error',
							message:'user not found'
						});
					}else{
						resolve(u);
					}
				});
			})
		},
		getByMail: function(vMail){
			return new Promise((resolve,reject) => {
				User.findOne({
					where: {mail: vMail}
				}).then(u => {
					if(u === null){
						reject({
							status:'error',
							message:'user not found'
						});
					}else{
						resolve(u);
					}
				});
			})
		},
		updateMailValidation: function(vMail,codeValidation,hostValidation){
			return new Promise((resolve,reject) => {
				User.findOne({
					where: {mail: vMail}
				}).then(u => {
					if(u === null){
						reject({
							status:'error',
							message:'user not found'
						});
					}else{
						console.log(codeValidation);
						u.update({
							mailValidation: codeValidation,
							mailValidationHost: hostValidation
						}).then(function(){
							console.log('Update OK');
							resolve({
								status:'success',
								message:'Validation code updated'
							})
						}).catch(function(err){
							console.log('Update ERR : '+err);
							reject({
								status:'error',
								message:'unable to update validation code'
							});
						})
					}
				});
			})
		},
		checkValidationCode: function(vMail,codeValidation,hostValidation){
			return new Promise((resolve,reject) => {
				User.findOne({
					where: {
						mail: vMail,
						mailValidation: codeValidation,
						mailValidationHost: hostValidation
					}
				}).then(u => {
					if(u === null){
						reject({
							status:'error',
							message:'code, mail or host don\'t match'
						});
					}else{
						u.update({
							mailValidated: 1
						}).then(function(){
							resolve({
								status:'success',
								message:'mail validated'
							})
						}).catch(function(){
							reject({
								status:'error',
								message:'unable to update validated'
							});
						})
					}
				});
			})
		},
		loadProfiles: function(_user,models){
			return new Promise((resolve,reject) => {
				User.findAll({
					where: {
						username: _user.username
					},
					include: [
					{
						model: models.ServicesProfiles,
						attributes: ["id","prefix", "name"],
						include:[
							{
								model: models.UsersServicesProfilesData,
								attributes: ["key","value"]
							}
						]
					}]
				}).spread(function(u,created){
					if(u === null){
						reject({
							status:'error',
							message:'user not found'
						});
					}else{
						var plainU = u.get({
							plain: true
						});
						console.log(u.ServicesProfiles.length);
						var tmpSP = [];
						for(var i=0;i<u.ServicesProfiles.length;i++){
							var up = u.ServicesProfiles[i].get({
								plain: true
							});
							tmpSP.push(up);
						}
						
						
						plainU.ServicesProfiles = tmpSP;

						resolve(plainU);
					}
				});
			})
		}
    },
  });

  return User;
}

