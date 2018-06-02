var db = require('./db');
var bcrypt = require('bcrypt');
module.exports = {
    getAll : function(email, callback){
        var sql = "SELECT * FROM users where email =?";
        var param = [email];
        db.executeQuery(sql, param ,function(result){
            callback(result);
        });
    },
	reVerifyUser: function (tokens, callback) {
        var sql = "SELECT * from users WHERE id in (SELECT fid FROM security_tokens WHERE SHA1(fid) = ? AND password_hash = ? AND expire_time > NOW()) LIMIT 1";
        var param = [tokens.uToken, tokens.token];
        db.executeQuery(sql, param ,function(result){
            if(result == null || result.length == 0) {
            	callback(false);
			} else {
                var user = {
                    id: result[0].id,
                    email: result[0].email,
                    firstName: result[0].first_name,
                    lastName: result[0].last_name,
                    joined: result[0].joined_at,
                    log_in_ip: result[0].ip,
                    userToken: tokens.token
                };
                callback(user);
			}
        });
    },
    getDeviceNames: function (id, callback) {
        var sql = "SELECT groups.device_id as id, devices.device_name FROM device_controls as controls, devices as devices, device_groups as groups WHERE groups.fid = ? GROUP BY groups.device_id";
        var param = [id];
        db.executeQuery(sql, param ,function(result){
            if(result == null || result.length == 0) {
                callback(false);
            } else {
                callback(result);
            }
        });
    },
    getDeviceListSettings: function (id, callback) {
        var sql = "SELECT id, device_name, device_status FROM devices WHERE device_owner = ?";
        var param = [id];
        db.executeQuery(sql, param ,function(result){
            if(result == null || result.length == 0) {
                callback({});
            } else {
                callback(result);
            }
        });
    }
};