var express = require('express');
var router = express.Router();
var users = require('./users');

/*module.exports = function(app){
	app.use('/users', users);
}*/
router.use('/users', users);

module.exports = router;
