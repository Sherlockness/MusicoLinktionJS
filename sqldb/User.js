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
		login: function(userData){
			return new Promise((resolve,reject) => {
				User.exists(userData.username).then(function(result){
					var encryptedPassword = result.dataValues.password;
					console.log(encryptedPassword);
					if(utilities.compareEncryptedString(userData.password,encryptedPassword)){
						resolve({
							status:'success',
							message:'connected',
							user:{
								id:result.dataValues.id,
								username:result.dataValues.username,
								mail:result.dataValues.mail
							}
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
    },
  });

  return User;
}

