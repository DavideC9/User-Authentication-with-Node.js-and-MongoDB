const destroySession = (req, res, next) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error while destroying the session'
                });
            }
            console.log('Session destroyed');
            next(); // Pass control to the next middleware
        });
    } else {
        console.log('No session available');
        next(); // Pass control to the next middleware
    }
};

module.exports = destroySession;