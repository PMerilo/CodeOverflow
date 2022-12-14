const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

const Product =  require('../models/Product')
const User = require('../models/User');
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated = require('../helpers/auth');
const googlelogin = require('../helpers/googlelogin');
googlelogin()
const fs = require('fs');
const upload = require('../helpers/productUpload');


router.get('/', async (req, res) => {
    res.render("index")
})

router.get('/products', async (req, res) => {
    res.render('index2')
})


router.get('/register', (req, res) => {
    res.render("user/register")
})

router.post('/register', async (req, res) => {
    let { name, email, phoneNumber, gender, password, password2 } = req.body
    let user = await User.findOne({ where: { email: email } })
    if (password !== password2) {
        flashMessage(res, 'error', 'Passwords do not match');
        res.render('user/register', { name, email, phoneNumber, gender })
    }
    else if (password.length < 8) {
        flashMessage(res, 'error', 'Passwords must be more than 8 characters');
        res.render('user/register', { name, email, phoneNumber, gender })
    }
    else if (user) {
        flashMessage(res, 'error', 'Account already registered');
        res.redirect('/login')
    }
    else {
        phoneNumber = phoneNumber ? phoneNumber : null;
        if (phoneNumber != null) {
            if (!(String(phoneNumber).startsWith("9") || String(phoneNumber).startsWith("8") || String(phoneNumber).startsWith("6") || String(phoneNumber).length == 8)) {
                flashMessage(res, 'error', 'Invalid phone number')
                res.render('user/register', { name, email, phoneNumber, gender })
            }
        }
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
        console.log(password)
        await User.create({
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            gender: gender,
            password: hash
        })
            .then((user) => {
                console.log("user created");
                flashMessage(res, 'success', 'Account created. You can now log in.');
                res.redirect('/login')
            })
            .catch(err => console.log(err));
    }
});

router.get('/login', (req, res) => {
    res.render("user/login")
});

router.post('/login', async (req, res, next) => {
    let { email, password } = req.body;
    let user = await User.findOne({ where: { email: email } });
    if (user == null || user == undefined) {
        flashMessage(res, 'error', 'No account found. Please register')
        res.redirect('/register')
    }
    else if (user.banned) {
        flashMessage(res, 'error', 'Account has been deactivated/banned')
        res.redirect('/')
    } else {
        passport.authenticate('local', {
            // Success redirect URL
            successRedirect: '/',
            // Failure redirect URL 
            failureRedirect: '/login',
            /* Setting the failureFlash option to true instructs Passport to flash 
            an error message using the message given by the strategy's verify callback.
            When a failure occur passport passes the message object as error */
            failureFlash: true
        })(req, res, next);
    }
});

router.get('/logout', (req, res, next) => {
    req.logout(next);
    res.redirect('/');
});
router.get('/login-google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/login-google/callback', 
  passport.authenticate('google', { failureRedirect: '/login',successRedirect: '/',failureFlash: true }))

router.get('/createListing', (req, res) => {
    res.render('addListing')
})

router.post('/getListing', async (req, res) => {
    var page = req.body.page
    if(page == undefined){
        page = 0
    }else{
        page = parseInt(page)
    }
    var products  = await Product.findAndCountAll({
        raw: true,
        limit: 5,
        offset: 5*page,
        where: {OwnerID: req.user.id}
    })
    res.send({
        products: products.rows
    })
})

router.get('/myListing', (req, res) => {
    console.log(req.user.id)
    res.render('myListing')
})

router.post('/createListing', (req, res) => {
    let {name, category, price, description, posterUpload} = req.body;
    Product.create({
        name,
        category,
        price,
        description,
        posterURL:posterUpload,
        quantity: 1,
        OwnerID: req.user.id,
        Owner: req.user.name,
        sold:0
    });
    res.redirect('/myListing');
});
router.post('/upload', ensureAuthenticated, (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/images/items/')) {
        fs.mkdirSync('./public/images/items/', { recursive: true });
    }
    upload(req, res, (err) => {
		console.log(req.file)
        // console.log(req.file)
        if (err) {
            // e.g. File too large
            res.json({ err: err });
        }
        else if (req.file == undefined) {
            res.json({});
        }
        else {
            res.json({ file: `/images/${req.file.originalname}` });
        }
    });
});

router.post('uploadsubmit', (req,res)=>{
	let image = req.body
	if (!fs.existsSync('./public/images/items/')){
		fs.mkdirSync('./public/images/items/', {recursive: true})
	}
})

router.get('/leaderboard', async (req, res) => {
    const first = await User.findAll({
        order: [['cf', 'DESC']],
        limit: 1,
    }).catch(err => console.log(err))
    const second = await User.findAll({
        order: [['cf', 'DESC']],
        limit: 1,
        offset: 1
    }).catch(err => console.log(err))
    const third = await User.findAll({
        order: [['cf', 'DESC']],
        limit: 1,
        offset: 2
    }).catch(err => console.log(err))
    const rest = await User.findAll({
        order: [['cf', 'DESC']],
        limit: 7,
        offset: 3
    }).catch(err => console.log(err))
    res.render('leaderboard', {first: first, second: second, third: third, rest: rest})
})

router.get('/currentUser', ensureAuthenticated, (req, res, next) => {
    let data
    if (req.isAuthenticated()) {
        data = {userId: req.user.id}
    }
    return res.json(data);
})
module.exports = router