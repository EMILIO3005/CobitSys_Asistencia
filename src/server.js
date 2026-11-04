require('dotenv').config()
require('./config/env')


const app = require('./app')
const db = require('./config/db')

const PORT = process.env.PORT || 3000

db.raw('select 1')
    .then(() => app.listen(PORT,
        () => console.log(`Servidor iniciado en http://localhost:${PORT}`)
    ))
    .catch((e) => console.error(`No se pudo realizar la conexion: ${e.message}`))