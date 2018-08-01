/**
 * Created by Ronald Corazza on 12-07-2018.
 */
'use strict';
var utilities = require('./../components/utilities');
var User = require('./User');

module.exports = function(sequelize, DataTypes) {
  var ServicesProfiles = sequelize.define('ServicesProfiles',  {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    prefix: DataTypes.STRING(5),
    name: DataTypes.STRING(100),
	description: DataTypes.STRING(500),
  }, {
    tableName: 'mclk_services_profiles', // oauth_users
    timestamps: false,
    underscored: true,

    classMethods: {
		associate: function associate(models) {
			console.log('ServicesProfiles.belongsToMany(models.User');
			ServicesProfiles.belongsToMany(models.User, { through: models.UsersServicesProfiles , foreignKey: 'service_profile', otherKey: 'user_id'});
		},
    },
  });

  
  return ServicesProfiles;
}

