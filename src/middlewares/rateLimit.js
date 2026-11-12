const rateLimit = require('express-rate-limit');

exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente después de 15 minutos.' }
})

exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente después de 15 minutos.' }
})