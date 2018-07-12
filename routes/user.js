var express = require('express');
var router = express.Router();
var sqldb = require('./../sqldb');
var User = sqldb.User;
var utilities = require('./../components/utilities');
var nodemailer = require('nodemailer');
var configMail = require('./../config.js').mail;

var smtpTransport = nodemailer.createTransport({
    host: configMail.host, //mail.example.com (your server smtp)
	port: configMail.port, //2525 (specific port)
	secureConnection: configMail.secureConnection, //true or false
	auth: {
		user: configMail.auth.user, //user@mydomain.com
		pass: configMail.auth.pwd //password from specific user mail
	}
});


router.post('/login', function(req, res, next) {
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

router.post('/logout', function(req, res, next) {
	req.session.destroy();
	res.json({
		status: 'success',
		message: 'logout complete'
	});
});

router.get('/send', function(req, res) {
	if(req.query.to){
		var rand=Math.floor((Math.random() * 100) + 54);
		var host=req.get('host');
		User.updateMailValidation(req.query.to,rand,host);
		var link="http://"+req.get('host')+"/users/verify?id="+rand+"&to="+req.query.to;
		mailOptions={
			to : req.query.to,
			subject : "Please confirm your Email account",
			html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
		}

		smtpTransport.sendMail(mailOptions, function(error, response){
			if(error){
				console.log(error);
				res.end("error");
			}else{
				console.log("Message sent: " + response.message);
				res.end("sent");
			}
		});
	}
});


router.get('/verify',function(req,res){
	if(req.query.id && req.query.to){
		User.checkValidationCode(req.query.to,req.query.id,req.get('host')).then(function(){
			console.log("email is verified");
			res.end("<h1>Email "+req.query.to+" is been Successfully verified");
		}).catch(function(){
			console.log("email is not verified");
			res.end("<h1>Bad Request</h1>");
		});
	}
});

module.exports = router;
