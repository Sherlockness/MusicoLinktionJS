/**
 * Created by Ronald Corazza.
 */

/** https://github.com/dsquier/oauth2-server-php-mysql **/
var config = require('../config')
var Sequelize = require('sequelize');

var db = {
  sequelize: new Sequelize(
    config.sql.database,
    config.sql.username,
    config.sql.password,
    config.sql
  )
};

db.OAuthAccessToken = db.sequelize.import('./OAuthAccessToken');
db.OAuthAuthorizationCode = db.sequelize.import('./OAuthAuthorizationCode');
db.OAuthClient = db.sequelize.import('./OAuthClient');
db.OAuthRefreshToken = db.sequelize.import('./OAuthRefreshToken');
db.OAuthScope = db.sequelize.import('./OAuthScope');

db.User = db.sequelize.import('./User');
db.ServicesProfiles = db.sequelize.import('./ServicesProfiles');
db.UsersServicesProfiles = db.sequelize.import('./UsersServicesProfiles');
db.UsersServicesProfilesData = db.sequelize.import('./UsersServicesProfilesData');

/* Associations */
/* Services Profiles and Users */
//db.UsersServicesProfilesData.hasOne(db.UsersServicesProfiles, {foreignKey: 'usersServicesProfiles_id'});
//db.UsersServicesProfiles.hasMany(db.UsersServicesProfilesData, {foreignKey: 'usersServicesProfiles_id', sourceKey: 'id'});

/*db.aUsersServicesProfiles = db.User.belongsToMany(db.ServicesProfiles, { through: db.UsersServicesProfiles , foreignKey: 'user_id', sourceKey: 'id'});
db.ServicesProfiles.belongsToMany(db.User, { through: db.UsersServicesProfiles , foreignKey: 'service_profile', sourceKey: 'id'});*/

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
	  console.log('ok');
    db[modelName].associate(db);
  }
});

module.exports = db;