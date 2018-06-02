module.exports = {
    forgetPasswordRule: {
        email: [
            {validator: 'notEmpty', message: 'Email address cannot be empty!'},
            {validator: 'email', message: 'Invalid email address!'},
            {validator: 'checkEmailInDb'}
        ]
    }
};