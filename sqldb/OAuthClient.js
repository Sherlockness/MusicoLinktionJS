/**
 * Created by Manjesh on 14-05-2016.
 */
'use strict';
var dateTime = require('node-datetime');
var utilities = require('./../components/utilities');

module.exports = function AppModel(sequelize, DataTypes) {
  const OAuthClient = sequelize.define('OAuthClient', {
    id: {
      type: DataTypes.INTEGER(14),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING(255),
    client_id: DataTypes.STRING(80),
    client_secret: DataTypes.STRING(80),
    redirect_uri: DataTypes.STRING(2000),
    grant_types: DataTypes.STRING(80),
    scope: DataTypes.STRING
  }, {
    tableName: 'oauth_clients',
    timestamps: false,
    underscored: true,

    classMethods: {
		associate: function associate(models) {
			OAuthClient.belongsTo(models.User, {
				foreignKey: 'user_id',
			});
		},
		createCredentials: function(vUserRequest){ console.log(vUserRequest);
			return new Promise((resolve,reject) => {
				var dt = dateTime.create();
				var formatted = dt.format('Y-m-d H:M:S');
				var clientId = utilities.encryptString(formatted,10);
				var clientSecret = utilities.encryptString(vUserRequest.userId.toString(),10);
				var clientData = {
					client_id: clientId,
					client_secret: clientSecret,
					redirect_uri: vUserRequest.redirectUri,
					grant_types: 'refresh_token',
					scope: 'profile',
					user_id: vUserRequest.userId
				}
				OAuthClient.create(clientData).then(u => {
					resolve({
						status: 'success',
						message: 'api client registered'
					});
				}).catch(err => {
					reject({
						status:'error',
						message:'unable to create credentials'
					});
				});
			})
		}
    },
  });

  return OAuthClient;
};
