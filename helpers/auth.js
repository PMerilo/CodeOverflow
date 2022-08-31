const flashMessage = require('./messenger');

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    flashMessage(res, 'error', 'Please Login First!');
    res.redirect('/login');
};

module.exports = ensureAuthenticated;