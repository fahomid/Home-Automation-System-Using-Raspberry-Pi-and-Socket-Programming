var db = require('./db');
var Validation = require('async-validation');
Validation.addValidator('checkEmailInDb', function (callback, value, rule) {
    var sql = "SELECT * FROM users WHERE email=?";
    var param = [value];
    db.executeQuery(sql, param ,function(result) {
        if(result == null || result.length == 0) {
            callback("Email not found in our database!");
        } else {
            callback(null);
        }
    });
});