const express = require('express'),
    path = require('path'),
    passport = require('passport');

require('./config/passport')(passport);

const routes = require('./routes/routes')(passport),
    configAuth = require('./config/auth'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    morgan = require('morgan'),
    session = require('express-session');

const app = express();

// App configuration
app.set('port', (process.env.PORT || 3000));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// App middleware

if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "dist")));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: true, cookie: {}}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

// app.use((err, req, res, next) => {     res.status(err.status || 500);
// res.render('error', {         message: err.message,         error: err
// });     next(); });

module.exports = app;
