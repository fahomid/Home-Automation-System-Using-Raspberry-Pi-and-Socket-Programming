// Declaration
var express = require("express");
var router = express.Router();
var userModel = require.main.require("./models/user-model");
var socketAPI = require.main.require("./controllers/socketAPI");

// Request Handler
router.get('/', function(req, res) {
	if(req.session.loggedUser) {
	    userModel.getDeviceNames(req.session.loggedUser.id, function (response) {
	        if(response) {
                res.render('home/index', {firstName: req.session.loggedUser.firstName, lastName: req.session.loggedUser.lastName, joinedAt: req.session.loggedUser.joined, id: req.session.loggedUser.id, email: req.session.loggedUser.email, devices: response});
            } else {
                res.render('home/index', {firstName: req.session.loggedUser.firstName, lastName: req.session.loggedUser.lastName, joinedAt: req.session.loggedUser.joined, id: req.session.loggedUser.id, email: req.session.loggedUser.email, devices: null});
            }
        });
    } else if(req.cookies.token && req.cookies.uToken) {
		var token = {
			token: req.cookies.token,
			uToken: req.cookies.uToken
		};
		userModel.reVerifyUser(token, function (response) {
            if(response) {
		        req.session.loggedUser = response;
                userModel.getDeviceNames(req.session.loggedUser.id, function (rrData) {
                    if(rrData) {
                        res.render('home/index', {firstName: response.firstName, lastName: response.lastName, joinedAt: response.joined, id: response.id, email: response.email, devices: rrData});
                    } else {
                        res.render('home/index', {firstName: response.firstName, lastName: response.lastName, joinedAt: response.joined, id: response.id, email: response.email, devices: null});
                    }
                });
            } else {
		    	res.clearCookie("token");
		    	res.clearCookie("uToken");
                res.redirect("/login");
            }
        });
	} else {
		res.redirect("/login");
	}
});

router.get('/info/:id', function(req, res){
	var data = {
		id: req.params.id
	};
	res.render('home/info', data);
});

// Export (mandatory)
module.exports = router;