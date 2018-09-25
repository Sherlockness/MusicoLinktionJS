var config = require('../config');
var express = require('express');
var router = express.Router();
var sqldb = require('./../sqldb');
var User = sqldb.User;
var ServicesProfiles = sqldb.ServicesProfiles;
var USP = sqldb.UsersServicesProfiles;
var USPD = sqldb.UsersServicesProfilesData;
var utilities = require('./../components/utilities');
var LastfmAPI = require('lastfmapi');
const querystring = require('querystring');
var lfm = new LastfmAPI({
	'api_key' : '5b597ed85e0390ade25184e7bebc8f20',
	'secret' : '1306d89f0f4e09bc18a660da7322cb36'
});

router.get('/manage', function(req, res, next) {
	var sess = req.session;
	if(sess.user){
		ServicesProfiles.findAll().then(servicesProfiles => {
			if(req.query.service != null){
				res.render('services/manage', { 
					title: 'MusicoLinktion',
					servicesProfilesAvailable:servicesProfiles,
					serviceToLoad : req.query.service
				});
			}else{
				res.render('services/manage', { 
					title: 'MusicoLinktion',
					servicesProfilesAvailable:servicesProfiles
				});
			}
		});
	}else{
		res.render('login', { title: 'MusicoLinktion' });
	}
});

router.get('/manage_lfm', function(req, res, next) {
	var sess = req.session;
	if(sess.user){
		var hasProfile = false;
		var profileData = null;
		console.log(sess.user.ServicesProfiles);
		if(sess.user.ServicesProfiles.length == 0){
			res.render('services/manage_lfm', { 
				title: 'MusicoLinktion',
				hasProfile: hasProfile,
				serviceURL: config.lfm.auth_url+'cb='+config.lfm.callback_url,
				serviceData: {api_key: config.lfm.key}
			});
		}
		
		for(var i = 0; i < sess.user.ServicesProfiles.length; i++)
		{
		  if(sess.user.ServicesProfiles[i].prefix == 'lfm')
		  {
			hasProfile = true;
			console.log(sess.user.ServicesProfiles[i].UsersServicesProfiles.id);
			USPD.getByUserAndServiceProfile(sess.user.ServicesProfiles[i].UsersServicesProfiles.id).then(pd => {
				
				lfm.setSessionCredentials(pd.username, pd.session_key);
				lfm.user.getInfo(function(err, info){
					res.render('services/manage_lfm', { 
						title: 'MusicoLinktion',
						hasProfile: hasProfile,
						serviceURL: config.lfm.auth_url+'cb='+config.lfm.callback_url,
						serviceData: {api_key: config.lfm.key},
						serviceProfileData: info,
						userAvatar: info.image[1]["#text"]
					});
				})
				
				
			}).catch(err => {
				res.render('services/manage_lfm', { 
					title: 'MusicoLinktion',
					hasProfile: hasProfile,
					serviceURL: config.lfm.auth_url+'cb='+config.lfm.callback_url,
					serviceData: {api_key: config.lfm.key}
				});
			});
		  }
		}
	}else{
		res.render('login', { title: 'MusicoLinktion' });
	}
});

router.get('/register_lfm', function(req, res, next) {
	var sess = req.session;
	if(sess.user){
		if(req.query.token){
			
			
			
			lfm.authenticate(req.query.token, function (err, lfm_session) {
				if (err) { throw err; }
				ServicesProfiles.findOne({
					where: {
						prefix: 'lfm',
					},
				}).then(servicesProfiles => {
					USP.create({
						'user_id' : sess.user.id,
						'service_profile' : servicesProfiles.id
					}).then(usp => {
						USPD.bulkCreate([{
							'usersServicesProfiles_id' : usp.id,
							'key' : 'username',
							'value' : lfm_session.username
						},
						{
							'usersServicesProfiles_id' : usp.id,
							'key' : 'session_key',
							'value' : lfm_session.key
						}]).then(() => {
							sess.user.ServicesProfiles.push(servicesProfiles.dataValues);
							req.session.user.ServicesProfiles.push(servicesProfiles.dataValues);
							
							const query = querystring.stringify({
								"service": 'lfm'
							});
							res.redirect('manage?' + query);
						});
					});
				});
			});
		}
	}else{
		res.render('login', { title: 'MusicoLinktion' });
	}
});

module.exports = router;