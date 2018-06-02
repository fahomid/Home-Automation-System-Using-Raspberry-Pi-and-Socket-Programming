var db = require('./db');
var bcrypt = require("bcrypt");

var registerUser = function(user, callback) {
    checkAndInsertIntoDb(user, function (existsInDb) {
        var response = {};
        if(existsInDb) {
            response.response = "failed";
            response.message = "Email address already exists in our database!";
            callback(response);
        } else {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(user.password, salt);
            var sql = "INSERT into users (email, password, first_name, last_name) values(?, ?, ?, ?)";
            var param = [user.email, hash, user.firstName, user.lastName];
            db.executeQuery(sql, param ,function(result) {
                if(result == null || result.length == 0) {
                    response.response = "failed";
                    response.message = "Unknown error occurred! Please try again later!";
                    callback(response);
                } else {
                    response.response = "success";
                    response.message = "You have been registered successfully!";
                    callback(response);
                }
            });
        }
    });
};

var checkAndInsertIntoDb = function(user, callback) {
    var sql = "SELECT * FROM users WHERE email=?";
    var param = [user.email];
    db.executeQuery(sql, param ,function(result) {
        if(result == null || result.length == 0) {
            callback(false);
        } else {
            callback(true);
        }
    });
};

module.exports.registerUser= registerUser;