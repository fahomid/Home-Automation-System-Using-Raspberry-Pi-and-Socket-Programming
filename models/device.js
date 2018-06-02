var db = require('./db');
var groupArray = require('group-array');
var schedule = require('node-schedule');
var socketAPI = require.main.require("./controllers/socketAPI");
module.exports = {
    getDeviceDetails: function (id, callback) {
        var sql = "SELECT t1.device_id, t1.device_io_port, t1.name, t1.status, t2.group_name from device_controls as t1, device_groups as t2 WHERE t2.control_id = t1.id and t2.fid = ?";
        var param = [id];
        db.executeQuery(sql, param ,function(result) {
            if(result == null || result.length == 0) {
                callback(false);
            } else {
                var data = {};
                var controls_data = [];
                for(i=0; i < result.length; i++) {
                    if(i == 0) {
                        data.device_status = result[i].device_status;
                    }
                    controls_data.push({ name: result[i].name, group: result[i].group_name, io: result[i].device_io_port, status: result[i].status, });
                }
                data.device_controls = groupArray(controls_data, 'group');
                callback(data);
            }
        });
    },
    getControlGroups: function (id, device_id, callback) {
        var sql = "SELECT group_name FROM device_groups WHERE fid = ? AND device_id = ? GROUP BY group_name, device_id";
        var param = [id, device_id];
        db.executeQuery(sql, param ,function(result) {
            if(result == null || result.length == 0) {
                callback(false);
            } else {
                var temp = [];
                for(i=0; i < result.length; i++) {
                    temp.push(result[i].group_name);
                }
                callback(temp);
            }
        });
    },
    getDeviceOwner: function (id, device_id, callback) {
        var sql = "SELECT t1.id, t1.first_name, t1.last_name FROM users as t1, devices as t2 WHERE t1.id = t2.device_owner AND t2.id = ? LIMIT 1";
        var param = [device_id];
        db.executeQuery(sql, param ,function(result) {
            if(result == null || result.length == 0) {
                callback(false);
            } else {
                if(result[0].id == id) {
                    callback('You');
                } else {
                    callback(result[0].first_name +' '+result[0].last_name);
                }
            }
        });
    },
    getOnlyDeviceOwner: function (device_id, callback) {
        var sql = "SELECT device_owner FROM devices WHERE id=? LIMIT 1";
        var param = [device_id];
        db.executeQuery(sql, param ,function(result) {
            if(result == null || result.length == 0) {
                callback(false);
            } else {
                callback(result[0].device_owner);
            }
        });
    },
    getDeviceStatus: function(device_id, callback) {
        var sql = "SELECT device_status from devices WHERE id = ? LIMIT 1";
        var param = [device_id];
        db.executeQuery(sql, param ,function(result) {
            if(result == null || result.length == 0) {
                callback("Unknown");
            } else {
                callback(result[0].device_status);
            }
        });
    },
    getDeviceGroupDetails: function(id, device_id, group_name, callback) {
        var sql = "SELECT t1.id as control_id, t1.device_io_port as io, t1.name, t1.status from device_controls as t1, device_groups as t2 WHERE t1.device_id=? AND t1.id = t2.control_id AND t2.fid=? AND t2.group_name=?";
        var param = [device_id, id, group_name];
        db.executeQuery(sql, param ,function(result) {
            if(result == null || result.length == 0) {
                callback(false);
            } else {
                callback(result);
            }
        });
    },
    getGrantedUser: function(id, device_id, callback) {
        var sql = "SELECT t1.id, t1.email from users as t1, device_groups as t2 WHERE t1.id=t2.fid AND t2.device_id=? AND t2.fid != ? GROUP BY t1.id, t1.email";
        var param = [device_id, id];
        db.executeQuery(sql, param, function(result) {
            if(result == null || result.length == 0) {
                callback(false);
            } else {
                callback(result);
            }
        });
    },
    setScheduleTurnOff: function(date_time, control_id, device_io, callback) {
        var date = new Date(date_time);
        var j = schedule.scheduleJob(date, function(){
            var sql = "SELECT device_id FROM device_controls WHERE id=? LIMIT 1";
            var param = [control_id];
            db.executeQuery(sql, param, function(result) {
                if(result == null || result.length == 0) {
                    callback(false);
                } else {
                    if(socketAPI.connectedDevices.length > 0 && socketAPI.connectedDevices[0][result[0].device_id]) {
                        var reqDevice = {
                            type: "turnOffSpecific",
                            device_io: parseInt(device_io)
                        };
                        var rData = JSON.stringify(reqDevice);
                        socketAPI.connectedDevices[0][result[0].device_id].write(rData.length + rData);
                    }
                }
            });
            console.log('Schedule turn off at '+ date_time);
        });
        callback("Schedule successfully set!");
    },
    removeDeviceAccess: function(id, friend_id, callback) {
        var sql = "DELETE FROM device_groups WHERE fid=? AND fid !=?";
        var param = [friend_id, id];
        db.executeQuery(sql, param ,function(result) {
            if(result == null || result.length == 0) {
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    changeSwitchGroup: function(control_id, group_name, id, callback) {
        var sql = "UPDATE device_groups SET group_name=? WHERE control_id=? AND fid=?";
        var param = [group_name, control_id, id];
        db.executeQuery(sql, param ,function(result) {
            if(result == null || result.length == 0) {
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    checkFriendEmail: function(email, callback) {
        var sql = "SELECT id FROM users WHERE email=? LIMIT 1";
        var param = [email];
        db.executeQuery(sql, param, function(result) {
            if(result == null || result.length == 0) {
                callback(false);
            } else {
                callback(result[0].id);
            }
        });
    },
    dbShareEntry: function(device_id, fid, callback) {
        this.getDeviceControls(device_id, function (result) {
            if(result) {
                var data = [];
                for(i = 0; i < result.length; i++) {
                    data.push([fid, result[i].device_id, result[i].id, "Uncategorized"]);
                }
                console.log(data);
                var sql_query = "INSERT IGNORE INTO device_groups (fid, device_id, control_id, group_name) VALUES ?";
                var param = [data];
                db.executeQuery(sql_query, param, function (res) {
                    if (res == null || res.length == 0) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                });
            } else {
                callback(false);
            }
        });
    },
    getDeviceControls: function(device_id, callback) {
        var sql = "SELECT id, device_id FROM device_controls WHERE device_id=?";
        var param = [device_id];
        db.executeQuery(sql, param, function(result) {
            if(result == null || result.length == 0) {
                callback(false);
            } else {
                callback(result);
            }
        });
    },
    addNewDeviceToDatabase: function (data, callback) {
        var sql = "INSERT into devices (device_owner, device_name, password, device_status) values (?, ?, ?, ?)";
        var param = [data.device_owner, data.device_name, data.device_password, data.device_status];
        db.executeQuery(sql, param ,function(result) {
            var response = {};
            if(result == null || result.length == 0) {
                response.response = "failed";
                response.message = "Unknown error occurred! Please try again later!";
                callback(response);
            } else {
                response.response = "success";
                response.message = "You device added successfully!";
                response.id = result.insertId;
                callback(response);
            }
        });
    },
    removeDeviceFromDataBase: function (data, callback) {
        var sql = "DELETE from device_groups WHERE device_id=? AND fid=?";
        var param = [data.device_id, data.x_controller];
        db.executeQuery(sql, param ,function(result) {
            var response = {};
            if(result == null || result.length == 0) {
                response.response = "failed";
                response.message = "Unknown error occurred! Please try again later!";
                callback(response);
            } else {
                response.response = "success";
                response.message = "Device removed successfully!";
                callback(response);
            }
        });
    },
    updateDeviceSetting: function (data, callback) {
        var sql = "UPDATE devices SET device_name = ?, password = ? WHERE device_owner = ? AND id = ?";
        var param = [data.device_name, data.device_password, data.device_owner, data.device_id];
        db.executeQuery(sql, param ,function(result) {
            var response = {};
            if(result == null || result.length == 0) {
                response.response = "failed";
                response.message = "Unknown error occurred! Please try again later!";
                callback(response);
            } else {
                response.response = "success";
                response.message = "Device setting updated successfully!";
                callback(response);
            }
        });
    }
};