let empleadoRegistrado = false

async function cargarOpcionesEmpleado(url, idSelect, campoId, campoTexto) {
    const select = document.getElementById(idSelect)
    try {
        const resultado = await llamarApi(url)
        const datos = Array.isArray(resultado) ? resultado : resultado.data || []

        select.innerHTML = '<option value="">Seleccionar</option>'

        datos.forEach(item => {
            const opcion = document.createElement('option')
            opcion.value = item[campoId]
            opcion.textContent = item[campoTexto]
            select.appendChild(opcion)
        })
    } catch (error) {
        console.error(`Error al cargar ${idSelect}:`, error)
        select.innerHTML = '<option value="">No disponible</option>'
    }
}

// MOSTRAR MENSAJES
function mostrarMensajeEmpleado(mensaje, tipo = 'success') {
    const elemento = document.getElementById('mensajeEmpleado')

    elemento.textContent = mensaje
    elemento.className = `emp-mensaje ${tipo}`
}

// LIMPIAR MENSAJE
function limpiarMensajeEmpleado() {
    const elemento = document.getElementById('mensajeEmpleado')
    elemento.textContent = ''
    elemento.className = 'emp-mensaje'
}

// REGISTRAR EMPLEADO
async function guardarEmpleado(event) {
    event.preventDefault()

    const formulario = event.currentTarget
    const boton = document.getElementById('btnGuardarEmpleado')

    if (!formulario.reportValidity()) return

    const datos = Object.fromEntries(new FormData(formulario))

    // Convertir los campos numéricos y booleanos
    datos.idcargo = Number(datos.idcargo)
    datos.idsede = Number(datos.idsede)
    datos.estado = datos.estado === '1'

    try {
        boton.disabled = true
        boton.textContent = 'Guardando...'

        const resultado = await llamarApi('/api/empleados', 'POST', datos)

        mostrarMensajeEmpleado(
            resultado.message || 'Empleado registrado correctamente.'
        )

        formulario.reset()

    } catch (error) {
        console.error('Error al registrar empleado:', error)
        mostrarMensajeEmpleado(
            error.message || 'No se pudo registrar el empleado.',
            'error'
        )
    } finally {
        boton.disabled = false
        boton.textContent = 'Guardar empleado'
    }
}

// INICIAR MODULO DE EMPLEADOS
window.iniciarEmpleado = async function () {
    const formulario = document.getElementById('formEmpleado')

    if (!formulario) return

    formulario.addEventListener('submit', guardarEmpleado)
    formulario.addEventListener('reset', limpiarMensajeEmpleado)

    await Promise.all([
        cargarOpcionesEmpleado(
            '/api/cargos',
            'idcargo',
            'idcargo',
            'nombre_cargo'
        ),
        cargarOpcionesEmpleado(
            '/api/sedes',
            'idsede',
            'idsede',
            'nombre_sede'
        )
    ])
}
