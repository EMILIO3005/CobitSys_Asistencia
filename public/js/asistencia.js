
window.iniciarAsistencia = async function () {
    console.log('Módulo de asistencia iniciado')

    iniciarReloj()

    await cargarDatosAsistencia()
}

async function cargarDatosAsistencia() {
    console.log('Cargando datos de asistencia...')

    const usuario = window.usuarioActual

    if (!usuario) {
        console.error('No se encontraron los datos del usuario')
        return
    }

    // Datos del usuario autenticado
    document.getElementById('nombreUsuario').textContent =
        `${usuario.nombres} ${usuario.apellidos}`

    document.getElementById('rolUsuario').textContent =
        usuario.nivel_acceso

    // Inicializar la vista de marcaciones
    await actualizarVista()
}


// ============================================
// RELOJ Y FECHA
// ============================================

let intervaloReloj = null

function iniciarReloj() {
    const fechaElemento = document.getElementById('fechaActual')
    const horaElemento = document.getElementById('hora')

    // Evitar crear varios intervalos
    if (intervaloReloj) {
        clearInterval(intervaloReloj)
    }

    function actualizarFechaHora() {
        const ahora = new Date()

        fechaElemento.textContent = ahora.toLocaleDateString('es-PE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })

        horaElemento.textContent = ahora.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        })
    }

    actualizarFechaHora()

    intervaloReloj = setInterval(actualizarFechaHora, 1000)
}


async function actualizarVista() {
    const estado = document.getElementById('estadoAsistencia')

    // Por ahora no existen marcaciones cargadas.
    // Este estado cambiará cuando conectemos la API.
    estado.textContent = 'Aún sin marcar hoy'
}
