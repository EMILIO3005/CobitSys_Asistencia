
let intervaloReloj = null
window.iniciarAsistencia = async function () {

    // ELEMENTOS DEL HTML
    const nombreUsuario = document.getElementById('nombreUsuario')
    const rolUsuario = document.getElementById('rolUsuario')
    const fechaActual = document.getElementById('fechaActual')
    const hora = document.getElementById('hora')
    const estadoAsistencia = document.getElementById('estadoAsistencia')
    const btnRegistrar = document.getElementById('btnRegistrar')

    const horas = {
        entrada: document.getElementById('horaEntrada'),
        inicio_ref: document.getElementById('horaInicioRef'),
        fin_ref: document.getElementById('horaFinRef'),
        salida: document.getElementById('horaSalida')
    }

    // CONFIGURACIÓN DE MARCACIONES
    const tipos = {
        entrada: {
            siguiente: 'inicio_ref',
            texto: 'Registrar entrada'
        },
        inicio_ref: {
            siguiente: 'fin_ref',
            texto: 'Iniciar refrigerio'
        },
        fin_ref: {
            siguiente: 'salida',
            texto: 'Finalizar refrigerio'
        },
        salida: {
            siguiente: null,
            texto: 'Registrar salida'
        }
    }

    let marcacionActual = null

    // FORMATO DE HORA
    function obtenerHora(hora) {
        if (!hora) return 'Pendiente'
        return String(hora).substring(0, 8)
    }

    // RELOJ EN TIEMPO REAL
    function actualizarReloj() {
        const ahora = new Date()

        fechaActual.textContent = ahora.toLocaleDateString('es-PE', {
            timeZone: 'America/Lima',
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })

        hora.textContent = ahora.toLocaleTimeString('es-PE', {
            timeZone: 'America/Lima',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        })
    }

    actualizarReloj()

    if (intervaloReloj) {clearInterval(intervaloReloj)}

    intervaloReloj = setInterval(actualizarReloj, 1000)

    // LLAMAR API
    async function llamarApi(url, metodo = 'GET', datos = null) {
        const opciones = {
            method: metodo,
            headers: {'Content-Type': 'application/json'},
            credentials: 'same-origin'
        }
        if (datos) { opciones.body = JSON.stringify(datos) }

        const respuesta = await fetch(url, opciones)
        const resultado = await respuesta.json()

        if (!respuesta.ok) { throw new Error(resultado.message || 'Error al comunicarse con el servidor') }
        return resultado
    }

    // CARGAR INFORMACIÓN DEL USUARIO
    async function cargarUsuario() {
        try {
            const datos = await llamarApi('/api/auth/me')
            // Admite las estructuras habituales de respuesta
            const usuario = datos.usuario || datos.yo || datos
            nombreUsuario.textContent =
                `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim()
            rolUsuario.textContent = usuario.nivel_acceso || ''
        } catch (error) {
            console.error('Error al cargar usuario:', error)
            nombreUsuario.textContent = 'No se pudo cargar el usuario'
        }
    }

    // MOSTRAR MARCACIONES
    function mostrarMarcaciones(marcacion) {
        marcacionActual = marcacion
        Object.keys(horas).forEach(tipo => {
            horas[tipo].textContent = obtenerHora(marcacion?.[tipo])
        })
        actualizarEstado()
    }

    // DETERMINAR SIGUIENTE MARCACIÓN
    function obtenerSiguienteMarcacion() {
        if (!marcacionActual || !marcacionActual.entrada) { return 'entrada' }
        if (!marcacionActual.inicio_ref) { return 'inicio_ref' }
        if (!marcacionActual.fin_ref) {  return 'fin_ref' }
        if (!marcacionActual.salida) {  return 'salida' }
        return null
    }

    // ACTUALIZAR ESTADO Y BOTÓN
    function actualizarEstado() {
        const siguiente = obtenerSiguienteMarcacion()
        if (!siguiente) {
            estadoAsistencia.textContent = 'Jornada finalizada'
            btnRegistrar.textContent = 'Asistencia completada'
            btnRegistrar.disabled = true
            return
        }

        if (!marcacionActual) {
            estadoAsistencia.textContent = 'Aún sin marcar hoy'
        } else {
            estadoAsistencia.textContent = 'Asistencia en curso'
        }

        btnRegistrar.textContent = tipos[siguiente].texto
        btnRegistrar.disabled = false
    }

    // CONSULTAR ASISTENCIA DEL DÍA
    async function cargarAsistencia() {

        try {
            const datos = await llamarApi('/api/marcaciones/hoy')

            mostrarMarcaciones(datos.marcacion)

        } catch (error) {
            console.error('Error al consultar asistencia:', error)

            estadoAsistencia.textContent = error.message
            btnRegistrar.disabled = true
        }
    }

async function cargarListaAsistencias() {
    const lista = document.getElementById('listaAsistencias')
    const cantidad = document.getElementById('cantidadEmpleados')
    const plantilla = document.getElementById('plantillaEmpleado')

    try {
        const marcaciones = await llamarApi('/api/marcaciones')
        const partes = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Lima',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(new Date())
        const valor = tipo => partes.find(p => p.type === tipo).value
        const fechaHoy = `${valor('year')}-${valor('month')}-${valor('day')}`
        // Normalizar fecha recibida desde MySQL
        function normalizarFecha(fecha) {
            if (fecha instanceof Date) {
                return new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'America/Lima',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).format(fecha)
            }
            return String(fecha).substring(0, 10)
        }

        // Filtrar marcaciones del día
        const asistenciasHoy = marcaciones.filter(m =>
            normalizarFecha(m.fecha) === fechaHoy
        )
        // Actualizar contador
        cantidad.textContent = asistenciasHoy.length
        // Limpiar tarjetas anteriores
        lista.replaceChildren()

        // Si no existen registros
        if (asistenciasHoy.length === 0) {
            lista.textContent = 'No hay asistencias registradas hoy.'
            return
        }
        // Generar tarjetas
        asistenciasHoy.forEach(m => {
            const tarjeta = plantilla.content.cloneNode(true)
            const campos = {
                nombre: `${m.nombres || ''} ${m.apellidos || ''}`.trim(),
                cargo: m.nombre_cargo || 'Sin cargo asignado',
                fecha: normalizarFecha(m.fecha),
                entrada: obtenerHora(m.entrada),
                inicio_ref: obtenerHora(m.inicio_ref),
                fin_ref: obtenerHora(m.fin_ref),
                salida: obtenerHora(m.salida)
            }
            // Asignar información a la plantilla
            Object.entries(campos).forEach(([campo, valor]) => {
                const elemento = tarjeta.querySelector( `[data-campo="${campo}"]` )
                if (elemento) { elemento.textContent = valor }
            })
            lista.appendChild(tarjeta)
        })
    } catch (error) {
        console.error('Error al cargar asistencias:', error)
        cantidad.textContent = '0'
        lista.textContent = 'No se pudieron cargar las asistencias.'
    }
}


    // REGISTRAR MARCACIÓN
    async function registrarMarcacion() {
        const tipo = obtenerSiguienteMarcacion()
        if (!tipo) return
        btnRegistrar.disabled = true

        try {
            const resultado = await llamarApi(
                '/api/marcaciones',
                'POST',
                { tipo }
            )
            alert(resultado.message)
            // Volver a consultar los datos del servidor
            await cargarAsistencia()
        } catch (error) {
            alert(error.message)
            btnRegistrar.disabled = false

        }
    }

    // EVENTO DEL BOTÓN
    btnRegistrar.addEventListener('click', registrarMarcacion)

    // INICIALIZAR PANTALLA
    await cargarUsuario()
    await cargarAsistencia()
    await cargarListaAsistencias()
}
