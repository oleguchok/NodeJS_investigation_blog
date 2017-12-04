const express = require('express'),
    router = express.Router(),
    PostBusiness = require('../business/PostBusiness');

module.exports = function (passport) {
    // serverErrorHandler
    router.use((req, res, next) => {
        if (global.serverError) {
            res.render('errorPage');
        } else {
            next();
        }
    });

    router.all('*', passport.authenticationMiddleware(['/', '/login']));

    router.get('/', (req, res) => {
        res.render('index');
    });

    router.get('/login', (req, res) => {
        res.render('login', { messages: req.flash('error') });
    });

    router.post('/login', passport.authenticate('local', {
        session: true,
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

    router.get('/profile', (req, res, next) => {
        console.time("Profile_Benchmark");
        PostBusiness
            .getProfileInfo()
            .then((profileInfo) => {
                res.render('profile', profileInfo);
                console.timeEnd("Profile_Benchmark");
            })
            .catch((err) => {
                console.log('GET profile error: ' + err);
                next(err);
            });

    });

    router.get('/profile/post/:id', (req, res, next) => {
        console.time("Post_Benchmark");
        PostBusiness
            .getPostById(req.params.id)
            .then((postInfo) => {
                res.render('post', postInfo);
                console.timeEnd("Post_Benchmark");
            })
            .catch((err) => {
                console.log('Get Profile/Post/:id error: ' + err);
                next(err);
            });
    });

    router.post('/profile/post/:id/newComment', (req, res) => {
        PostBusiness
            .addCommentToThePost(req.body.comment, req.query.ownerId, req.query.detailId)
            .then(() => {
                res.redirect('../' + req.params.id + '?userId=' + global.User.id);
            })
            .catch((err) => {
                console.log('Post Profile/Post/:id/newComment error: ' + err);
                next(err);
            })
    });

    router.post('/profile/post/:id/rate', (req, res) => {
        PostBusiness
            .setRateToThePost(req.body.rating, req.params.id, req.query.ownerId)
            .then(() => {
                res.redirect('../' + req.params.id + '?userId=' + global.User.id);
            })
            .catch((err) => {
                console.log('Post Profile/Post/:id/rate error: ' + err);
                next(err);
            });

    });

    router.get('/profile/newPost', (req, res) => {
        res.render('newPost');
    });

    router.post('/profile/newPost', (req, res, next) => {
        PostBusiness
            .addPost(req.body.title, req.body.content)
            .then(() => {
                res.redirect('/profile');
            })
            .catch((error) => {
                console.log('here');
                next(error);
            });
    });

    router.get('/login/facebook', passport.authenticate('facebook', {scope: 'email'}));

    router.get('/login/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    return router;
}
