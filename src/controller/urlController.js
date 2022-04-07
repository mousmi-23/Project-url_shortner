const urlModel = require("../model/urlModel")
const shortid = require('shortid')
const redisService = require('../redis/redisService')
const { worker } = require("shortid");


const isValid = function (value) {
    if (typeof value == 'undefined' || value == 'null') return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}


const createShortUrl = async function (req, res) {
    try {
        data = req.body
        const longUrl = data.longUrl
        const baseUrl = 'http://localhost:3000'

        let keys = Object.keys(data)
        if (keys.length == 0) {
            return res.status(400).send({ status: false, message: "Please put some data in the body" })
        }

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "Please put the longUrl" })
        }

        if (!(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(longUrl))) {
            return res.status(400).send({ status: false, message: "Please enter a valid URL" })
        }

        if (keys.length > 0) {
            if (!(keys.length == 1 && keys == 'longUrl')) {
                return res.status(400).send({ status: false, message: "Only longUrl field is allowed" })
            }
        }

        let cachedData = await redisService.GET_ASYNC(`${longUrl}`)
        if (cachedData) {
            console.log("redis work...")
            return res.status(200).send({ status: true, message: "Success [Redis]", data: JSON.parse(cachedData) })
        }
        else {
            const findUrl = await urlModel.findOne({ longUrl: longUrl })
            if (findUrl) {
                const checkUrl = {
                    longUrl: findUrl.longUrl,
                    shortUrl: findUrl.shortUrl,
                    urlCode: findUrl.urlCode
                }
                console.log("mondoDB Data...")
                return res.status(201).send({ status: true, message: "Success [MondoDB]", data: checkUrl })
            }
            else {

                let urlCode = shortid.generate().toLowerCase()

                const shortUrl = baseUrl + '/' + urlCode
                data.shortUrl = shortUrl
                data.urlCode = urlCode

                const createUrl = await urlModel.create(data)

                const urlData = {
                    longUrl: longUrl,
                    shortUrl: shortUrl,
                    urlCode: urlCode
                }

                await redisService.SET_ASYNC(`${urlData.longUrl}`, JSON.stringify(urlData), 'EX', 60 * 60 * 24)
                await redisService.SET_ASYNC(`${urlData.urlCode}`, urlData.longUrl, 'EX', 60 * 60 * 24)
                console.log("mondoDB work...")
                return res.status(201).send({ status: true, message: "Success [MongoDB]", data: urlData })
            }
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: 'Server Error' })
    }

}


let getUrlcode = async function (req, res) {
    try {
        const urlCode = req.params.urlCode;

        if (urlCode.length != 9) {
            return res.status(400).send({ status: false, message: "Please enter a valid urlCode !" });
        }
        const getRedisRes = await redisService.GET_ASYNC(urlCode);
        if (getRedisRes) {
            console.log("redis work...")
            return res.redirect(301, getRedisRes);
        }
        const urlRes = await urlModel.findOne({ urlCode: urlCode })
        console.log(urlRes)
        if (!urlRes) {
            return res.status(404).send({ status: false, message: "URL not found" })
        }
        console.log("mongoDB work...")
        let url = urlRes.longUrl
        return res.status(301).redirect(url)

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = {
    createShortUrl,
    getUrlcode
}