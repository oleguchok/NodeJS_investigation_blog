const LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    configAuth = require('./auth'),
    DB = require('./constants'),
    UserBusiness = require('../business/UserBusiness'),
    _ = require('underscore');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use('local', new LocalStrategy((username, password, done) => {
        UserBusiness.getUserByCredentials(username, password)
            .then((user) => {
                if (!user) {
                    return done(null, false, { message: 'Incorrect username or password' });
                }

                global.User = {
                    id: user.UserID,
                    name: user.Name,
                    password: user.Password
                };

                return done(null, {
                    userId: user.UserID,
                    username: user.Name
                });

            }).catch((err) => {
                return done(err);
            });
    }));

    passport.authenticationMiddleware = (paths) => {        
        return function(req, res, next) {
            if (req.isAuthenticated() || _.contains(paths, req.path)) {                
                return next();
            }
            res.redirect('/');
        }
    };

    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL
    }, (token, refreshToken, profile, done) => {
        process.nextTick(() => {
            UsersBusiness.getUserByFacebookId(profile.id).spread((result, metadata) => {
                if (result.length === 1) {
                    return done(null, {
                        userId: result[0].userId,
                        username: result[0].username
                    });
                } else {
                    UsersBusiness.addNewFacebookUser(profile.id);
                    return done(null, { facebookId: profile.id });
                }
            })
        });
    }));
}