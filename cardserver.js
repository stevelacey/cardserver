#!/usr/bin/env node
const express = require('express')
const puppeteer = require('puppeteer')

const fs = require('fs')
const path = require('path')
const port = process.env.PORT || 9100
const width = 1200
const height = 630
const maxage = 60 * 60 * 24 * 7
const storage = './storage';

const card = async (req, res) => {
    const host = req.hostname.replace('cards.', '')
    const url = `${req.protocol}://${host}/${req.params[0]}`

    const imagePath = `${storage}/${host}/${req.params[0]}.png`
    const imageExpired = !fs.existsSync(imagePath) || Date.parse(fs.statSync(imagePath).mtime) < new Date - maxage * 1000

    console.log(url)

    const image = await (async () => {
        if (!imageExpired) {
            return fs.readFileSync(imagePath)
        }

        if (!fs.existsSync(path.dirname(imagePath))) {
            fs.mkdirSync(path.dirname(imagePath), { recursive: true })
        }

        const browser = await puppeteer.launch({ args: [ '--no-sandbox', `--window-size=${width},${height}` ] })
        const page = await browser.newPage()
        await page.setViewport({ width: 1200, height: 630 })
        const result = await page.goto(url)
        const status = result.status()

        res.status(status)

        if (!result.ok()) {
            return res.send()
        }

        const screenshot = await page.screenshot({ path: imagePath })

        await browser.close()

        return screenshot
    })()

    res.header('Cache-Control', 'public, max-age=' + maxage)
    res.header('Content-Type', 'image/png')
    res.header('Expires', new Date(Date.now() + maxage * 1000).toUTCString())

    return res.send(image)
}

const app = express()

app.enable('trust proxy')
app.get(/^\/(.*)\.png$/, card)

if (app.listen(port)) {
    console.log('Card server started on port ' + port)
} else {
    console.log('Error starting card server on port ' + port)
}
