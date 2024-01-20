const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function(req, res, next) {
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];
    let token = req.headers["authorization"];
    console.log(req);
    console.log(authHeader);
    console.log(token);

    if (token) {
        console.log(token);
        // Check if the token starts with "Bearer "
        if (token.startsWith("Bearer ")) {
            // Remove "Bearer " from the token
            token = token.slice(7);

            jwt.verify(token, config.secret, function(err, decoded) {
                if (err) {
                    console.error('JWT Verification Error:', err);
                    res.status(401).json({
                        success: false,
                        message: 'Invalid token format, unauthorized'
                    });
                } else {

                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        }
    } else {

        res.status(403).json({
            success: false,
            message: 'Token missing, access forbidden'
        });
    }
}