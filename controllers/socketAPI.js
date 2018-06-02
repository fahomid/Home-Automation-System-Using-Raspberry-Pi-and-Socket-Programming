var net = require('net');
var socketDataHandler = require.main.require("./models/socketDataHandler");
var connectedDevices = [];
var server = net.createServer(function (socket) {
    var auth = false;
    var device_identifier = '';
    var obj = {};

    socket.on('end', function() {
         console.log("D_id: "+ device_identifier);
         var details = {
             id: device_identifier,
             status: "Offline"
         };
        socketDataHandler.updateDeviceOnlineStatus(details, function (response) {
            if(response) {
                console.log("Device id: "+ device_identifier + " disconnected unexpectedly! Device status updated as offline!");
            } else {
                console.log("Device id: "+ device_identifier + " disconnected unexpectedly! Device status update failed!");
            }
        });
        var i = connectedDevices.indexOf(obj);
        connectedDevices.splice(i, 1);
    });

    socket.on('close', function() {
        var i = connectedDevices.indexOf(obj);
        connectedDevices.splice(i, 1);
        console.log("Socket closed!");
    });
    
    socket.on('data', function(data) {
        //console.log(data.toString());
        try {
            var jsonData = JSON.parse(data.toString());
            if(jsonData.type) {
                switch (jsonData.type) {
                    case 'auth':
                        if(jsonData.device_id && jsonData.token) {
                            var user = {
                                device_id: jsonData.device_id,
                                password: jsonData.token
                            };
                            socketDataHandler.authenticateDevice(user, function (response) {
                                if(response) {
                                    auth = true;
                                    var key = response;
                                    obj[key] = socket;
                                    device_identifier = response;
                                    connectedDevices.push(obj);
                                    var rData = JSON.stringify({response: "success", type: "validation", message: "Logged into successfully!", device_id: user.device_id});
                                    socket.write(rData.length + rData);
                                } else {
                                    var rData = JSON.stringify({response: "failed", type: "validation", message: "Authentication failed! Please check your device password!"});
                                    socket.write(rData.length + rData);
                                    socket.emit("error", new Error("User authentication failed! Closing connection!"));
                                }
                            });
                        }
                        break;

                    case 'statusUpdate':
                        //console.log(jsonData);
                        if(auth) {
                            //console.log(jsonData);
                            if(jsonData.device_controls && jsonData.device_id) {
                                var status = {
                                    controls: jsonData.device_controls,
                                    status: 'Online',
                                    id: jsonData.device_id
                                };

                                socketDataHandler.updateDeviceStatus(status, function (response) {
                                    if(response) {
                                        var rData = JSON.stringify({response: "success", type: "statusUpdate", message: "Status updated successfully!"});
                                        socket.write(rData.length + rData);
                                    } else {
                                        socket.emit("error", new Error("User authentication failed! Closing connection!"));
                                    }
                                });
                            }
                        } else {
                            socket.emit("error", new Error("User authentication failed! Closing connection!"));
                        }
                        break;
                }
            } else {
                socket.emit("error", new Error("Invalid request from client! Closing connection..."));
            }
        } catch (e) {
            socket.emit("error", new Error("Invalid request from client! Closing connection..."));
        }
        //console.log("Socket data received!");
    });
    
    socket.on('error', function(e) {
        socket.destroy("Server closing...!");
        var i = connectedDevices.indexOf(obj);
        connectedDevices.splice(i, 1);
        console.log("Socket error!");
    });
});
//start socket server
server.listen(8000);
console.log("TCP Socket server is on port: 8000");
exports.connectedDevices = connectedDevices;