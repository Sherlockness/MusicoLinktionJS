/**
 * Created by Ronald Corazza on 12-07-2018.
 */
'use strict';
var utilities = require('./../components/utilities');

module.exports = function(sequelize, DataTypes) {
  var UsersServicesProfilesData = sequelize.define('UsersServicesProfilesData',  {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    usersServicesProfiles_id: DataTypes.INTEGER(11),
    key: DataTypes.STRING(100),
	value: DataTypes.STRING(500),
	
  }, {
    tableName: 'mclk_usersServicesProfiles_data', 
    timestamps: false,
    underscored: true,

    classMethods: {
		associate: function associate(models) {
			//User.hasMany(models.OAuthClient);
			UsersServicesProfilesData.hasOne(models.UsersServicesProfiles, {sourceKey: 'usersServicesProfiles_id', foreignKey: 'id'});
		},
		
		getByUserAndServiceProfile: function(_usersServicesProfilesId){
			return new Promise((resolve,reject) => {
				UsersServicesProfilesData.findAll({
					where: {
						usersServicesProfiles_id: _usersServicesProfilesId,
					},
				}).then(function(pd){
					console.log(pd);
					resolve(pd);
				});
			})
		}
    },
  });
  
  return UsersServicesProfilesData;
}

