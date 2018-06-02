$(function() {
    var ajaxing = false;
    var api_url = "http://127.0.0.1:1337/api";
    var current_element = "";

    //registration form handle
    $(".registerAccount").on("submit", function(e) {
        $(".alert_msg_container").empty();
        $(".alert_msg_container").slideUp("fast");
        if($("#firstName").val() == "" || $("#lastName").val() == "" ||   $("#inputPassword").val() == "") {
            $(".alert_msg_container").removeClass("alert-success").addClass("alert-danger");
            $(".alert_msg_container").empty();
            $(".alert_msg_container").append('<strong>Error! </strong>You must fill all the fields correctly!');
            $(".alert_msg_container").slideDown();
        } else {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "register",
                    email: $("#email").val(),
                    password: $("#inputPassword").val(),
                    firstName: $("#firstName").val(),
                    lastName: $("#lastName").val()
                },
                success: function (data) {
                    if (data.response === "success") {
                        $(".alert_msg_container").removeClass("alert-danger").addClass("alert-success");
                        $(".alert_msg_container").empty();
                        $(".alert_msg_container").append('<strong>Success! </strong>' + data.message).slideDown("fast");
                        $(".error_msg_container").slideDown();
                        setTimeout(function () {
                            location.href = "/login?msg=Registration was successful! You may login now!";
                        }, 500);
                    } else if (data.response === "failed") {
                        $(".alert_msg_container").removeClass("alert-success").addClass("alert-danger");
                        $(".alert_msg_container").empty();
                        $(".alert_msg_container").append('<strong>Error! </strong>' + data.message).slideDown("fast");
                    }
                }
            });
            ajaxing = false;
        }
        e.preventDefault();
    });


    //login form handle
    $(".loginToAccount").on("submit", function(e) {
        $(".alert_msg_container").empty();
        $(".alert_msg_container").slideUp("fast");
        if($("#inputEmail").val() == "" || $("#inputPassword").val() == "") {
            $(".alert_msg_container").removeClass("alert-success").addClass("alert-danger");
            $(".alert_msg_container").append('<strong>Error! </strong>You must fill all the fields correctly!');
            $(".alert_msg_container").slideDown();
        } else if(!ajaxing) {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "login",
                    email: $("#inputEmail").val(),
                    password: $("#inputPassword").val(),
                    rememberLogin: $("#rememberLogin").prop("checked") ? true : false
                },
                success: function (data) {
                    if (data.response === "success") {
                        $(".alert_msg_container").removeClass("alert-danger").addClass("alert-success");
                        $(".alert_msg_container").empty();
                        $(".alert_msg_container").append('<strong>Success! </strong>' + data.message).slideDown("fast");
                        setTimeout(function () {
                            location.href = "/home";
                        }, 500);
                    } else if (data.response === "failed") {
                        $(".alert_msg_container").removeClass("alert-success").addClass("alert-danger");
                        $(".alert_msg_container").empty();
                        $(".alert_msg_container").append('<strong>Error! </strong>' + data.message).slideDown("fast");
                    }
                    ajaxing = false;
                }
            });
        }
        e.preventDefault();
    });


    //reset form handle
    $(".resetPassword").on("submit", function (e) {
        $(".alert_msg_container").empty();
        $(".alert_msg_container").slideUp("fast");
        if($("#inputEmail").val() == "") {
            $(".alert_msg_container").removeClass("alert-success").addClass("alert-danger");
            $(".alert_msg_container").append('<strong>Error! </strong>You must fill enter your email address!');
            $(".alert_msg_container").slideDown();
        } else if(!ajaxing) {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "resetPassword",
                    email: $("#inputEmail").val()
                },
                success: function (data) {
                    if (data.response === "success") {
                        $(".alert_msg_container").removeClass("alert-danger").addClass("alert-success");
                        $(".alert_msg_container").empty();
                        $(".alert_msg_container").append('<strong>Success! </strong>' + data.message).slideDown("fast");
                        setTimeout(function () {
                            location.href = "/login?msg=Password reset successful! Please check your email!";
                        }, 500);
                    } else if (data.response === "failed") {
                        $(".alert_msg_container").removeClass("alert-success").addClass("alert-danger");
                        $(".alert_msg_container").empty();
                        $(".alert_msg_container").append('<strong>Error! </strong>' + data.message).slideDown("fast");
                    }
                    ajaxing = false;
                }
            });
        }
        e.preventDefault();
    });


    //device select event handler
    $(document.body).on("click", ".deviceSelectionDpDn>a" ,function(e) {
        if($(this).text() == "No device found") {
            return;
        }
        $(".device_selector").text($(this).text());
        $(".device_selector").attr("data-current-device", $(this).attr("data-device-id"));
        $(".remove_device_btn").show();
        updateDeviceStatus();
        e.preventDefault();
    });

    $("#turnOnAllConfirmed").on("click", function (e) {
        if(!ajaxing) {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "switchOnAll",
                    device_id: $(".device_selector").attr("data-current-device"),
                    io_ports: $(".turn_on_all").attr("data-io-ports")
                },
                success: function (data) {
                    $("#device_notifications").empty();
                    if(data.response === "success") {
                        $("#device_notifications").hide();
                        $("#device_notifications").append('<strong>Success! </strong>'+ data.message);
                        $("#device_notifications").removeClass("alert-danger").addClass("alert-success");
                    } else if(data.response === "failed") {
                        $("#device_notifications").hide();
                        $("#device_notifications").append('<strong>Failed! </strong>'+ data.message);
                        $("#device_notifications").removeClass("alert-success").addClass("alert-danger");
                    }
                    ajaxing = false;
                    $(".bg_wait").show();
                    setTimeout(function () {
                        //updateDeviceStatus();
                        updateSwitchStatus();
                        $(".bg_wait").hide();
                        $("#device_notifications").slideDown('slow').delay(3000).slideUp("slow");
                    }, 2000);
                }
            });
        }
        e.preventDefault();
    });

    $('#remove_device').on('show.bs.modal', function (e) {
        $(".selected_device_remove").text($(".device_selector").text());
    });

    $("#turnOffAllConfirmed").on("click", function (e) {
        if(!ajaxing) {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "switchOffAll",
                    device_id: $(".device_selector").attr("data-current-device"),
                    io_ports: $(".turn_on_all").attr("data-io-ports")
                },
                success: function (data) {
                    $("#device_notifications").empty();
                    if(data.response === "success") {
                        $("#device_notifications").hide();
                        $("#device_notifications").append('<strong>Success! </strong>'+ data.message);
                        $("#device_notifications").removeClass("alert-danger").addClass("alert-success");
                    } else if(data.response === "failed") {
                        $("#device_notifications").hide();
                        $("#device_notifications").append('<strong>Failed! </strong>'+ data.message);
                        $("#device_notifications").removeClass("alert-success").addClass("alert-danger");
                    }
                    ajaxing = false;
                    $(".bg_wait").show();
                    setTimeout(function () {
                        //updateDeviceStatus();
                        updateSwitchStatus();
                        $(".bg_wait").hide();
                        $("#device_notifications").slideDown('slow').delay(3000).slideUp("slow");
                    }, 2000);
                }
            });
        }
        e.preventDefault();
    });

    $(document.body).on('click', '.device_option_off_btn' ,function(e) {
        if(!ajaxing) {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "turnOffSpecific",
                    device_id: $(".device_selector").attr("data-current-device"),
                    device_io: $(this).attr("data-switch-io")
                },
                success: function (data) {
                    $("#device_notifications").empty();
                    if(data.response === "success") {
                        $("#device_notifications").hide();
                        $("#device_notifications").append('<strong>Success! </strong>'+ data.message);
                        $("#device_notifications").removeClass("alert-danger").addClass("alert-success");
                    } else if(data.response === "failed") {
                        $("#device_notifications").hide();
                        $("#device_notifications").append('<strong>Failed! </strong>'+ data.message);
                        $("#device_notifications").removeClass("alert-success").addClass("alert-danger");
                    }
                    ajaxing = false;
                    $(".bg_wait").show();
                    setTimeout(function () {
                        //updateDeviceStatus();
                        updateSwitchStatus();
                        $(".bg_wait").hide();
                        $("#device_notifications").slideDown('slow').delay(3000).slideUp("slow");
                    }, 2000);
                }
            });
        }
        e.preventDefault();
    });

    $(document.body).on('click', '.device_option_on_btn' ,function(e) {
        if(!ajaxing) {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "turnOnSpecific",
                    device_id: $(".device_selector").attr("data-current-device"),
                    device_io: $(this).attr("data-switch-io")
                },
                success: function (data) {
                    $("#device_notifications").empty();
                    if(data.response === "success") {
                        $("#device_notifications").hide();
                        $("#device_notifications").append('<strong>Success! </strong>'+ data.message);
                        $("#device_notifications").removeClass("alert-danger").addClass("alert-success");
                    } else if(data.response === "failed") {
                        $("#device_notifications").hide();
                        $("#device_notifications").append('<strong>Failed! </strong>'+ data.message);
                        $("#device_notifications").removeClass("alert-success").addClass("alert-danger");
                    }
                    ajaxing = false;
                    $(".bg_wait").show();
                    setTimeout(function () {
                        //updateDeviceStatus();
                        updateSwitchStatus();
                        $(".bg_wait").hide();
                        $("#device_notifications").slideDown('slow').delay(3000).slideUp("slow");
                    }, 2000);
                }
            });
        }
        e.preventDefault();
    });

    /*setInterval(function () {
        updateDeviceStatus();
    }, 10000);*/

    $("#add_new_device_confirm").on("click", function (e) {
        $(".add_device_notification").empty();
        $(".add_device_notification").hide();
        if($("#device_name").val() == "" || $("device_password").val() == "") {
            $(".add_device_notification").append('<strong>Error! </strong> You must fill all the fields!');
            $(".add_device_notification").removeClass("alert-success").addClass("alert-danger");
            $(".add_device_notification").slideDown();
        } else {
            if(!ajaxing) {
                ajaxing = true;
                $.ajax({
                    type: "POST",
                    url: api_url,
                    dataType: "json",
                    data: {
                        actionType: "addNewDevice",
                        device_name: $("#device_name").val(),
                        device_password: $("#device_password").val()
                    },
                    success: function (data) {
                        if(data.response === "success") {
                            $(".new_device_id").text(data.id);
                            $(".bg_wait").show();
                            setTimeout(function () {
                                updateDeviceList();
                                //updateDeviceStatus();
                                $("#add_another_new_device").show();
                                $("#add_new_device_confirm").hide();
                                $(".add_device_form").slideUp("slow");
                                $(".bg_wait").hide();
                                $(".add_device_notification_success").slideDown('slow');
                            }, 2000);
                        } else if(data.response === "failed") {
                            $(".add_device_notification").append('<strong>Error! </strong>'+ data.message);
                            $(".bg_wait").show();
                            setTimeout(function () {
                                //updateDeviceStatus();
                                $(".bg_wait").hide();
                                $(".add_device_notification").slideDown().delay(3000).slideUp("slow");
                            }, 2000);
                        }
                        ajaxing = false;
                    }
                });
            }
        }
        e.preventDefault();
    });

    $("#add_another_new_device").on("click", function (e) {
        $(this).hide();
        $("#add_new_device_confirm").show();
        $(".add_device_notification_success").slideUp('slow');
        $(".add_device_form")[0].reset();
        $(".add_device_form").slideDown("slow");
        e.preventDefault();
    });

    $("#remove_selected_device").on("click", function() {
        if(!ajaxing) {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "removeDevice",
                    device_id: $(".device_selector").attr("data-current-device")
                },
                success: function (data) {
                    if(data.response === "success") {
                        $(".bg_wait").show();
                        $(".remove_device_info_body").hide();
                        setTimeout(function () {
                            $(".remove_device_footer").hide();
                            $("remove_device_info_body").hide();
                            $(".remove_device_info_alert").empty();
                            $(".remove_device_info_alert").removeClass("alert-danger").addClass("alert-success");
                            $(".remove_device_btn").hide();
                            $(".remove_device_info_alert").append('<strong>Success! </strong>'+ data.message);
                            //updateDeviceStatus();
                            updateDeviceList();
                            $(".remove_device_info_alert").slideDown("slow");
                            $(".bg_wait").hide();
                            setTimeout(function () {
                                location.reload();
                            }, 3000);
                        }, 2000);
                    } else if(data.response === "failed") {
                        $(".remove_device_info_alert").empty();
                        $(".remove_device_info_alert").removeClass("alert-success").addClass("alert-danger");
                        $(".remove_device_info_alert").append('<strong>Error! </strong>'+ data.message);
                        $(".bg_wait").show();
                        $(".remove_device_info_alert").empty();
                        setTimeout(function () {
                            //updateDeviceStatus();
                            $(".bg_wait").hide();
                            $(".remove_device_info_alert").slideDown().delay(3000).slideUp("slow");
                        }, 2000);
                    }
                    ajaxing = false;
                }
            });
        }
    });

    $("#update_profile_details").on("submit", function (e) {
        $(".update_profile_alert").hide();
        if($("#newPassword").val() != $("#reNewPassword").val()) {
            $(".update_profile_alert").empty();
            $(".update_profile_alert").removeClass("alert-success").addClass("alert-danger");
            $(".update_profile_alert").append('<strong>Error! </strong> New password and confirmation password does not match!');
            $(".update_profile_alert").slideDown("slow").delay(10000).slideUp("slow");
        } else {
            if(!ajaxing) {
                $(".bg_wait").show();
                ajaxing = true;
                $.ajax({
                    type: "POST",
                    url: api_url,
                    dataType: "json",
                    data: {
                        actionType: "updateProfileDetails",
                        firstName: $("#firstNameUpdate").val(),
                        lastName: $("#lastNameUpdate").val(),
                        email: $("#newEmail").val(),
                        password: $("#currentPassword").val(),
                        newPassword: $("#newPassword").val(),
                        reNewPassword: $("#reNewPassword").val()
                    },
                    success: function (data) {
                        if(data.response === "success") {
                            $(".user_name").text($("#firstNameUpdate").val() +" "+$("#lastNameUpdate").val());
                            $(".update_profile_alert").empty();
                            $(".update_profile_alert").removeClass("alert-danger").addClass("alert-success");
                            $(".update_profile_alert").append('<strong>Success! </strong>'+ data.message);
                            $("#currentPassword, #newPassword, #reNewPassword").val("");
                            setTimeout(function () {
                                $(".bg_wait").hide();
                                $(".update_profile_alert").slideDown("slow");
                            }, 2000);
                        } else if(data.response === "failed") {
                            $(".update_profile_alert").empty();
                            $(".update_profile_alert").removeClass("alert-success").addClass("alert-danger");
                            $(".update_profile_alert").append('<strong>Failed! </strong>'+ data.message);
                            setTimeout(function () {
                                $(".bg_wait").hide();
                                $(".update_profile_alert").slideDown("slow");
                            }, 2000);
                        }
                        ajaxing = false;
                    }
                });
            }
        }
        e.preventDefault();
    });

    $("#manage_profile").on("click", function(e) {
        $(".bg_wait").show();
        $("#manage_profile_container").show();
        $(".side_bar>li").removeClass("active");
        $(this).addClass("active");
        $("#manage_devices, #manage_devices_settings").hide();
        $("#manage_profile_container").show();
        setTimeout(function () {
            $(".bg_wait").hide();
        }, 2000);
        e.preventDefault();
    });

    $("#update_device_settings").on("click", function(e) {
        $(".bg_wait").show();
        $("#manage_devices_settings").show();
        $(".side_bar>li").removeClass("active");
        $(this).addClass("active");
        $("#manage_devices, #manage_profile_container").hide();

        setupDeviceSettingPage();
        setTimeout(function () {
            $(".bg_wait").hide();
        }, 2000);
        e.preventDefault();
    });

    $(".profile_btn_click").on("click", function () {
        $("#manage_profile").trigger("click");
    });

    $("#manage_iot_devices").on("click", function(e) {
        $(".bg_wait").show();
        $("#manage_devices").show();
        $(".side_bar>li").removeClass("active");
        $(this).addClass("active");
        $("#manage_profile_container, #manage_devices_settings").hide();
        //updateDeviceStatus();
        setTimeout(function () {
            $(".bg_wait").hide();
        }, 2000);
        e.preventDefault();
    });

    function setupDeviceSettingPage() {
        if(!ajaxing) {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "getDeviceListSettings"
                },
                success: function (data) {
                    if(data.response == "success") {
                        $(".device_settings_list_table").empty();
                        $.each(data.devices, function (key, value) {
                            $(".device_settings_list_table").append('<tr>\n' +
                                '<td>'+ value.id +'</td>\n' +
                                '<td>'+ value.device_name +'</td>\n' +
                                '<td class="text-center">'+ value.device_status +'</td>\n'+
                                '<td class="text-center">\n' +
                                '<div class="btn-group">\n' +
                                '<button aria-expanded="false" aria-haspopup="true" class="btn btn-info dropdown-toggle" data-toggle="dropdown" type="button">Options</button>\n' +
                                '<div class="dropdown-menu">\n' +
                                '<a class="dropdown-item clk_change_device_setting" href="#" data-device-name="'+ value.device_name +'" data-device-id="'+ value.id +'"  data-toggle="modal" data-target="#change_device_setting_modal">Basic Settings</a>'+
                                '<a class="dropdown-item share_device_clk" data-device-id="'+ value.id +'"  data-toggle="modal" data-device-name="'+ value.device_name +'" data-target="#share_device_with_friend" href="#">Share Device</a>\n'+
                                '<a class="dropdown-item device_access_clk"  data-device-id="'+ value.id +'" href="#" data-toggle="modal" data-target="#device_access_modify">Modify Access</a>' +
                                '</div>\n' +
                                '</div>\n' +
                                '</td>\n' +
                                '</tr>');
                        });
                        if($.isEmptyObject(data.devices)) {
                            $(".device_settings_list_table").append('<tr><td colspan="4">You do not have any devices!</td></tr>');
                        }
                    } else {
                        $(".device_settings_list_table").append('<tr><td colspan="4">Unable to fetch device list!</td></tr>');
                    }
                    ajaxing = false;
                }
            });
        }
    }

    $('#device_access_modify').on('shown.bs.modal', function (e) {
        updateAccessGrantedList();
    });

    $(document.body).on("click", ".scheduleTask", function () {
        $("#scheduling_task").attr("data-switch-id", $(this).attr("data-switch-id"));
        $("#scheduling_task").attr("data-switch-io", $(this).attr("data-switch-io"));
    });

    setInterval(function () {
        updateSwitchStatus();
    }, 8000);

    $(".setScheduleBtn").on("click", function (e) {
        if(!ajaxing) {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "setScheduleTurnOff",
                    date_time: $("#offTime").val(),
                    control_id: $("#scheduling_task").attr("data-switch-id"),
                    device_io: $("#scheduling_task").attr("data-switch-io")
                },
                success: function (data) {
                    if(data.response && data.response == "success") {
                        $("#scheduling_task").modal("hide");
                        $("#report_notification").text(data.message);
                        $("#show_notification").modal("show");
                        setTimeout(function () {
                            updateSwitchStatus();
                        }, 1000);
                    } else if(data.response && data.response == "failed") {
                        $("#scheduling_task").modal("hide");
                        $("#report_notification").text(data.message);
                        $("#show_notification").modal("show");
                    } else {
                        $("#scheduling_task").modal("hide");
                        $("#report_notification").text("Unknown error occurred! Please try again later!");
                        $("#show_notification").modal("show");
                    }
                    ajaxing = false;
                }
            });
        }
        e.preventDefault();
    });

    $(document.body).on("click", ".accessRemove", function (e) {
        if(!ajaxing) {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "removeDeviceAccess",
                    friend_id: $(this).attr("data-id"),
                    device_id: $(this).attr("data-device-id")
                },
                success: function (data) {
                    if(data.response && data.response == "success") {
                        $("#device_access_modify").modal("hide");
                        $("#report_notification").text(data.message);
                        $("#show_notification").modal("show");
                        setTimeout(function () {
                            updateDeviceStatus();
                        }, 1000);
                    } else if(data.response && data.response == "failed") {
                        $("#device_access_modify").modal("hide");
                        $("#report_notification").text(data.message);
                        $("#show_notification").modal("show");
                    } else {
                        $("#device_access_modify").modal("hide");
                        $("#report_notification").text("Unknown error occurred! Please try again later!");
                        $("#show_notification").modal("show");
                    }
                    ajaxing = false;
                }
            });
        }
        e.preventDefault();
    });

    $(document.body).on("click", ".share_device_confirm", function (e) {
        if($("#friend_email").val() == "") {
            $("#share_device_with_friend").modal("hide");
            $("#report_notification").html("<strong>Error!</strong> You must enter your friend's email to share the device!");
            $("#show_notification").modal("show");
        } else {
            if(!ajaxing) {
                ajaxing = true;
                $.ajax({
                    type: "POST",
                    url: api_url,
                    dataType: "json",
                    data: {
                        actionType: "share_with_friend",
                        device_id: $(".share_device_clk").attr("data-device-id"),
                        friend_email: $("#friend_email").val()
                    },
                    success: function (data) {
                        if(data.response && data.response == "success") {
                            $("#share_device_with_friend").modal("hide");
                            $("#report_notification").text(data.message);
                            $("#show_notification").modal("show");
                            setTimeout(function () {
                                updateDeviceStatus();
                            }, 1000);
                        } else if(data.response && data.response == "failed") {
                            $("#share_device_with_friend").modal("hide");
                            $("#report_notification").text(data.message);
                            $("#show_notification").modal("show");
                        } else {
                            $("#share_device_with_friend").modal("hide");
                            $("#report_notification").text("Unknown error occurred! Please try again later!");
                            $("#show_notification").modal("show");
                        }
                        ajaxing = false;
                    }
                });
            }
        }
        e.preventDefault();
    });

    $(document.body).on('click', '.clk_change_device_setting' ,function(e) {
        $("#setting_device_name").val($(this).attr("data-device-name"));
        $("#setting_device_id").val($(this).attr("data-device-id"));
        e.preventDefault();
    });

    $(".save_device_setting_confirm").on("click", function (e) {
        $(".device_setting_notification").slideUp("fast");
        $(".device_setting_notification").empty();
        if($("#setting_device_name").val() == "" || $("#setting_device_password").val() == "") {
            $(".device_setting_notification").removeClass("alert-success").addClass("alert-danger");
            $(".device_setting_notification").append('<strong>Error! </strong> You must enter device name and password!');
            $(".device_setting_notification").slideDown("slow");
        } else {
            if(!ajaxing) {
                $(".bg_wait").show();
                ajaxing = true;
                $.ajax({
                    type: "POST",
                    url: api_url,
                    dataType: "json",
                    data: {
                        actionType: "updateDeviceSetting",
                        device_name: $("#setting_device_name").val(),
                        device_password: $("#setting_device_password").val(),
                        device_id: $("#setting_device_id").val()
                    },
                    success: function (data) {
                        if(data.response == "success") {
                            $(".device_setting_notification").removeClass("alert-danger").addClass("alert-success");
                            $(".device_setting_notification").append('<strong>Success! </strong>'+ data.message);
                            setTimeout(function () {
                                setupDeviceSettingPage();
                                $(".device_setting_notification").slideDown("slow").delay(3000);
                                $("#setting_device_password").val("");
                                $(".bg_wait").hide();
                            }, 2000);
                        } else {
                            $(".device_setting_notification").removeClass("alert-success").addClass("alert-danger");
                            $(".device_setting_notification").append('<strong>Error! </strong>'+ data.message);
                            setTimeout(function () {
                                $(".device_setting_notification").slideDown("slow");
                                $(".bg_wait").hide();
                            }, 2000);
                        }
                        ajaxing = false;
                    }
                });
            }
        }
        e.preventDefault();
    });

    function updateAccessGrantedList() {
        if(!ajaxing) {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "getDeviceAccessGrantedUsers",
                    device_id: $(".device_access_clk").attr("data-device-id")
                },
                success: function (data) {
                    if(data.response && data.response == "success") {
                        $(".device_access_list").empty();
                        var counter = 1;
                        $.each(data.grantedUsers, function (key, value) {
                            console.log(value);
                            $(".device_access_list").append('<tr>\n' +
                                '<td>'+ counter++ +'</td>\n' +
                                '<td>'+ value.email +'</td>\n' +
                                '<td class="accessRemove" data-device-id="'+ $(".device_access_clk").attr("data-device-id") +'" data-id="'+ value.id +'"><a href="#">Remove</a></td>'+
                                '</tr>');
                        });
                    }
                    ajaxing = false;
                }
            });
        }
    }

    function updateDeviceList() {
        if(!ajaxing) {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "getDeviceList"
                },
                success: function (data) {
                    if(data.response == "success") {
                        $(".deviceSelectionDpDn").empty();
                        $.each(data.devices, function (index, value) {
                            $(".deviceSelectionDpDn").append('<a class="dropdown-item" data-device-id="'+ value.id +'" href="#">'+ value.device_name +'</a>');
                        });
                        ajaxing = false;
                    }
                }
            });
        }
    }

    //function to get and handle device status
    function updateDeviceStatus() {
        if(!ajaxing && $(".device_selector").attr("data-current-device") && $(".device_selector").attr("data-current-device") !== "") {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "getControlGroups",
                    device_id: $(".device_selector").attr("data-current-device")
                },
                success: function (data) {
                    if(data.response && data.response == "success") {
                        $(".switch_table_list").empty();
                        $.each(data.controlsGroups, function (index, value) {
                            $(".switch_table_list").append('<tr class="dataset_header" id="dataset-'+ index +'"><td class="data_expendable hd_sw" data-toggle="collapse" data-target-def="dataset-'+ index +'" data-target=".dataset-'+ index +'"><i class="fa fa-plus-square"></i></td><td class="sw_group_name" data-device-id="'+ $(".device_selector").attr("data-current-device") +'" colspan="2">'+ value +'</td><td>Owner: <strong>'+ data.device_owner +'</strong></td></tr>');
                        });
                        $(".deviceNotSelectedInitMsg").hide();
                        $(".data_container").show();
                    } else {
                        $(".switch_table_list").empty();
                        $(".switch_table_list").append('<tr><td colspan="4">No switch configured or device is offline!</td></tr>');
                    }
                    ajaxing = false;
                }
            });
        }
    }

    $("#doGroupChange").on("click", function (e) {
        if($("#group_name").val() == "") {
            $("#change_switch_group").modal("hide");
            $("#report_notification").html("<strong>Error!</strong> You must enter group name!");
            $("#show_notification").modal("show");
        } else {
            if(!ajaxing && $(".device_selector").attr("data-current-device") && $(".device_selector").attr("data-current-device") !== "") {
                ajaxing = true;
                $.ajax({
                    type: "POST",
                    url: api_url,
                    dataType: "json",
                    data: {
                        actionType: "changeSwitchGroup",
                        control_id: $("#switch_grouping").attr("data-switch-id"),
                        group_name: $("#group_name").val()
                    },
                    success: function (data) {
                        if(data.response && data.response == "success") {
                            $("#change_switch_group").modal("hide");
                            $("#report_notification").text("Switch group change successfully!");
                            $("#show_notification").modal("show");
                            setTimeout(function () {
                                updateDeviceStatus();
                            }, 1000);
                        } else if(data.response && data.response == "failed") {
                            $("#change_switch_group").modal("hide");
                            $("#report_notification").text(data.message);
                            $("#show_notification").modal("show");
                        } else {
                            $("#change_switch_group").modal("hide");
                            $("#report_notification").text("Unknown error occurred! Please try again later!");
                            $("#show_notification").modal("show");
                        }
                        ajaxing = false;
                    }
                });
            }
        }
        e.preventDefault();
    });

    $(document.body).on('click', '.data_expendable', function() {
        current_element = $(this);
        if($("#list_last_elem").length > 0 && $(this).parent().attr("id") != $("#"+ $("#list_last_elem").attr("class")).attr("id")) {
            $("#"+ $("#list_last_elem").attr("class")).find(".data_expendable").addClass("hd_sw");
            $("#"+ $("#list_last_elem").attr("class")).find(".data_expendable").html('<i class="fa fa-plus-square"></i>');
            $("."+ $("#list_last_elem").attr("class")).remove();
        }
        if($(this).hasClass('hd_sw')) {
            $(this).html('<i class="fa fa-minus-square"></i>');
            $(this).removeClass('hd_sw');
            if(!ajaxing && $(".device_selector").attr("data-current-device") && $(".device_selector").attr("data-current-device") !== "") {
                ajaxing = true;
                $.ajax({
                    type: "POST",
                    url: api_url,
                    dataType: "json",
                    data: {
                        actionType: "getGroupDevicesDetails",
                        device_id: $(".device_selector").attr("data-current-device"),
                        group_name: $(current_element).parent().find('.sw_group_name').text()
                    },
                    success: function (data) {
                        if(data.response === "success") {
                            $($(current_element).attr('data-target')).remove();
                            $("#turn_all_on_or_off_container").remove();
                            var counter = data.devices.length;
                            var io_array = [];
                            $.each(data.devices, function (index, value) {
                                $(current_element).parent().after('<tr '+ (index == 0 ? 'id="list_last_elem" ': ' ') +'class="' + $(current_element).attr('data-target-def') + '"><td>' + counter-- + '</td>\n' +
                                    '<td>' + value.name + '</td>\n' +
                                    '<td>' + ((value.status === 1) ? "On" : "Off") + '</td>\n' +
                                    '<td class="text-center">\n' +
                                    '<div class="btn-group">\n' +
                                    '<button aria-expanded="false" aria-haspopup="true" class="btn btn-info dropdown-toggle" data-toggle="dropdown" type="button">Options</button>\n' +
                                    '<div class="dropdown-menu">\n' +
                                    '<a class="dropdown-item device_option_on_btn" data-switch-io="' + value.io + '" href="#">Turn On This Switch</a>\n' +
                                    '<a class="dropdown-item device_option_off_btn" href="#" data-switch-io="' + value.io + '" >Turn Off This Switch</a>' +
                                    '<a class="dropdown-item" id="switch_grouping" href="#" data-toggle="modal" data-target="#change_switch_group" data-switch-id="' + value.control_id + '" >Change Switch Group</a> \n' +
                                    '<a class="dropdown-item scheduleTask" href="#" data-toggle="modal" data-target="#scheduling_task" data-switch-io="'+ value.io +'" data-switch-id="' + value.control_id + '" >Schedule Turn Off</a>'+
                                    '</div>\n' +
                                    '</div>\n' +
                                    '</td>\n' +
                                    '</tr>');
                                io_array.push(value.io);
                            });

                            $('#list_last_elem').after('<tr id="turn_all_on_or_off_container">\n' +
                                '<td colspan="2" class="text-center">\n' +
                                '<button class="btn btn-success turn_on_all" data-toggle="modal" data-target="#confirmTurnOn" data-io-ports="'+ JSON.stringify(io_array) +'">Turn All On</button>\n' +
                                '</td>\n' +
                                '<td colspan="2" class="text-center">\n' +
                                '<button class="btn btn-danger turn_off_all" data-toggle="modal" data-target="#confirmTurnOff" data-io-ports="'+ JSON.stringify(io_array) +'">Turn All Off</button>\n' +
                                '</td>\n' +
                                '</tr>');
                        }
                        ajaxing = false;
                    }
                });
            }
        } else {
            $(this).html('<i class="fa fa-plus-square"></i>');
            $(this).addClass('hd_sw');
            $($(current_element).attr('data-target')).remove();
            $("#turn_all_on_or_off_container").remove();
        }
    });

    setInterval(updateDeviceOnlineStatus, 8000);

    function updateDeviceOnlineStatus() {
        if(!ajaxing && $(".device_selector").attr("data-current-device") && $(".device_selector").attr("data-current-device") !== "") {
            ajaxing = true;
            $.ajax({
                type: "POST",
                url: api_url,
                dataType: "json",
                data: {
                    actionType: "getDevice_status",
                    device_id: $(".device_selector").attr("data-current-device")
                },
                success: function (data) {
                    if(data.response && data.response == "success" && data.status) {
                        $(".online_status").css("background-image", "url(" + (data.status === "Online" ? "/img/connected.png" : "/img/disconnected.png") + ")");
                        $(".online_status").attr("title", "This device is currently "+ data.status+ "!");
                        $(".online_status").show();
                    }
                    ajaxing = false;
                }
            });
        }
    }

    function updateSwitchStatus() {
        var temp = $("#list_last_elem").attr("class");
        $("#"+ temp).find(".data_expendable").trigger("click");
        $("#"+ temp).find(".data_expendable").trigger("click");
        /*console.log($("#list_last_elem").closest('tr').find(".data_expendable").attr("data-target-def"));
        var temp = $("#list_last_elem").parent().find(".data_expendable").attr('data-target-def');
        $("#list_last_elem").parent().find(".data_expendable").trigger("click");
        $("#"+ temp).find(".data_expendable").trigger("click");*/
    }

    $("#offTime").daterangepicker({
        timePicker: true,
        timePickerIncrement: 30,
        singleDatePicker: true,
        timePickerIncrement: 1,
        timePicker24Hour: true,
        minDate: moment(),
        locale: {
            format: 'YYYY-MM-DD HH:mm'
        }
    });
});