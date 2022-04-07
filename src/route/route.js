const express = require("express")
const router = express.Router()

const UrlController = require("../controller/urlController")


router.post('/url/shorten', UrlController.createShortUrl)

router.get('/:urlCode', UrlController.getUrlcode)


module.exports = router;