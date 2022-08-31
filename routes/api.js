const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Chat = require('../models/Chat');
const Msg = require('../models/Msg');
const Product = require('../models/Product');
const User = require('../models/User');

router.get('/product/:productId', async (req, res) => {
    let product = await Product.findByPk(req.params.productId)
    return res.json(product)
})

router.get('/chat/:chatId', async (req, res) => {
    let chat = await Chat.findByPk(req.params.chatId, {
        include: [
            Msg, 'product', 'buyer'
        ]
    })
    if (chat === null) {
        chat = {}
    }
    return res.json(chat)
})

router.get('/user/chats', async (req, res) => {
    let chats = await Chat.findAll({
        where: {
            [Op.or]: {
                buyerId: req.user.id,
                "$product.OwnerID$": req.user.id
            }
        },
        include: [
            Msg, 'product', 'buyer'
        ]
    })
    if (chats === null) {
        chats = []
    }
    return res.json(chats)
})

module.exports = router