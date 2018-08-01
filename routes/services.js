var express = require('express');
var router = express.Router();
var sqldb = require('./../sqldb');
var User = sqldb.User;
var ServicesProfiles = sqldb.ServicesProfiles;
var USP = sqldb.UsersServicesProfiles;
var USPD = sqldb.UsersServicesProfilesData;
var utilities = require('./../components/utilities');
var LastfmAPI = require('lastfmapi');

router.get('/manage', function(req, res, next) {
	var sess = req.session;
	if(sess.user){
		//console.log(sess.user.toJSON());
		console.log(sess.user);
		ServicesProfiles.findAll().then(servicesProfiles => {
			console.log(servicesProfiles);
			res.render('services/manage', { 
				title: 'MusicoLinktion',
				servicesProfilesAvailable:servicesProfiles
			});
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
		console.log('-------------------manage lfm--------------------------');
		console.log(sess.user);
		if(sess.user.ServicesProfiles.length == 0){
			res.render('services/manage_lfm', { 
				title: 'MusicoLinktion',
				hasProfile: hasProfile,
				serviceURL: 'http://www.last.fm/api/auth/?cb=http://dev.rcnetwork.be:8080/services/register_lfm',
				serviceData: {api_key: '5b597ed85e0390ade25184e7bebc8f20'}
			});
		}
		
		for(var i = 0; i < sess.user.ServicesProfiles.length; i++)
		{
		  if(sess.user.ServicesProfiles[i].prefix == 'lfm')
		  {
			hasProfile = true;
			USPD.getByUserAndServiceProfile(sess.user.ServicesProfiles[i].id).then(pd => {
				res.render('services/manage_lfm', { 
					title: 'MusicoLinktion',
					hasProfile: hasProfile,
					serviceURL: 'http://www.last.fm/api/auth/?cb=http://dev.rcnetwork.be:8080/services/register_lfm',
					serviceData: {api_key: '5b597ed85e0390ade25184e7bebc8f20'}
				});
			}).catch(err => {
				res.render('services/manage_lfm', { 
					title: 'MusicoLinktion',
					hasProfile: hasProfile,
					serviceURL: 'http://www.last.fm/api/auth/?cb=http://dev.rcnetwork.be:8080/services/register_lfm',
					serviceData: {api_key: '5b597ed85e0390ade25184e7bebc8f20'}
				});
			});
		  }
		}
		
		/*res.render('services/manage_lfm', { 
			title: 'MusicoLinktion',
			hasProfile: hasProfile,
		});*/
	}else{
		res.render('login', { title: 'MusicoLinktion' });
	}
});

router.get('/register_lfm', function(req, res, next) {
	var sess = req.session;
	if(sess.user){
		if(req.query.token){
			
			var lfm = new LastfmAPI({
				'api_key' : '5b597ed85e0390ade25184e7bebc8f20',
				'secret' : '1306d89f0f4e09bc18a660da7322cb36'
			});
			
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
							res.redirect('manage_lfm');
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