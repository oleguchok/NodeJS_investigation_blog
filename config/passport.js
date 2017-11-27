const LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    Model = require('../models/blog.model'),
    configAuth = require('./auth'),
    DB = require('./constants'),
    UsersBusiness = require('../business/UserBusiness');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use('local', new LocalStrategy((username, password, done) => {
        UsersBusiness.getUserByCredentials(username, password)
            .then((result) => {

                global.User = {
                    id: result[`${DB.columns.BLOG.USERS.USER_ID}`],
                    name: result[`${DB.columns.BLOG.USERS.NAME}`],
                    password: result[`${DB.columns.BLOG.USERS.PASSWORD}`]
                };

                return done(null, {
                    userId: result[`${DB.columns.BLOG.USERS.USER_ID}`],
                    username: result[`${DB.columns.BLOG.USERS.NAME}`]
                });

            }).catch(() => {
                return done(null, false); //Check done 1 argument
            });
    }));

    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL
    }, (token, refreshToken, profile, done) => {
        process.nextTick(() => {
            Model.USERS.getUserByFacebookId(profile.id).spread((result, metadata) => {
                if (result.length === 1) {
                    return done(null, {
                        userId: result[0].userId,
                        username: result[0].username
                    });
                } else {
                    Model.USERS.addNewFacebookUser(profile.id);
                    return done(null, { facebookId: profile.id });
                }
            })
        });
    }));
}