var db = require('./db');
var bcrypt = require('bcrypt');

module.exports = {
    authenticateDevice: function (user, callback) {
        var sql = "SELECT id FROM devices WHERE id=? AND password=? Limit 1";
        var param = [user.device_id, user.password];
        db.executeQuery(sql, param, function (result) {
            if (result == null || result.length == 0) {
                callback(false);
            } else {
                callback(result[0].id.toString());
            }
        });
    },
    updateDeviceStatus: function (status, callback) {
        var sql = "UPDATE devices SET device_status = ? WHERE id= ? Limit 1";
        var param = [status.status, status.id];
        db.executeQuery(sql, param, function (result) {
            if (result == null || result.length == 0) {
                callback(false);
            }
        });

        var device_controls_data = [];
        for(i=0; i < status.controls.length; i++) {
            var dt = [status.id, status.controls[i].io, status.controls[i].name, status.controls[i].status];
            device_controls_data.push(dt);
        }

        device_controls_data = {
            'controls': device_controls_data,
            'device_id': status.id
        };

        this.updateControlSwitches(device_controls_data, function (response_data) {
            if(response_data == true) {
                callback(true);
            } else {
                callback(false);
            }
        });
    },
    updateControlSwitches: function(data, callback) {
        var sql = "INSERT INTO device_controls (device_id, device_io_port, name, status) VALUES ? ON DUPLICATE KEY UPDATE name=VALUES(name), status=VALUES(status)";
        var param = [data.controls];
        db.executeQuery(sql, param, function (result) {
            if (result == null || result.length == 0) {
                callback(false);
            } else {
                callback(true);
                var sql_query = "INSERT IGNORE INTO device_groups (fid, device_id, control_id) SELECT t2.device_owner as fid, t1.device_id as device_id, t1.id as control_id FROM device_controls t1, devices t2 where t1.device_id=? and t2.id=?";
                var param = [data.device_id, data.device_id];
                db.executeQuery(sql_query, param, function () {
                    console.log("Owner meta updated!");
                });
            }
        });
    },
    updateDeviceOnlineStatus: function (data, callback) {
        var sql = "UPDATE devices SET device_status = ? WHERE id= ? Limit 1";
        var param = [data.status, data.id];
        db.executeQuery(sql, param, function (result) {
            if (result == null || result.length == 0) {
                callback(false);
            } else {
                callback(true);
            }
        });
    }
};

