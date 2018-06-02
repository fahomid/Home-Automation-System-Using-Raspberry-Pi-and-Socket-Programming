var db = require('./db');
var bcrypt = require('bcrypt');

module.exports = {
    getUserDetails: function (user, callback) {
        var sql = "SELECT id, email, password, first_name, last_name, joined_at FROM users WHERE email=?";
        var param = [user.email, user.password];
        db.executeQuery(sql, param, function (result) {
            if (result == null || result.length == 0) {
                callback(false);
            } else {
                user.id = result[0].id;
                callback(result);
            }
        });
    },
    validateUser: function (user, callback) {
        this.getUserDetails(user, function (result) {
            if(result == null || result.length == 0 || !result) {
                callback(false);
            } else {
                bcrypt.compare(user.password, result[0].password, function (err, res) {
                    if (res) {
                        callback(result[0]);
                    } else {
                        callback(false);
                    }
                });
            }
        });
    },
    recordNewLogin: function (user, callback) {
        var meta_info = {
            IP: user.log_in_ip
        }
        var sql = "INSERT into security_tokens (fid, password_hash, meta_information, expire_time) values(?, ?, ?, NOW() + INTERVAL 90 DAY)";
        var param = [user.id, user.userToken, JSON.stringify(meta_info)];
        db.executeQuery(sql, param ,function(result) {
            if(result == null || result.length == 0) {
                callback(false);
            } else {
                callback(true);
            }
        });
    }
};

