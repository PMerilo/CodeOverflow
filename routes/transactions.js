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
const Cart = require('../models/Cart');
const CartProduct = require('../models/CartProduct');

router.get('/', async (req, res) => {
    res.render("index")
})

router.get('/cart', ensureAuthenticated, async (req, res) => {
    cartproducts = (await Cart.findOne({ where: { id: req.user.id }, include: Product, nested: true }))
    res.render("shoppingCart.handlebars", { cartproducts })
})

router.post('/addtoCart', ensureAuthenticated, async (req, res) => {
    var sku = req.body.sku;
    console.log(sku)
    purchasedProduct = await Product.findOne({ where: { sku: req.body.sku } })
    if (purchasedProduct.quantity > 0) {
        try {
            let [cart, cartStatus] = await Cart.findOrCreate({
                where: {
                    userId: req.user.id
                },
                defaults: {
                    id: req.user.id
                }
            })
            await CartProduct.findOrCreate({
                where: {
                    cartId: cart.id,
                    productSku: sku
                },
                defaults: {
                    qtyPurchased: 0
                }
            })
            await CartProduct.increment({ qtyPurchased: 1 }, { where: { cartId: cart.id, productSku: sku } })
        } catch (e) {
            console.log(e)
            res.redirect("/")
        }
    } else {
        flashMessage(res, "danger", req.body.name + ' is Out of Stock');
        res.redirect("/")
    }
})

router.post('/updateCart', ensureAuthenticated, async (req, res) => {
    var quantity = req.body.quantity
    var sku = req.body.sku
    console.log(quantity)
    cartProduct = await CartProduct.findOne({ where: { cartId: req.user.id, productSku: sku } })
    product = await Product.findOne({ where: { sku: sku } })
    productQuantity = cartProduct.qtyPurchased
    console.log(productQuantity)
    if (parseInt(quantity) <= 0) {
        quantity = 1
        console.log(quantity)
    }
    if (parseInt(product.quantity) == 0) {
        await CartProduct.destroy({ where: { cartId: req.user.id, productSku: sku } })
        flashMessage(res, 'error', product.name + 'is out of stock!')
    } else {
        CartProduct.update({ qtyPurchased: quantity }, { where: { cartId: req.user.id, productSku: sku } })
    }
})

router.post('/deleteitem/:sku', ensureAuthenticated, async (req, res) => {
    await CartProduct.destroy({ where: { cartId: req.user.id, productSku: req.params.sku } })
    res.redirect('/cart')
})

router.post('/deletecart', ensureAuthenticated, async (req, res) => {
    var ownerID = req.user.id
    await Cart.destroy({ where: { id: ownerID } })
    res.redirect('/cart')
})
module.exports = router