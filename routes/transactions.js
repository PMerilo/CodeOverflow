const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Product = require('../models/Product')
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated = require('../helpers/auth');
const fs = require('fs');
const upload = require('../helpers/productUpload');
const Chat = require('../models/Chat');
const bodyParser = require('body-parser');
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const endpointSecret = process.env.WEBHOOK_SECRET;
const SERVER_URL = process.env.SERVER_URL
const stripe = require("stripe")(stripeSecretKey)
router.get('/', async (req, res) => {
    res.render("index")
})

const fulfillOrder = async (session) => {
    var userid = session.metadata.userId
    var chatid = session.metadata.chatId
    
    console.log("Payment Successful")
    // console.log("Fulfilling order", session)
};


router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        fulfillOrder(session)
    }
    res.status(200);
});


router.post('/payment', ensureAuthenticated, async (req, res) => {
    console.log(req.body.id)
    console.log(req.body.curl)
    var chat = await Chat.findAll({ where: { id: req.body.id }, include: "product" })
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: chat.map(item => {
                return {
                    price_data: {
                        currency: "sgd",
                        product_data: {
                            name: item.product.name,
                        },
                        unit_amount: item.offer * 100,
                    },
                    quantity: 1,
                }
            }),
            metadata: {
                userId: `${req.user.id}`,
                chatId: `${req.body.id}`,
                orderOwnerName: `${req.body.fname}`,
            },
            success_url: `http://localhost:5000${req.body.curl}`,
            cancel_url: `http://localhost:5000${req.body.curl}`,
        })
        res.json({ url: session.url })
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ error: e.message })
    }
})
module.exports = router