var db = require('./db');
var Validation = require('async-validation');

module.exports = {
    doProfileUpdate: function (data, callback) {
        if(data.reNewPassword) {
            var sql = "UPDATE users SET first_name=?, last_name=?, email=?, password=? WHERE email =?";
            var param = [data.firstName, data.lastName, data.newEmail, data.newPassword, data.email];
            db.executeQuery(sql, param, function (result) {
                console.log(result);
                callback(result);
            });
        } else {
            console.log(data);
            var sql = "UPDATE users SET first_name=?, last_name=?, email=? WHERE email =?";
            var param = [data.firstName, data.lastName, data.newEmail, data.email];
            db.executeQuery(sql, param, function (result) {
                console.log(result);
                callback(result);
            });
        }
    },
    checkIfEmailAlreadyExist: function (data, callback) {
        if(data.email === data.newEmail) {
            callback(false);
        } else {
            var sql = "SELECT email FROM users WHERE email=?";
            var param = [data.newEmail];
            db.executeQuery(sql, param ,function(result) {
                if(result == null || result.length == 0) {
                    callback(false);
                } else {
                    callback("Email address is being used by another user!");
                }
            });
        }
    }
};