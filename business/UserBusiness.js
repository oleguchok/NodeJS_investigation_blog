const Users = require('../models/').Users;

module.exports.getUserByCredentials = (username, password) => {
    return new Promise((resolve, reject) => {
        Users.findAll({
                where: {
                    Name: username,
                    Password: password
                }
            })
            .then((users) => {
                if (!users.length || users.length > 1) {
                    reject(users);
                } else {
                    resolve(users[0].get());
                }
            });
    });
};