const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Chat = require('../models/Chat');
const Msg = require('../models/Msg');
const Product = require('../models/Product');
const User = require('../models/User');

router.get('/', async (req, res) => {
    let chats = await Chat.findAll({
        where: {
            [Op.or]: {
                buyerId: req.user.id,
                "$product.OwnerID$": req.user.id
            }
        },
        include: ['product', Msg, 'buyer'],
        order: [
            [Msg, 'createdAt', 'DESC']
        ]
    })
    res.render("inbox/index", { chats })
})


router.get('/new/:productId', async (req, res) => {
    let currentchat = {}
    let product = await Product.findByPk(req.params.productId)
    if (product === null || product.OwnerID == req.user.id) {
        return res.sendStatus(404)
    } else {
        currentchat = { name: product.Owner, product: product }
    }

    let chat = await Chat.findOne({ where: { buyerId: req.user.id, productId: req.params.productId } })
    if (chat) {
        return res.redirect(`/inbox/${chat.id}`)
    }

    let chats = await Chat.findAll({
        where: {
            [Op.or]: {
                buyerId: req.user.id,
                "$product.OwnerID$": req.user.id
            }
        },
        include: ['product', Msg, 'buyer'],
        order: [
            [Msg, 'createdAt', 'DESC']
        ]
    })
    res.render("inbox/index", { currentchat, chats })
})

router.post('/send', async (req, res) => {
    let { content, productId, chatId, offer } = req.body
    if (!offer) {
        offer = false
    }
    let chat
    console.log(req.body);

    let msg = await Msg.create({
        content: content,
        userId: req.user.id,
        offer: offer
    })

    if (chatId) {
        chat = await Chat.findByPk(chatId, { include: ['product', Msg, 'buyer'] })
        await chat.addMsg(msg)

    } else {
        let [chat, created] = await Chat.findOrCreate({
            where: {
                productId: productId,
                buyerId: req.user.id,

            }
        })
            .catch((error) => {
                console.error(error);
                flashMessage(res, 'danger', "Failed to send message")
            })
        await chat.addMsg(msg)
        chatId = chat.id
    }
    return res.json({ content, productId, chatId, userId: req.user.id, chat: await Chat.findByPk(chatId, { include: ['product', Msg, 'buyer'] }), offer })
})

router.post('/markasseen', async (req, res) => {
    let { chatId } = req.body
    let chat = await Msg.update({ seen: true }, { where: { seen: false, userId: { [Op.ne]: req.user.id }, chatId: chatId } })
    res.json({})
})

router.get('/:chatId', async (req, res) => {
    let chat = await Chat.findByPk(req.params.chatId, { include: "product" })
    if (chat === null) {
        return res.sendStatus(404)
    } else if (chat.buyerId != req.user.id && chat.product.OwnerID != req.user.id) {
        return res.sendStatus(404)
    }
    let chats = await Chat.findAll({
        where: {
            [Op.or]: {
                buyerId: req.user.id,
                "$product.OwnerID$": req.user.id
            }
        },
        include: ['product', Msg, 'buyer'],
        order: [
            [Msg, 'createdAt', 'DESC']
        ]
    })
    res.render("inbox/index", { chats })
})

router.post('/makeoffer', async (req, res) => {
    let { chatId, amt } = req.body
    let chat = await Chat.update({ offer: amt, status: "Offered" }, { where: { id: chatId } })
    res.json({})
})

router.post('/refuseoffer', async (req, res) => {
    let { chatId } = req.body
    let chat = await Chat.update({ status: "Refused Offer" }, { where: { id: chatId } })
    res.json({})
})

router.post('/acceptoffer', async (req, res) => {
    let { chatId } = req.body
    let chat = await Chat.update({ status: "Accepted Offer" }, { where: { id: chatId } })
    res.json({})
})

router.post('/counteroffer', async (req, res) => {
    let { chatId, amt } = req.body
    let chat = await Chat.update({ offer: amt, status: "Counter Offered" }, { where: { id: chatId } })
    res.json({})
})
module.exports = router