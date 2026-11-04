require('dotenv').config()

const path = require('path')
const express = require('express')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')

const routes = require('./routers')

const { apiLimiter} = require('./middlewares/rateLimit')
const { notFound, errorHandler } = require('./middlewares/errorHandler')

const app = express()
const isProd = process.env.NODE_ENV === 'production'

if (process.env.TRUST_PROXY)app.set('trust:proxy', Number(process.env.TRUST_PROXY))

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            'defaultSrc': ["'self'"],

            'styleSrc': [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.jsdelivr.net"
            ],

            'scriptSrc': [
                "'self'",
                "https://cdn.jsdelivr.net"
            ],

            'fontSrc': [
                "'self'",
                "https://cdn.jsdelivr.net",
                "data:"
            ],

            'connectSrc': [
                "'self'",
                "https://cdn.jsdelivr.net"
            ],

            'imgSrc': [
                "'self'",
                "data:",
                "https:"
            ],

            'upgradeInsecureRequests': isProd ? [] : null
        }
    }
}))

//CONFIGURACION DE EXPRESS
app.use(express.json({limit: '10kb'}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/api', apiLimiter, routes)

app.get('/', (req, res) => res.redirect('/index.html'))

//Manejo de rutas inexistentes
app.use('/api', notFound)
app.use(errorHandler)

module.exports = app