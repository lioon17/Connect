// middleware/auth.js
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user && req.session.user.id) {
        req.session.user_id = req.session.user.id; // Assign user_id for use in routes
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }
}


module.exports = isAuthenticated;


