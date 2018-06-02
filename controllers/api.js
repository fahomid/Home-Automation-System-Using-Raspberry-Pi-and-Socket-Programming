var express = require("express");
var router = express.Router();
var apiController = require.main.require("./controllers/apiController");
var sha1 = require("sha1");
var socketAPI = require.main.require("./controllers/socketAPI");
var device = require.main.require("./models/device");
var userModel = require.main.require("./models/user-model");
var devicePassValidation = require.main.require("./validation/devicePassword");
var Validation = require("async-validation");

//Request Handler
//handle get request
router.get('/', function(req, res){
    res.redirect("/");
});

//handle post request
router.post('/', function(req, res) {
    if(req.body.actionType && req.body.actionType === "login" && req.body.email && req.body.password && req.body.rememberLogin) {
        var user = {
            email: req.body.email,
            password: req.body.password,
            ip: req.connection.remoteAddress
        };
        apiController.userLoginVerify(user, function (response, data) {
            if(response.response == "success") {
                req.session.loggedUser = data;
                if(req.body.rememberLogin == "true") {
                    res.cookie("token", data.userToken, { expires: new Date(Date.now() + 7776000000), httpOnly: true });
                    res.cookie("uToken", sha1(data.id.toString()), { expires: new Date(Date.now() + 7776000000), httpOnly: true });
                }
            }
            res.send(response);
        });
    } else if(req.body.actionType && req.body.actionType === "register" && req.body.email && req.body.password && req.body.firstName && req.body.lastName) {
        var user = {
            email: req.body.email,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        };
        apiController.registerNewUserAccount(user, function (response) {
            res.send(response);
        })
    } else if(req.body.actionType && req.body.actionType === "resetPassword" && req.body.email) {
        var user = {
            email: req.body.email
        };
        apiController.resetPassword(user, function (response) {
            res.send(response);
        })
    } else if(req.body.actionType && req.body.actionType === "getDeviceDetails" && req.body.device_id && req.session.loggedUser) {
        device.getDeviceDetails(req.body.device_id, function (response) {
            var device_controls = response.device_controls;
            if(device_controls === "") device_controls = {};
            var uResponse = {
                response: "success",
                controls: device_controls,
                device_status: response.device_status,
                device_id: req.body.device_id
            };
            res.send(uResponse);
        });
    } else if(req.body.actionType && req.body.actionType === "getControlGroups" && req.body.device_id && req.session.loggedUser) {
        device.getControlGroups(req.session.loggedUser.id, req.body.device_id, function (response) {
            device.getDeviceOwner(req.session.loggedUser.id, req.body.device_id, function (device_owner_name) {
                var uResponse = {
                    response: "success",
                    controlsGroups: response,
                    device_owner: device_owner_name
                };
                res.send(uResponse);
            });
        });
    } else if(req.body.actionType && req.body.actionType === "getDevice_status" && req.body.device_id && req.session.loggedUser) {
        device.getDeviceStatus(req.body.device_id, function (response) {
            var uResponse = {
                response: "success",
                status: response
            };
            res.send(uResponse);
        });
    } else if(req.body.actionType && req.body.actionType === "changeSwitchGroup" && req.body.control_id && req.body.group_name && req.session.loggedUser) {
        if(req.body.group_name == "") {
            res.send(uResponse);
            var uResponse = {
                response: "failed",
                message: "You must enter group name!"
            };
            res.send(uResponse);
        } else {
            device.changeSwitchGroup(req.body.control_id, req.body.group_name, req.session.loggedUser.id, function (response) {
                var uResponse = {
                    response: response == true ? "success" : "failed"
                };
                if(!response) {
                    uResponse.message = "Unknown error occurred! Please try again later!";
                }
                res.send(uResponse);
            });
        }
    } else if(req.body.actionType && req.body.actionType === "getGroupDevicesDetails" && req.body.device_id && req.body.group_name && req.session.loggedUser) {
        device.getDeviceGroupDetails(req.session.loggedUser.id, req.body.device_id, req.body.group_name, function (response) {
            var uResponse = {
                response: "success",
                devices: response
            };
            res.send(uResponse);
        });
    } else if(req.body.actionType && req.body.actionType === "getDeviceAccessGrantedUsers" && req.body.device_id && req.session.loggedUser) {
        device.getGrantedUser(req.session.loggedUser.id, req.body.device_id, function (response) {
            var uResponse = {
                response: "success",
                grantedUsers: response
            };
            res.send(uResponse);
        });
    } else if(req.body.actionType && req.body.actionType === "setScheduleTurnOff" && req.body.date_time && req.body.control_id && req.body.device_io && req.session.loggedUser) {
        device.setScheduleTurnOff(req.body.date_time, req.body.control_id, req.body.device_io, function (response) {
            var uResponse = {
                response: "success",
                message: response
            };
            res.send(uResponse);
        });
    } else if(req.body.actionType && req.body.actionType === "removeDeviceAccess" && req.body.friend_id && req.body.device_id && req.session.loggedUser) {
        device.getOnlyDeviceOwner(req.body.device_id, function (r) {
            if(r != req.session.loggedUser.id) {
                var uResponse = {
                    response: "failed",
                    message: "Only device owner can remove access!"
                };
                res.send(uResponse);
            } else {
                device.removeDeviceAccess(req.session.loggedUser.id, req.body.friend_id, function (response) {
                    if(response) {
                        var uResponse = {
                            response: "success",
                            message: "Access has been removed successfully!"
                        };
                        res.send(uResponse);
                    } else {
                        var uResponse = {
                            response: "success",
                            message: "Unknown error occurred! Please try again later!"
                        };
                        res.send(uResponse);
                    }
                });
            }
        });
    } else if(req.body.actionType && req.body.actionType === "switchOnAll" && req.body.io_ports && req.body.device_id && req.session.loggedUser) {
        if(socketAPI.connectedDevices.length > 0 && socketAPI.connectedDevices[0][req.body.device_id]) {
            var reqDevice = {
                type: "turnOnAll",
                io_ports: JSON.parse(req.body.io_ports)
            };
            var rData = JSON.stringify(reqDevice);
            socketAPI.connectedDevices[0][req.body.device_id].write(rData.length + rData);
            var response = {
                response: "success",
                "message": "All switches turned on successfully!"
            };
            res.send(response);
        } else {
            var response = {
                response: "failed",
                "message": "Could not connect to the device!"
            };
            res.send(response);
        }
    } else if(req.body.actionType && req.body.actionType === "switchOffAll" && req.body.io_ports && req.body.device_id && req.session.loggedUser) {
        if(socketAPI.connectedDevices.length > 0 && socketAPI.connectedDevices[0][req.body.device_id]) {
            var reqDevice = {
                type: "turnOffAll",
                io_ports: JSON.parse(req.body.io_ports)
            };
            var rData = JSON.stringify(reqDevice);
            socketAPI.connectedDevices[0][req.body.device_id].write(rData.length + rData);
            var response = {
                response: "success",
                "message": "All switches turned off successfully!"
            };
            res.send(response);
        } else {
            var response = {
                response: "failed",
                "message": "Could not connect to the device!"
            };
            res.send(response);
        }
    } else if(req.body.actionType && req.body.actionType === "turnOffSpecific" && req.body.device_id && req.body.device_io && req.session.loggedUser) {
        if(socketAPI.connectedDevices.length > 0 && socketAPI.connectedDevices[0][req.body.device_id]) {
            var reqDevice = {
                type: "turnOffSpecific",
                device_io: req.body.device_io
            };
            var rData = JSON.stringify(reqDevice);
            socketAPI.connectedDevices[0][req.body.device_id].write(rData.length + rData);
            var response = {
                response: "success",
                "message": "Switch at IO port "+ req.body.device_io +" has been turned off successfully!"
            };
            res.send(response);
        } else {
            var response = {
                response: "failed",
                "message": "Device is currently in offline state!"
            };
            res.send(response);
        }
    } else if(req.body.actionType && req.body.actionType === "turnOnSpecific" && req.body.device_id && req.body.device_io && req.session.loggedUser) {
        if(socketAPI.connectedDevices.length > 0 && socketAPI.connectedDevices[0][req.body.device_id]) {
            var reqDevice = {
                type: "turnOnSpecific",
                device_io: req.body.device_io
            };
            var rData = JSON.stringify(reqDevice);
            socketAPI.connectedDevices[0][req.body.device_id].write(rData.length + rData);
            var response = {
                response: "success",
                "message": "Switch at IO port "+ req.body.device_io +" has been turned on successfully!"
            };
            res.send(response);
        } else {
            var response = {
                response: "failed",
                "message": "Device is currently in offline state!"
            };
            res.send(response);
        }
    } else if(req.body.actionType && req.body.actionType === "addNewDevice" && req.body.device_name && req.body.device_password && req.session.loggedUser) {
        var data = {
            device_name: req.body.device_name,
            device_password: req.body.device_password,
            device_owner: req.session.loggedUser.id,
            device_status: "Offline"
        };
        apiController.verifyNewDevice(data, function (response) {
            if(response === true) {
                device.addNewDeviceToDatabase(data, function (rData) {
                    res.send(rData);
                });
            } else {
                res.send(response);
            }
        });
    } else if(req.body.actionType && req.body.actionType === "removeDevice" && req.body.device_id && req.session.loggedUser) {
        var data = {
            device_id: parseInt(req.body.device_id),
            x_controller: req.session.loggedUser.id
        };
        device.removeDeviceFromDataBase(data, function (response) {
            res.send(response);
        });
    } else if(req.body.actionType && req.body.actionType === "updateProfileDetails" && req.body.firstName && req.body.lastName && req.body.email && req.body.password && req.session.loggedUser) {
        var data = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.session.loggedUser.email,
            newEmail: req.body.email,
            password: req.body.password,
            newPassword: req.body.newPassword ? req.body.newPassword : "",
            reNewPassword: req.body.reNewPassword ? req.body.reNewPassword : "",
            id: req.session.loggedUser.id
        };
        apiController.updateProfileDetails(data, function (response) {
            if(response.response == "success") {
                req.session.loggedUser.firstName = data.firstName;
                req.session.loggedUser.lastName = data.lastName;
                req.session.loggedUser.email = data.newEmail;
            }
            res.send(response);
        });
    } else if(req.body.actionType && req.body.actionType === "getDeviceList" && req.session.loggedUser) {
        userModel.getDeviceNames(req.session.loggedUser.id, function (response) {
            var rS = {
                response: "success",
                message: "Device list fetched successfully!",
                devices: response
            };
            res.send(rS);
        });
    } else if(req.body.actionType && req.body.actionType === "share_with_friend" && req.body.friend_email && req.body.device_id && req.session.loggedUser) {
        device.getOnlyDeviceOwner(req.body.device_id, function (d_owner) {
            if(d_owner != req.session.loggedUser.id) {
                var rS = {
                    response: "failed",
                    message: "You do not have permission to share this device!",
                };
                res.send(rS);
            } else {
                device.checkFriendEmail(req.body.friend_email, function (response) {
                    if(response === false) {
                        var rS = {
                            response: "failed",
                            message: "Friend's email not found in our database!",
                        };
                        res.send(rS);
                    } else {
                        device.dbShareEntry(req.body.device_id, response, function (e) {
                            if(e) {
                                var rS = {
                                    response: "success",
                                    message: "You have successfully granted access to your friend!",
                                };
                                res.send(rS);
                            } else {
                                var rS = {
                                    response: "failed",
                                    message: "Unknown error occurred! Please try again later!",
                                };
                                res.send(rS);
                            }
                        });
                    }
                });
            }
        });
    } else if(req.body.actionType && req.body.actionType === "getDeviceListSettings" && req.session.loggedUser) {
        userModel.getDeviceListSettings(req.session.loggedUser.id, function (response) {
            var rS = {
                response: "success",
                message: "Device setting list fetched successfully!",
                devices: response
            };
            res.send(rS);
        });
    } else if(req.body.actionType && req.body.actionType === "updateDeviceSetting" && req.body.device_name && req.body.device_password && req.body.device_id && req.session.loggedUser) {
        var data = {
            device_name: req.body.device_name,
            device_password: req.body.device_password,
            device_owner: req.session.loggedUser.id,
            device_id: req.body.device_id
        };

        var options = {};
        var v = new Validation(data, devicePassValidation.devicePasswordRules, options);
        v.validate(function (err) {
            if (err) {
                var response = {};
                response.response = "failed";
                if(err.device_name) {
                    response.message = err.device_name;
                }
                else if(err.device_password) {
                    response.message = err.device_password;
                } else {
                    response.message = "Unknown error occurred! Please try again later!";
                }
                res.send(response);
            } else {
                device.updateDeviceSetting(data, function (response) {
                    res.send(response);
                });
            }
        });
    } else {
        //console.log(req.body);
        res.send({response: "failed", message: "Invalid request parameters! Authentication failed!"});
    }
});

// Export (mandatory)
module.exports = router;