let empleados = []
let idEmpleadoEditando = null

function mostrarMensajeEmpleado(mensaje, tipo = 'success') {
    const contenedor = document.getElementById('mensajeEmpleado')
    contenedor.textContent = mensaje
    contenedor.className = `emp-mensaje ${tipo}`
    contenedor.style.display = 'block'
}

// CARGAR OPCIONES DE LOS SELECT
async function cargarOpcionesEmpleado(url, idSelect, campoId, campoTexto) {
    const select = document.getElementById(idSelect)
    try {
        const respuesta = await llamarApi(url)
        const datos = Array.isArray(respuesta) ? respuesta : respuesta.data

        select.innerHTML = '<option value="">Seleccione</option>'
        datos.forEach(item => {
            const opcion = document.createElement('option')
            opcion.value = item[campoId]
            opcion.textContent = item[campoTexto]
            select.appendChild(opcion)
        })
    } catch (error) {
        mostrarMensajeEmpleado(`Error al cargar opciones: ${error.message}`, 'error')
    }
}

// LISTAR EMPLEADOS
async function cargarEmpleados() {
    const cuerpo = document.getElementById('cuerpoEmpleados')
    try {
        const respuesta = await llamarApi('/api/empleados')
        empleados = Array.isArray(respuesta) ? respuesta : respuesta.data
        cuerpo.innerHTML = ''
        if (!empleados?.length) {
            cuerpo.innerHTML = `
                <tr>
                    <td colspan="7">No hay empleados registrados.</td>
                </tr>`
            return
        }

        empleados.forEach(empleado => {
            const fila = document.createElement('tr')
            const valores = [
                `${empleado.apellidos} ${empleado.nombres}`,
                empleado.numdoc,
                empleado.nombre_usuario,
                empleado.nombre_cargo,
                empleado.nombre_sede,
                Number(empleado.estado) === 1 ? 'Vigente' : 'Inactivo'
            ]
            valores.forEach(valor => {
                const celda = document.createElement('td')
                celda.textContent = valor ?? '-'
                fila.appendChild(celda)
            })

            const acciones = document.createElement('td')
            const btnEditar = document.createElement('button')
            btnEditar.type = 'button'
            btnEditar.textContent = 'Editar'
            btnEditar.className = 'emp-btn emp-btn-light'
            btnEditar.addEventListener('click', () => editarEmpleado(empleado.idcontrato))
            const btnEliminar = document.createElement('button')
            btnEliminar.type = 'button'
            btnEliminar.textContent = 'Eliminar'
            btnEliminar.className = 'emp-btn emp-btn-danger'
            btnEliminar.addEventListener('click', () => eliminarEmpleado(empleado.idcontrato))

            acciones.append(btnEditar, btnEliminar)
            fila.appendChild(acciones)
            cuerpo.appendChild(fila)
        })
    } catch (error) {
        cuerpo.innerHTML = `
            <tr>
                <td colspan="7">Error al cargar empleados: ${error.message}</td>
            </tr>`
    }
}

// REGISTRAR O ACTUALIZAR
async function guardarEmpleado(event) {
    event.preventDefault()
    const formulario = document.getElementById('formEmpleado')
    if (!formulario.reportValidity()) return
    const editando = idEmpleadoEditando !== null
    const boton = document.getElementById('btnGuardarEmpleado')
    const datos = Object.fromEntries(new FormData(formulario))

    datos.idcargo = Number(datos.idcargo)
    datos.idsede = Number(datos.idsede)
    datos.estado = datos.estado === '1'

    const url = editando
        ? `/api/empleados/${idEmpleadoEditando}`
        : '/api/empleados'

    try {
        boton.disabled = true
        boton.textContent = editando ? 'Actualizando...' : 'Guardando...'
        const respuesta = await llamarApi(url, editando ? 'PUT' : 'POST', datos)

        mostrarMensajeEmpleado(
            respuesta.message || (editando
                ? 'Empleado actualizado correctamente.'
                : 'Empleado registrado correctamente.')
        )

        limpiarFormularioEmpleado()
        await cargarEmpleados()

    } catch (error) {
        mostrarMensajeEmpleado(error.message, 'error')
    } finally {
        boton.disabled = false
        boton.textContent = idEmpleadoEditando !== null
            ? 'Actualizar empleado'
            : 'Guardar empleado'
    }
}

// EDITAR EMPLEADO
async function editarEmpleado(id) {
    try {
        const respuesta = await llamarApi(`/api/empleados/${id}`)
        const empleado = respuesta.data || respuesta

        idEmpleadoEditando = id

        const formulario = document.getElementById('formEmpleado')
        Object.keys(empleado).forEach(campo => {
            const elemento = formulario.elements[campo]

            if (elemento && empleado[campo] !== null) {
                elemento.value = empleado[campo]
            }
        })

        // La contraseña no se modifica si queda vacía
        formulario.elements.clave_acceso.value = ''
        formulario.elements.clave_acceso.required = false

        document.querySelector('.emp-title').textContent = 'Editar empleado'
        document.getElementById('btnGuardarEmpleado').textContent = 'Actualizar empleado'

        document.getElementById('mensajeEmpleado').style.display = 'none'

        formulario.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })

    } catch (error) {
        mostrarMensajeEmpleado(error.message, 'error')
    }
}

// ELIMINAR EMPLEADO
async function eliminarEmpleado(id) {
    const confirmar = confirm('¿Estás seguro de eliminar este empleado?')

    if (!confirmar) return

    try {
        const respuesta = await llamarApi(`/api/empleados/${id}`, 'DELETE')
        mostrarMensajeEmpleado(
            respuesta.message || 'Empleado eliminado correctamente.'
        )
        await cargarEmpleados()
    } catch (error) {
        mostrarMensajeEmpleado(error.message, 'error')
    }
}
// LIMPIAR FORMULARIO
function limpiarFormularioEmpleado() {
    const formulario = document.getElementById('formEmpleado')
    formulario.reset()
    idEmpleadoEditando = null

    formulario.elements.clave_acceso.required = true
    document.querySelector('.emp-title').textContent = 'Registrar empleado'
    document.getElementById('btnGuardarEmpleado').textContent = 'Guardar empleado'
}

// INICIALIZAR MÓDULO
window.iniciarEmpleado = async function () {
    const formulario = document.getElementById('formEmpleado')

    formulario.addEventListener('submit', guardarEmpleado)
    formulario.addEventListener('reset', () => {
        idEmpleadoEditando = null
        formulario.elements.clave_acceso.required = true
        document.querySelector('.emp-title').textContent = 'Registrar empleado'
        document.getElementById('btnGuardarEmpleado').textContent = 'Guardar empleado'
    })

    await Promise.all([
        cargarOpcionesEmpleado('/api/cargos', 'idcargo', 'idcargo', 'nombre_cargo'),
        cargarOpcionesEmpleado('/api/sedes', 'idsede', 'idsede', 'nombre_sede'),
        cargarEmpleados()
    ])
}
