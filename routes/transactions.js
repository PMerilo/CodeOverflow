const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Product =  require('../models/Product')
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated = require('../helpers/auth');
const fs = require('fs');
const upload = require('../helpers/productUpload');

router.get('/', async (req, res) => {
    res.render("index")
})


module.exports = router