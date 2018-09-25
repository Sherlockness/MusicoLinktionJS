/**
 * Created by Ronald Corazza on 12-07-2018.
 */
'use strict';
module.exports = function(sequelize, DataTypes) {
  var UsersServicesProfiles = sequelize.define('UsersServicesProfiles',  {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    user_id: {
		type: DataTypes.INTEGER(11),
		primaryKey: true,
		allowNull: false
	},
    service_profile: {
		type: DataTypes.INTEGER(11),
		primaryKey: true,
		allowNull: false
	}
  }, {
    tableName: 'mclk_users_servicesProfiles', 
    timestamps: false,
    underscored: true,

    classMethods: {
		associate: function associate(models) {
			UsersServicesProfiles.hasMany(models.UsersServicesProfilesData, {foreignKey: 'usersServicesProfiles_id', sourceKey: 'id'});
			UsersServicesProfiles.hasOne(models.ServicesProfiles, {foreignKey: 'id', sourceKey: 'service_profile'});
			/*UsersServicesProfiles.belongsTo(models.User, { foreignKey: "id", sourceKey: 'user_id' });
			UsersServicesProfiles.belongsTo(models.ServicesProfiles, { foreignKey: "id", sourceKey: 'service_profile' });*/
		},
    },
  });
  
  return UsersServicesProfiles;
}

