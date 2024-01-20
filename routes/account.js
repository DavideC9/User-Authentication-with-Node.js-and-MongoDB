const router = require('express').Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const config = require('../config');
const checkJWT = require('../middlewares/check-jwt');
const RefreshToken = require('../models/refreshtoken'); // Importa il modello RefreshToken
const { validateEmail, validatePassword } = require('../middlewares/verifySignUp');

router.post('/signup', async(req, res, next) => {
    let user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.password;
    user.picture = req.body.picture;
    user.isSeller = req.body.isSeller;

    try {
        validateEmail(req.body.email);
        validatePassword(req.body.password);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    User.findOne({ email: req.body.email })
        .then(async existingUser => {
            if (existingUser) {
                res.json({
                    success: false,
                    message: 'Account with that email already exists'
                });
            } else {
                await user.save();

                const expiresIn = '7d'; // Durata del token

                const accessToken = jwt.sign({ user: user }, config.secret, {
                    expiresIn: expiresIn
                });

                const refreshToken = jwt.sign({ userId: user._id }, config.refreshSecret, {
                    expiresIn: '7d'
                });


                var token = jwt.sign({
                    user: user
                }, config.secret, {
                    expiresIn: expiresIn
                });

                res.json({
                    success: true,
                    message: 'Enjoy your token',
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    userId: user._id,
                    expires: expiresIn // Aggiunto il campo expires con la durata del token
                });
            }
        })
        .catch(err => {
            // Handle errors here
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        });

    console.log(req.body);
});



router.post('/login', async(req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Authentication failed, User not found'
            });
        }

        const validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed. Wrong password'
            });
        }

        const token = jwt.sign({ user: user }, config.secret, {
            expiresIn: '10h'
        });

        const refreshToken = jwt.sign({ userId: user._id }, config.refreshSecret, {
            expiresIn: '14d'
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken: token,
            refreshToken: refreshToken,
            userId: user._id
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Rotta di logout
router.post('/logout', async(req, res, next) => {
    const userId = req.body.userId;
    const accessToken = req.headers.authorization; // Assuming the access token is in the request headers
    const refreshToken = req.body.refreshToken;
    console.log(req);

    try {
        // Check if the access token exists in the request header
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or missing access token in the request'
            });
        }

        // Extract the token without 'Bearer ' prefix
        const token = accessToken.split(' ')[1];

        // Verify if the token is valid
        const decoded = jwt.verify(token, config.secret); // Replace 'your_secret_key' with your actual secret key

        // Check if the user ID in the token matches the ID from the request body
        if (decoded && decoded.user._id === userId) {
            // Perform any necessary actions to invalidate the token or logout the user

            console.log('User logged out successfully');
            return res.status(200).json({
                success: true,
                message: 'User logged out successfully'
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
    } catch (err) {
        console.error(' errore', err);
        if (err.name === 'TokenExpiredError') {
            console.log(' errore111', err);

            // Token scaduto, restituisci un messaggio appropriato
            return res.status(400).json({
                success: false,
                message: "Token scaduto"
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error, unable to logout'
        });
    }
});

module.exports = router;