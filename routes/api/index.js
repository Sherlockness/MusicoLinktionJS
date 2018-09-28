var express = require('express');
var router = express.Router();
var users = require('./users');
var services_lfm = require('./services_lfm');

/*module.exports = function(app){
	app.use('/users', users);
}*/
router.use('/users', users);
router.use('/services_lfm', services_lfm);

module.exports = router;
