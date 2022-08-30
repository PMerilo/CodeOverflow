const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Chat = require('../models/Chat');
const Msg = require('../models/Msg');

router.get('/', async (req, res) => {
    res.render("inbox/index")
})

router.get('/:chatId', async (req, res) => {
    res.render("inbox/index")
})

router.get('/new/:productId', async (req, res) => {
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
    return res.json({sent: true})
})


module.exports = router