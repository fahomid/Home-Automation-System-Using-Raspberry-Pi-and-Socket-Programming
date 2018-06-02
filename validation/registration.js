module.exports = {
    registration: {
        email: [
            { validator: 'notEmpty', message: 'Email address cannot be empty!' },
            { validator: 'email', message: 'Invalid email address!'}
        ],
        password: [
            { validator: 'notEmpty', message: 'You must enter a password!' },
            { validator: 'regexp', regexp: /^(?=.*[a-z])/, message: 'Password must contain at least one lowercase character!' },
            { validator: 'regexp', regexp: /^(?=.*[A-Z])/, message: 'Password must contain at least one uppercase character!' },
            { validator: 'regexp', regexp: /^(?=.*[0-9])/, message: 'Password must contain at least one digit!' },
            { validator: 'regexp', regexp: /^([a-zA-Z0-9!@#\$%\^&*\(\)-+=\"\';:\/,.\~_-]){8,20}$/, message: 'Password length must be between 8 and 20!' }
        ],
        firstName:[
            { validator: 'notEmpty', message: 'You must enter you first name!' }
        ],
        lastName: [
            { validator: 'notEmpty', message: 'You must enter your last name!' }
        ]
    }
};