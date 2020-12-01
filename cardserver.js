#!/usr/bin/env node
const express = require('express')
const puppeteer = require('puppeteer')

const fs = require('fs')
const path = require('path')
const port = process.env.PORT || 9100
const width = 1200
const height = 630
const maxage = 60 * 60 * 24 * 7

let chain = Promise.resolve()

const card = async (page, req, res) => {
    const host = req.hostname.replace('cards.', '')
    const url = `${req.protocol}://${host}/${req.params[0]}`

    chain = chain.then(async () => {
        const imagePath = `/tmp/cards/${host}/${req.params[0].replace('cards/', '')}.png`
        const imageExpired = !fs.existsSync(imagePath) || Date.parse(fs.statSync(imagePath).mtime) < new Date - maxage * 1000

        console.log(url + '.png')

        if (!imageExpired) {
            return serve(fs.readFileSync(imagePath), res)
        }

        if (!fs.existsSync(path.dirname(imagePath))) {
            fs.mkdirSync(path.dirname(imagePath), { recursive: true })
        }

        try {
            const result = await page.goto(url)

            await page.evaluateHandle('document.fonts.ready')

            if (!result.ok()) {
                res.status(result.status())
                return res.send()
            }

            const screenshot = await page.screenshot({ path: imagePath })

            serve(screenshot, res)
        } catch (err) {
            res.status(502)
            return res.send()
        }
    })
}

const serve = (image, res) => {
    res.header('Cache-Control', 'public, max-age=' + maxage)
    res.header('Content-Type', 'image/png')
    res.header('Expires', new Date(Date.now() + maxage * 1000).toUTCString())
    res.send(image)
}

(async () => {
    const app = express()
    const browser = await puppeteer.launch({ args: [ '--no-sandbox', `--window-size=${width},${height}` ] })
    const page = await browser.newPage()

    await page.setViewport({ width: 1200, height: 630 })

    app.enable('trust proxy')
    app.get(/^\/(.*)\.png$/, (req, res) => card(page, req, res))

    if (app.listen(port)) {
        console.log('Card server started on port ' + port)
    } else {
        console.log('Error starting card server on port ' + port)
    }

    process.on('exit', async () => {
        await browser.close()
    })
})()
