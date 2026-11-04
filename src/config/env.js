const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET']

const missing = required.filter((key) => !process.env[key])

if (missing.length) {
    console.error(`Faltan variables de entorno: ${missing.join(', ')}`)
    process.exit(1)
}


//Validacion de JWT Seguro
const secret = process.env.JWT_SECRET

if (secret.length < 32) {
    console.error('JWT_SECRET debe tener al menos 32 caracteres')
    process.exit(1)
}