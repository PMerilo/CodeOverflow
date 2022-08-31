const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Chat = require('../models/Chat');
const Msg = require('../models/Msg');
const Product = require('../models/Product');

router.get('/', async (req, res) => {
    res.render("inbox/index")
})


router.get('/new/:productId', async (req, res) => {
    let product = await Product.findByPk(req.params.productId)
    if (product === null) {
        return res.sendStatus(404)
    }

    let chat = await Chat.findOne({ where: { buyerId: req.user.id, productId: req.params.productId } })
    if (chat) {
        return res.redirect(`/${chat.id}`)
    }
    res.render("inbox/index")
})

router.post('/send', async (req, res) => {
    let { content, productId } = req.body
    let msg = await Msg.create({
        content: content,
        userId: userId,
    })
    await Chat.findOrCreate({
        where: {
            productId: productId,
            buyerId: req.user.id
        }
    }).then(([chat, created]) => {
        chat.addMsg(msg)
    }

    )
    return res.json({ sent: true })
})


router.get('/:chatId', async (req, res) => {
    res.render("inbox/index")
})
module.exports = router