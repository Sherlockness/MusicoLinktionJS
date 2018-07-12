var express = require('express');
var router = express.Router();
var api = require('./api');
var users = require('./user');
router.use('/users', users);
/* API */
router.use('/api', api);



/* GET home page. */
router.get('/', function(req, res, next) {
	var sess = req.session;
	if(sess.user){
		res.render('index', { title: 'MusicoLinktion' });
	}else{
		res.render('login', { title: 'MusicoLinktion' });
	}
});

module.exports = router;
