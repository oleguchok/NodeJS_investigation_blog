const User = require('../models/').User;

module.exports = {
    getUsersByUsernameAndPassword: (username, password) => {
        return User.findAll({
            where: {
                Name: username,
                Password: password
            }
        });
    }
}