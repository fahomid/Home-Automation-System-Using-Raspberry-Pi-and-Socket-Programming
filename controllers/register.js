// Declaration
var express = require('express');
var router = express.Router();

// Request Handler
router.get('/', function(req, res){
    if(req.session.loggedUser) {
        res.redirect("/home");
    } else {
        res.render('register/index');
    }
});

router.post('/', function(req, res){
    res.render("Please enable javascript and try again!");
});


// Export (mandatory)
module.exports = router;