module.exports = {
    updateProfile: {
        firstName:[
            { validator: 'notEmpty', message: 'You must enter you first name!' }
        ],
        lastName: [
            { validator: 'notEmpty', message: 'You must enter your last name!' }
        ],
        newEmail: [
            {validator: 'notEmpty', message: 'Email address cannot be empty!'},
            {validator: 'email', message: 'Invalid email address!'}
        ]
    },
    validateNewPassword: {
        newPassword: [
            { validator: 'regexp', regexp: /^(?=.*[a-z])/, message: 'New password must contain at least one lowercase character!' },
            { validator: 'regexp', regexp: /^(?=.*[A-Z])/, message: 'New password must contain at least one uppercase character!' },
            { validator: 'regexp', regexp: /^(?=.*[0-9])/, message: 'New password must contain at least one digit!' },
            { validator: 'regexp', regexp: /^([a-zA-Z0-9!@#\$%\^&*\(\)-+=\"\';:\/,.\~_-]){8,20}$/, message: 'New password length must be between 8 and 20!' }
        ],
        reNewPassword: [
            { validator: "same", field: "newPassword", message: "New password and confirmation password does not match!" }
        ]
    }
};