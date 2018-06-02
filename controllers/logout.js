// Declaration
var express = require('express');
var router = express.Router();

// Request Handler
router.get('/', function(req, res){
	req.session.destroy();
	res.clearCookie("token");
	res.clearCookie("uToken");
	res.redirect('/login?msg=Logged out successfully!');
});

// Export (mandatory)
module.exports = router;