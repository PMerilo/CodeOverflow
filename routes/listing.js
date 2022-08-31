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

router.get('/editListing/:id', async (req, res) => {
    var product = await Product.findByPk(req.params.id, {raw: true});
    res.render('editListing', {product:product})
})

router.post('/editListing/:id', async (req, res) => {
    let { posterURL, name, description, price, category} = req.body;
    console.log(name)
    var product = await Product.findByPk(req.params.id, {raw: true});
    if(posterURL == ""){
        posterURL = product.posterURL
    }
    Product.update(
        {
            posterURL,
            name,
            description,
            category,
            price
        },
        {
            where: {sku: req.params.id}
        })
    res.redirect('/myListing')
})

router.post('/getCat/:id', async (req, res) => {
    var product = await Product.findByPk(req.params.id, {raw: true, attributes: ['category']});
    res.send(product)
})

module.exports = router