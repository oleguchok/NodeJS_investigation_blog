const User = require('../models/').User;

function getUserByCredentials(username, password) {
    return new Promise((resolve, reject) => {
        User.findAll({
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

function getUserByFacebookId(id) {
    // blog.USERS.getUserByFacebookId = (id) => {   return dataBase(`SELECT
    // userID,Name, facebookId FROM Users WHERE facebookId='${id}'`); }
};

function addNewFacebookUser(facebookId) {
    // blog.USERS.addNewFacebookUser = (facebookId) => {   dataBase(`INSERT INTO
    // Users (facebookId) VALUES (${facebookId})`); }
};

module.exports = {
    addNewFacebookUser: addNewFacebookUser,
    getUserByFacebookId: getUserByFacebookId,
    getUserByCredentials: getUserByCredentials
}