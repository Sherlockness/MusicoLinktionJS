var express = require('express');
var router = express.Router();
var sqldb = require('./../../sqldb');
var User = sqldb.User;
var OAuthClient = sqldb.OAuthClient;
var authenticate = require('./../../components/oauth/authenticate');
var utilities = require('./../../components/utilities');
const { check, validationResult } = require('express-validator/check');
var LastfmAPI = require('lastfmapi');
var Discogs = require('disconnect').Client;
var JobUtilities = require('./../../utilities/jobs.js')

router.get('/scan_library', authenticate(),function(req, res, next) {
    var error = '';
    var userId = req.user.User.id;
    var args = [userId,'getFullLibrary'];
    // Now we can run a script and invoke a callback when complete, e.g.
    JobUtilities.runScript('jobs/lastfm.js',args, function (err) {
        if (err) throw err;
        console.log('finished running some-script.js');
    });
    res.send('script launched');
});

module.exports = router;
