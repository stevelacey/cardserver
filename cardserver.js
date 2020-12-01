#!/usr/bin/env node
const express = require('express')
const puppeteer = require('puppeteer')

const fs = require('fs')
const path = require('path')
const port = process.env.PORT || 9100
const width = 1200
const height = 630
const maxage = 60 * 60 * 24 * 7

;(async () => {
    const app = express()

    const browser = await puppeteer.launch({
        args: [
            '--disable-accelerated-2d-canvas',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            '--single-process',
        ],
        headless: true,
    })

    app.enable('trust proxy')

    app.get(/^\/(.*)\.png$/, async (req, res) => {
        const host = req.hostname.replace('cards.', '')
        const url = `${req.protocol}://${host}/${req.params[0]}`

        const imagePath = `/tmp/cards/${host}/${req.params[0].replace('cards/', '')}.png`
        const imageExpired = !fs.existsSync(imagePath) || Date.parse(fs.statSync(imagePath).mtime) < new Date - maxage * 1000

        console.log(url + '.png')

        let image

        if (imageExpired) {
            const page = await browser.newPage()

            await page.setViewport({ width, height })

            try {
                const result = await page.goto(url)

                await page.evaluateHandle('document.fonts.ready')

                if (result.ok()) {
                    fs.mkdirSync(path.dirname(imagePath), { recursive: true })
                    image = await page.screenshot({ path: imagePath })
                }

                res.status(result.status())
            } catch (err) {
                res.status(502)
            }

            page.close()
        } else {
            image = fs.readFileSync(imagePath)
        }

        if (image) {
            res.header('Cache-Control', 'public, max-age=' + maxage)
            res.header('Content-Type', 'image/png')
            res.header('Expires', new Date(Date.now() + maxage * 1000).toUTCString())
        }

        return res.send(image)
    })

    if (app.listen(port)) {
        console.log('Card server started on port ' + port)
    } else {
        console.log('Error starting card server on port ' + port)
    }

    process.on('exit', async () => {
        await browser.close()
    })
})()
