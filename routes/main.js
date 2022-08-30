const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

router.get('/', async (req, res) => {
    res.render("index")
})

module.exports = router