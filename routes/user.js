const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const ensureAuthenticated = require('../helpers/auth');
const fs = require('fs');
const upload = require('../helpers/imageUpload');
const User = require('../models/User');

router.get('/profile', ensureAuthenticated, async (req, res) => {
    user = await User.findByPk(req.user.id)
    res.render("user/profile", {user})
})

router.post('/profile', ensureAuthenticated, async (req, res) => {
    User.destroy({where: {id: req.user.id}})
    flashMessage(res, 'success', 'Account successfully deleted.');
    res.redirect('/logout')
})

router.get('/editProfile', ensureAuthenticated, async (req, res) => {
    res.render("user/editProfile")
})

router.post('/editProfile', ensureAuthenticated, async (req, res) => {
    let {pfpUrl, name, email1, phoneNumber, gender} = req.body
    if (phoneNumber == '' || phoneNumber == NaN) {
        phoneNumber = null
    } else {
        phoneNumber = parseInt(phoneNumber)
    }
    if (!pfpUrl) {
        await User.update({
            name: name,
            email: email1,
            phoneNumber: phoneNumber,
            gender: gender
        },
        {where: {id: req.user.id}}
        ).then((user) => {
            flashMessage(res, 'success', 'Your information has been updated')
            res.redirect('/user/profile')
        })
        .catch(err => console.log(err))
    } else {
        await User.update({
            profilepic: pfpUrl,
            name: name,
            email: email1,
            phoneNumber: parseInt(phoneNumber),
            gender: gender
        },
        {where: {id: req.user.id}}).then((user) => {
            flashMessage(res, 'success', 'Your information has been updated')
            res.redirect('/user/profile')
        })
        .catch(err => console.log(err))
    }
    

    
})

router.post('/upload', ensureAuthenticated, (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)) {
        fs.mkdirSync('./public/uploads/' + req.user.id, { recursive: true });
    }
    upload(req, res, (err) => {
        console.log(req.file.filename)
        if (err) {
        // e.g. File too large
        res.json({ file: '/img/no-image.jpg', err: err });
        }
        else {
        res.json({ file: `/uploads/${req.user.id}/${req.file.filename}` });
        }
    });
});
module.exports = router