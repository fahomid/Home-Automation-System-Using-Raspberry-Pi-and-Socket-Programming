module.exports = {
    devicePasswordRules: {
        device_name: [
            { validator: 'notEmpty', message: 'You must enter your device name!' }
        ],
        device_password: [
            { validator: 'notEmpty', message: 'You must enter a password!' },
            { validator: 'regexp', regexp: /^([a-zA-Z0-9!@#\$%\^&*\(\)-+=\"\';:\/,.\~_-]){8,20}$/, message: 'Password length must be between 8 and 20!' }
        ]
    }
};