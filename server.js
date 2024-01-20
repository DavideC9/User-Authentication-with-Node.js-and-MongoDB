const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const session = require('express-session');
const destroySession = require('./middlewares/sessionMiddleware');

const config = require('./config');

const app = express();

mongoose.connect(config.database).then(() => {
    console.log('connect');
}).catch((err) => {
    console.log('failed', err);
})


//lezione 5 da settare mongodb

app.use(bodyParser.json()); //leggo i dati in uno specifico formato
app.use(bodyParser.urlencoded({ extemded: false }));
app.use(morgan('dev'));

app.use(cors({
    origin: 'http://localhost:4200'
}));


const userRoutes = require('./routes/account');
const mainRoutes = require('./routes/main');



app.use('/api', mainRoutes);
app.use('/api/accounts', userRoutes);

app.listen(config.port, err => {
    console.log('Server online on port' + ' ' + config.port);
});


const generateRandomString = (length) => {
    return crypto.randomBytes(length).toString('hex');
};

const randomString = generateRandomString(32); // Change the length as needed
console.log('Random String:', randomString);


app.use(session({
    secret: randomString, // Replace with a strong random string (used to sign the session ID cookie)
    resave: true,
    saveUninitialized: true
        // Add other configurations as needed
}));

var logout = function(req, res, next) {
    debug("logout()");
    req.session.loggedIn = false;
    res.redirect("/");
};

app.use("/api/accounts/logout", logout, userRoutes);