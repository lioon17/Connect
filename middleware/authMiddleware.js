function isAdmin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login?error=unauthorized'); // Redirect to login with error message
    }

    if (req.session.user.role !== 'admin') {
        return res.redirect('/home?error=noAccess'); // Redirect regular users to home
    }

    next(); // User is an admin, allow access
}

module.exports = isAdmin;
