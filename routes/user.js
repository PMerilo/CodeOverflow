const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const ensureAuthenticated = require('../helpers/auth');
const fs = require('fs');
const upload = require('../helpers/imageUpload');
const User = require('../models/User');
const bcrypt = require('bcryptjs')

router.get('/profile/:id', ensureAuthenticated, async (req, res) => {
    user = await User.findByPk(req.params.id)
    const belong = req.params.id == req.user.id
    if (user) {
        res.render("user/profile", {user, belong})
    } else {
        flashMessage(res, 'error', 'No profile found')
        res.redirect('/')
    }
    
})

router.get('/account', ensureAuthenticated, async (req, res) => {
    user = await User.findByPk(req.user.id)
    res.render("user/myAccount", {user})
})

router.post('/account', ensureAuthenticated, async (req, res) => {
    User.destroy({where: {id: req.user.id}})
    flashMessage(res, 'success', 'Account successfully deleted.');
    res.redirect('/logout')
})

router.get('/editAccount', ensureAuthenticated, async (req, res) => {
    user = await User.findByPk(req.user.id)
    res.render("user/editAccount", {user})
})

router.post('/editAccount', ensureAuthenticated, async (req, res) => {
    let {pfpURL, name, email1, phoneNumber, gender} = req.body
    if (phoneNumber == '' || phoneNumber == NaN || phoneNumber == null) {
        phoneNumber = null
    } else {
        phoneNumber = parseInt(phoneNumber)
    }
    if (!pfpURL) {
        await User.update({
            name: name,
            email: email1,
            phoneNumber: phoneNumber,
            gender: gender,
        },
        {where: {id: req.user.id}}
        ).then((user) => {
            flashMessage(res, 'success', 'Your information has been updated')
            res.redirect('/user/account')
        })
        .catch(err => console.log(err))
    } else {
        await User.update({
            name: name,
            email: email1,
            phoneNumber: phoneNumber,
            gender: gender,
            profilepic: pfpURL,
        },
        {where: {id: req.user.id}}).then((user) => {
            flashMessage(res, 'success', 'Your information has been updated')
            res.redirect('/user/account')
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

router.get('/changePassword', ensureAuthenticated, async (req, res) => {
    user = await User.findByPk(req.user.id)
    res.render("user/changePassword", {user})
})

router.post('/changePassword', ensureAuthenticated, async (req, res) => {
    user = await User.findByPk(req.user.id)
    let { oldpassword, newpassword, newpassword2 } = req.body;
    const validPassword = await bcrypt.compare(oldpassword, user.password);
    if (!validPassword) {
        flashMessage(res, 'error', 'Incorrect password');
        res.redirect('/user/changePassword')
    }
    else if (newpassword.length < 8) {
        flashMessage(res, 'error', 'Password must be at least 8 characters');
        res.redirect('/user/changePassword')
    }
    else if (newpassword2 != newpassword) {
        flashMessage(res, 'error', 'New passwords do not match');
        res.redirect('/user/changePassword')
    }
    else if (oldpassword == newpassword) {
        flashMessage(res, 'error', 'New and old passwords are the same');
        res.redirect('/user/changePassword')
    } else {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(newpassword, salt);
        await User.update(
            {password: hash},
            {where :{id: req.user.id}}
        ).then((user) => {
            flashMessage(res, 'success', 'Password has been changed');
            res.redirect(`/user/profile`);
        }).catch(err =>  console.log(err));
    }
})
module.exports = router