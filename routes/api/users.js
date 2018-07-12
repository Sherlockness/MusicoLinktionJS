var express = require('express');
var router = express.Router();
var sqldb = require('./../../sqldb');
var User = sqldb.User;
var OAuthClient = sqldb.OAuthClient;
var authenticate = require('./../../components/oauth/authenticate');
var utilities = require('./../../components/utilities');
const { check, validationResult } = require('express-validator/check');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', authenticate(),[check('mail').isEmail()],function(req, res, next) {
	var error = '';
	const errors = validationResult(req);
	  if (!errors.isEmpty()) {
		var tabErrors = errors.array();
		tabErrors.forEach(function(err){
			switch(err['param']){
				case 'mail':
					error = 'invalid mail';
				break;
			}
		});
	}
	if(error == ''){
		if (req.body.mail && req.body.username && req.body.password) {
			var userData = {
				mail: req.body.mail,
				username: req.body.username,
				password: req.body.password,
				passwordConfirmation : req.body.passwordConfirmation,
			}
			
			if(userData.passwordConfirmation == userData.password){
				userData.password = utilities.encryptString(userData.password,10);
				User.registration(userData).then(function(result){
					var clientInfo = {
						userId:result.user.id,
						redirectUri: 'http://localhost'
					}
					OAuthClient.createCredentials(clientInfo).then(function(){
						res.json(result);
					}).catch(err => {
						error = 'unable to create client credentials'
					});
					//res.json(result);
				}).catch(err => {
					res.json(err);
				});
			}else{
				error = 'passwords do not correspond';
			}
		}else{
			error = 'missing informations';
		}
	}
	if(error != ''){
		res.json({'error':error});
	}
});

router.post('/login', authenticate(),function(req, res, next) {
	if (req.body.username && req.body.password) {
		
		var userData = {
			username: req.body.username,
			password: req.body.password,
		}
		User.login(userData).then(function(result){
			res.json(result);
		}).catch(err => {
			res.json(err);
		});
	}else{
		error = 'missing informations';
	}
});

router.post('/webLogin', function(req, res, next) {
	if (req.body.username && req.body.password) {
		
		var userData = {
			username: req.body.username,
			password: req.body.password,
		}
		User.login(userData).then(function(result){
			req.session.user = result.user;
			res.json(result);
		}).catch(err => {
			res.json(err);
		});
	}else{
		error = 'missing informations';
	}
});

router.post('/webLogout', function(req, res, next) {
	req.session.destroy();
	res.json({
		status: 'success',
		message: 'logout complete'
	});
});

router.get('sendValidationMail', function(req, res, next) {
	var rand=Math.floor((Math.random() * 100) + 54);
    var host=req.get('host');
    var link="http://"+req.get('host')+"/verify?id="+rand;
    mailOptions={
        to : req.query.to,
        subject : "Please confirm your Email account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(error);
			res.end("error");
		}else{
			console.log("Message sent: " + response.message);
			res.end("sent");
		}
	});
});

module.exports = router;
