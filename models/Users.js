/**
 * Created by Manjesh on 14-05-2016.
 */
'use strict';

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
	mail: DataTypes.STRING(100),
    scope: DataTypes.STRING
  }, 
  {
    tableName: 'mclk_users', // oauth_users
    timestamps: false,
    underscored: true,

    classMethods: {
	  associate: function associate(models) {
		//User.hasMany(models.OAuthClient);
	  },
	  /*exists: function(vMail,callback){
		  this.findOne({
			  where: {mail: vMail}
		  },function(err,u){
			  if(err){
				  return callback(err,false);
			  }
			  if(u === null){
				  return callback(null,false);
			  }else{
				  return callback(null,true);
			  }
		  })
	  },*/
    },
  });

  User.prototype.exists = function(vMail,callback){
	  this.findOne({
		  where: {mail: vMail}
	  },function(err,u){
		  if(err){
			  return callback(err,false);
		  }
		  if(u === null){
			  return callback(null,false);
		  }else{
			  return callback(null,true);
		  }
	  })
  };
  return User;
}

