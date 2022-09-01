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
const sequelize = require('sequelize');
const Wishlist = require('../models/Wishlist');
const op = sequelize.Op

router.post('/getProduct', async (req, res) => {
    var category = req.query.category
    if(category == undefined || category == "null"){
        category = ""
    }
    var sortby = req.body.sortby
    if(sortby == "Lowest To Highest"){
        sortby = [["price", 'ASC']]
    }else if(sortby == 'Most Recent'){
        sortby = [['sku', 'DESC']]
    }else if(sortby == 'Highest To Lowest'){
        sortby = [['price', 'DESC']]
    }else{
        sortby = [['sku', 'ASC']]
    }

    var page = req.body.page
    if(page == undefined){
        page = 0
    }else{
        page = parseInt(page)
    }
    var products  = await Product.findAndCountAll({
        where: {
            category: 
            {
                [op.like]:'%'+category+'%'
            },
            sold: { [op.ne]:  1 }
        },
        order: sortby,
        raw: true,
        limit: 5,
        offset: 5*page,
    })
    res.send({
        products: products.rows
    })
    
    
})

router.post('/totalPages', async (req, res) => {
    var products  = await Product.findAndCountAll({
        raw: true,
    })
    res.send({page: Math.ceil(products.count/4)})
})

router.get('/viewProduct/:id', async (req, res) => {
    var product = await Product.findByPk(req.params.id,
         {
            raw: true,
        });

    const wishlist = await Wishlist.findOne({where: {productSku: req.params.id, userId: req.user.id}})
    res.render('viewProduct', {product: product, wishlist: wishlist});
})

router.use(ensureAuthenticated)

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

router.get('/viewOneListing/:id', async (req, res) => {
    var product = await Product.findByPk(req.params.id, {raw: true})
    const wishlist = await Wishlist.findOne({where: {productSku: req.params.id, userId: req.user.id}})
    res.render('viewOneListing', {product: product, wishlist: wishlist})
})


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
    res.render('myListing')
})

router.post('/deleteListing/:id', async (req, res) => {
    ownerId = await Product.findByPk(req.params.id, {raw: true, attributes: ['OwnerID']});
    await Wishlist.destroy({where: {productSku: req.params.id}})
    if(req.user.id == ownerId.OwnerID){
        Product.destroy({where: {sku: req.params.id}})
        flashMessage(res, 'success', 'Listing has been deleted successfully')
    }
    res.redirect('/myListing')
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
        Owner: req.user.name
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

module.exports = router