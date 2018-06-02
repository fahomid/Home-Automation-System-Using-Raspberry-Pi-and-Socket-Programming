var loginModel = require.main.require("./models/login-model");
var registerModel = require.main.require("./models/register-model");
var forgetPasswordModel = require.main.require("./models/forget-password");
var profileUpdateModel = require.main.require("./models/profileUpdate");
var registerRules = require.main.require("./validation/registration");
var loginRules = require.main.require("./validation/login");
var forgetPasswordRules = require.main.require("./validation/forget");
var randomString = require("randomstring");
var Validation = require("async-validation");
var deviceValidationRules = require.main.require("./validation/devices");
var profileUpdate = require.main.require("./validation/profileUpdate");
var bcrypt = require("bcrypt");

module.exports = {
    userLoginVerify: function (user, callback) {
        var options = {};
        var v = new Validation(user, loginRules.login, options);
        v.validate(function (err) {
            if (err) {
                var response = {};
                response.response = "failed";
                if(err.email) {
                    response.message = err.email;
                }
                else if(err.password) {
                    response.message = err.password;
                } else {
                    response.message = "Unknown error occurred! Please try again later!";
                }
                callback(response);
            } else {
                loginModel.validateUser(user, function (userData) {
                    if(userData) {
                        user = {
                            id: userData.id,
                            email: userData.email,
                            firstName: userData.first_name,
                            lastName: userData.last_name,
                            joined: userData.joined_at,
                            log_in_ip: user.ip,
                            userToken: randomString.generate()
                        };
                        loginModel.recordNewLogin(user, function (allTaskDone) {
                            if(allTaskDone) {
                                callback({response: "success", message: "Logged in successfully!"}, user);
                            } else {
                                callback({response: "failed", message: "Unknown error occurred! Please try again later!"}, null);
                            }
                        });
                    } else {
                        var response = {
                            response: "failed",
                            message: "Combination of email and password not found!"
                        };
                        callback(response, null);
                    }
                });
            }
        });
    },
    registerNewUserAccount: function (user, callback) {
        var options = {};
        var v = new Validation(user, registerRules.registration, options);
        v.validate(function (err) {
            if (err) {
                var response = {};
                response.response = "failed";
                if(err.email) {
                    response.message = err.email;
                }
                else if(err.password) {
                    response.message = err.password;
                } else if(err.firstName) {
                    response.message = err.firstName;
                } else if(err.lastName) {
                    response.message = err.lastName;
                } else {
                    response.message = "Unknown error occurred! Please try again later!";
                }
                callback(response);
            } else {
                registerModel.registerUser(user, function(response) {
                    callback(response);
                });
            }
        });
    },
    resetPassword: function (email, callback) {
        var options = {};
        var v = new Validation(email, forgetPasswordRules.forgetPasswordRule, options);
        v.validate(function (err) {
            if (err) {
                var response = {};
                response.response = "failed";
                if(err.email) {
                    response.message = err.email;
                } else {
                    response.message = "Unknown error occurred! Please try again later!";
                }
                callback(response);
            } else {
                var response = {};
                response.response = "success";
                response.message = "Password reset successful! Please check your email!";
                callback(response);
            }
        });
    },
    verifyNewDevice: function (data, callback) {
        var options = {};
        var v = new Validation(data, deviceValidationRules.device, options);
        v.validate(function (err) {
            if (err) {
                console.log(err);
                var response = {};
                response.response = "failed";
                if(err.device_id) {
                    response.message = err.device_id;
                } else if(err.device_password) {
                    response.message = err.device_password;
                } else {
                    response.message = "Unknown error occurred! Please try again later!";
                }
                callback(response);
            } else {
                callback(true);
            }
        });
    },
    updateProfileDetails: function (data, callback) {
        var options = {};
        var v = new Validation(data, profileUpdate.updateProfile, options);
        v.validate(function (err) {
            if (err) {
                var response = {};
                response.response = "failed";
                if(err.firstName) {
                    response.message = err.firstName;
                } else if(err.lastName) {
                    response.message = err.lastName;
                } else if(err.password) {
                    response.message = err.password;
                } else if(err.newPassword) {
                    response.message = err.newPassword;
                } else if(err.reNewPassword) {
                    response.message = err.reNewPassword;
                } else if(err.email) {
                    response.message = err.email;
                } else {
                    response.message = "Unknown error occurred! Please try again later!";
                }
                callback(response);
            } else {
                profileUpdateModel.checkIfEmailAlreadyExist(data, function (eR) {
                    if(eR === false) {
                        loginModel.validateUser(data, function (response) {
                            if(!response) {
                                var rData = {};
                                rData.response = "failed";
                                rData.message = "Current password does not match!";
                                callback(rData);
                            } else {
                                if(data.newPassword == "") {
                                    profileUpdateModel.doProfileUpdate(data, function (response) {
                                        var rData = {};
                                        if(response) {
                                            rData.response = "success";
                                            rData.message = "Profile updated successfully!";
                                        } else {
                                            rData.response = "failed";
                                            rData.message = "Unknown error occurred! Please try again later!";
                                        }
                                        callback(rData);
                                    });
                                } else {
                                    var options = {};
                                    var v = new Validation(data, profileUpdate.validateNewPassword, options);
                                    v.validate(function (err) {
                                        if (err) {
                                            var response = {};
                                            response.response = "failed";
                                            if(err.newPassword) {
                                                response.message = err.newPassword;
                                            } else if(err.reNewPassword) {
                                                response.message = err.reNewPassword;
                                            } else {
                                                response.message = "Unknown error occurred! Please try again later!";
                                            }
                                            callback(response);
                                        } else {
                                            var salt = bcrypt.genSaltSync(10);
                                            var hash = bcrypt.hashSync(data.newPassword, salt);
                                            data.newPassword = hash;
                                            console.log(data);
                                            profileUpdateModel.doProfileUpdate(data, function (response) {
                                                var rData = {};
                                                if(response) {
                                                    rData.response = "success";
                                                    rData.message = "Profile updated successfully!";
                                                } else {
                                                    rData.response = "failed";
                                                    rData.message = "Unknown error occurred! Please try again later!";
                                                }
                                                callback(rData);
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        var r = {};
                        r.response = "failed";
                        r.message = eR;
                        callback(r);
                    }
                });
            }
        });
    }
};