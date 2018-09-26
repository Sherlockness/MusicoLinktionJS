var config = require('../config');
var express = require('express');
var router = express.Router();
var sqldb = require('./../sqldb');
var User = sqldb.User;
var ServicesProfiles = sqldb.ServicesProfiles;
var USP = sqldb.UsersServicesProfiles;
var USPD = sqldb.UsersServicesProfilesData;
var Artist = sqldb.Artist;
var utilities = require('./../components/utilities');
var LastfmAPI = require('lastfmapi');
var Discogs = require('disconnect').Client;
var DiscogsRequestData;
const querystring = require('querystring');
var lfm = new LastfmAPI({
	'api_key' : config.lfm.key,
	'secret' : config.lfm.secret
});
var async = require("async");

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

router.get('/manage_disc', function(req, res, next) {
	var sess = req.session;
	if(sess.user){
		var hasProfile = false;
		var profileData = null;
		if(sess.user.ServicesProfiles.length == 0){
			authDiscogs(function(err,requestData){
				res.render('services/manage_disc', { 
					title: 'MusicoLinktion',
					hasProfile: hasProfile,
					serviceURL: config.disc.auth_url+'oauth_token='+requestData.token,
					serviceData: {}
				});
			})
		}
		
		for(var i = 0; i < sess.user.ServicesProfiles.length; i++)
		{
			if(sess.user.ServicesProfiles[i].prefix == 'disc')
			{
				hasProfile = true;
				USPD.getByUserAndServiceProfile(sess.user.ServicesProfiles[i].UsersServicesProfiles.id).then(pd => {
					var discogsUser = new Discogs().user();
					discogsUser.getProfile(pd.username,
						function(err, userData){
							res.render('services/manage_disc', { 
								title: 'MusicoLinktion',
								hasProfile: hasProfile,
								serviceProfileData: userData,
								userAvatar: userData.avatar_url
							});
						}
					);
				}).catch(err => {
					authDiscogs(function(err,requestData){
						res.render('services/manage_disc', { 
							title: 'MusicoLinktion',
							hasProfile: hasProfile,
							serviceURL: config.disc.auth_url+'oauth_token='+requestData.token,
							serviceData: {}
						});
					})
				});
		  	}
		}
		if(!hasProfile){
			authDiscogs(function(err,requestData){
				res.render('services/manage_disc', { 
					title: 'MusicoLinktion',
					hasProfile: hasProfile,
					serviceURL: config.disc.auth_url+'oauth_token='+requestData.token,
					serviceData: {}
				});
			})
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


router.get('/register_disc', function(req, res, next) {
	var sess = req.session;
	if(sess.user){
		var oAuth = new Discogs(DiscogsRequestData).oauth();
		oAuth.getAccessToken(
			req.query.oauth_verifier, // Verification code sent back by Discogs
			function(err, accessData){
				// Persist "accessData" here for following OAuth calls 
				ServicesProfiles.findOne({
					where: {
						prefix: 'disc',
					},
				}).then(servicesProfiles => {
					USP.create({
						'user_id' : sess.user.id,
						'service_profile' : servicesProfiles.id
					}).then(usp => {
						var dis = new Discogs(accessData);
						dis.getIdentity(function(err, identityData){
							USPD.bulkCreate([{
								'usersServicesProfiles_id' : usp.id,
								'key' : 'token',
								'value' : accessData.token
							},
							{
								'usersServicesProfiles_id' : usp.id,
								'key' : 'token_secret',
								'value' : accessData.tokenSecret
							},
							{
								'usersServicesProfiles_id' : usp.id,
								'key' : 'username',
								'value' : identityData.username
							}
							]).then(() => {
								sess.user.ServicesProfiles.push(servicesProfiles.dataValues);
								req.session.user.ServicesProfiles.push(servicesProfiles.dataValues);
								
								const query = querystring.stringify({
									"service": 'disc'
								});
								res.redirect('manage?' + query);
							});
						});
						
					});
				});
			}
		);
	}else{
		res.render('login', { title: 'MusicoLinktion' });
	}
});

router.get('/scan_lfm', function(req, res, next) {
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
			console.log(i+" - "+sess.user.ServicesProfiles[i].prefix);
			hasProfile = true;
			USPD.getByUserAndServiceProfile(sess.user.ServicesProfiles[i].UsersServicesProfiles.id).then(pd => {
				console.log(" getByUserAndServiceProfile ");
				lfm.setSessionCredentials(pd.username, pd.session_key);
				var params = {
					'user' : pd.username,
				}
				lfm.library.getArtists(params, function(err,artists){
					buildLFMLibrary(artists,pd).then(r => {
						console.log(r);
					});
				});
			}).catch(err => {
				console.log('alaaarm !');
				console.log(err);
			});
		  }
		}
	}else{
		res.render('login', { title: 'MusicoLinktion' });
	}
});

function buildLFMLibrary(artists,profileData){
	return new Promise((resolve,reject) => {
		var library= "OK";
		console.log(artists['@attr']);
		var artistPage = artists['@attr'].page;
		var artistTotalPage = artists['@attr'].totalPages;
		var artistTotalCount = artists['@attr'].total;
		var tabArtists = artists.artist;
		if(parseInt(artistPage,10) <= parseInt(artistTotalPage,10)){
			async.eachSeries(tabArtists,function(a,endArtists){
				console.log('PROCESSING : '+a.name+' | page : '+artistPage);
				var params = {
					'user' : profileData.username,
					'artist':a.name
				}
				lfm.user.getArtistTracks(params, function(err, artistTracks){
					buildLFMArtistLibrary(a,artistTracks,profileData).then(r => {
						console.log(r);
						endArtists();
					})
				});
			},function(err){
				console.log("endArtists page - "+artistPage);
				if(err != null){
					console.log(err);
				}else{
					var params = {
						'user' : profileData.username,
						'page' : parseInt(artistPage,10)+parseInt(1,10)
					}
					lfm.library.getArtists(params, function(err,artists){
						buildLFMLibrary(artists,profileData).then(r => {
							console.log(r);
						});
					});
				}
				resolve(library+" "+artistPage);
			});
		}else{
			resolve("end of treatement");
		}
		
	});
}

function buildLFMArtistLibrary(a,artistTracks,profileData){
	return new Promise((resolve,reject) => {
		var tracksPage = artistTracks['@attr'].page;
		var tracksTotalPage = artistTracks['@attr'].totalPages;
		var tracksTotalCount = artistTracks['@attr'].total;
		if(tracksPage <= tracksTotalPage || tracksTotalPage==0){
			async.eachSeries(artistTracks.track,function(t,endTrack){
				console.log(t.name);
				endTrack();
			},function(err){
				if(err != null){
					resolve(r);
				}else{
					if(tracksTotalPage != 0){
						var params = {
							'user' : profileData.username,
							'artist':a.name,
							'page':parseInt(tracksPage,10)+parseInt(1,10)
						}
						lfm.user.getArtistTracks(params, function(err, artistTracks){
							buildLFMArtistLibrary(artistTracks,profileData).then(r => {
								console.log(r);
							})
						});
					}
				}
				console.log("end tracks of artist");
				resolve("OK Tracks - "+tracksPage);
			});
		}else{
			resolve("end of tracks treatement - "+tracksPage+"/"+tracksTotalPage);
		}
	});
}

function authDiscogs(callback){
	var oAuth = new Discogs().oauth();
	oAuth.getRequestToken(
		config.disc.key, 
		config.disc.secret, 
		'http://dev.rcnetwork.be:8080/services/register_disc', 
		function(err, requestData){
			console.log(requestData);
			DiscogsRequestData = requestData;
			// Persist "requestData" here so that the callback handler can 
			// access it later after returning from the authorize url
			callback(err,requestData);
		}
	);
}
module.exports = router;