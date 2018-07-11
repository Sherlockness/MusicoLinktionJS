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
    scope: DataTypes.STRING
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
		}
    },
  });

  return User;
}

