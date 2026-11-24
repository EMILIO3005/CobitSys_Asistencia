let empleados = []
let idEmpleadoEditando = null

function mostrarMensajeEmpleado(mensaje, tipo = 'success') {
    const contenedor = document.getElementById('mensajeEmpleado')
    contenedor.textContent = mensaje
    contenedor.className = `emp-mensaje ${tipo}`
    contenedor.style.display = 'block'
}

async function cargarOpcionesEmpleado(url, idSelect, campoId, campoTexto) {
    const select = document.getElementById(idSelect)
    try {
        const respuesta = await llamarApi(url)
        const datos = Array.isArray(respuesta) ? respuesta : respuesta.data

        select.innerHTML = ''

        const primeraOpcion = document.createElement('option')
        primeraOpcion.value = ''
        primeraOpcion.textContent = 'Seleccione'
        select.appendChild(primeraOpcion)

        datos.forEach(item => {
            const opcion = document.createElement('option')
            opcion.value = item[campoId]
            if (idSelect === 'idhorario') {
                opcion.textContent = `${item.dia} (${item.entrada} - ${item.salida})`
            } else {
                opcion.textContent = item[campoTexto]
            }
            select.appendChild(opcion)
        })
    } catch (error) {
        mostrarMensajeEmpleado(error.message, 'error')
    }
}

async function cargarEmpleados() {
    const cuerpo = document.getElementById('cuerpoEmpleados')
    try {
        const respuesta = await llamarApi('/api/empleados')
        empleados = Array.isArray(respuesta) ? respuesta : respuesta.data
        cuerpo.innerHTML = ''
        if (!empleados || empleados.length === 0) {
            const fila = document.createElement('tr')
            const celda = document.createElement('td')

            celda.colSpan = 7
            celda.textContent = 'No hay empleados registrados.'

            fila.appendChild(celda)
            cuerpo.appendChild(fila)
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
                Number(empleado.estado) === 1 ? 'Activo' : 'Inactivo'
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
            btnEditar.addEventListener('click', function () { editarEmpleado(empleado.idcontrato) })

            const btnEliminar = document.createElement('button')
            btnEliminar.type = 'button'
            btnEliminar.textContent = 'Eliminar'
            btnEliminar.className = 'emp-btn emp-btn-danger'
            btnEliminar.addEventListener('click', function () { eliminarEmpleado(empleado.idcontrato) })

            acciones.appendChild(btnEditar)
            acciones.appendChild(btnEliminar)

            fila.appendChild(acciones)
            cuerpo.appendChild(fila)
        })
    } catch (error) {
        cuerpo.innerHTML = ''
        const fila = document.createElement('tr')
        const celda = document.createElement('td')

        celda.colSpan = 7
        celda.textContent = `Error al cargar empleados: ${error.message}`

        fila.appendChild(celda)
        cuerpo.appendChild(fila)
    }
}

function nuevoEmpleado() {
    const dialogo = document.getElementById('dialogEmpleados')

    limpiarFormularioEmpleado()

    document.querySelector('#dialogEmpleados .emp-title').textContent = 'Registrar empleado'
    document.getElementById('btnGuardarEmpleado').textContent = 'Guardar empleado'

    dialogo.showModal()
}

async function guardarEmpleado(event) {
    event.preventDefault()
    const formulario = document.getElementById('formEmpleado')
    if (!formulario.reportValidity()) return
    const editando = idEmpleadoEditando !== null
    const boton = document.getElementById('btnGuardarEmpleado')
    const datos = Object.fromEntries(new FormData(formulario))

    datos.idcargo = Number(datos.idcargo)
    datos.idsede = Number(datos.idsede)
    datos.idhorario = Number(datos.idhorario)
    datos.estado = datos.estado === '1'

    const url = editando
        ? `/api/empleados/${idEmpleadoEditando}`
        : '/api/empleados'

    try {
        boton.disabled = true
        boton.textContent = editando ? 'Actualizando...' : 'Guardando...'
        const respuesta = await llamarApi(url, editando ? 'PUT' : 'POST', datos)

        mostrarMensajeEmpleado(
            respuesta.message || 'Empleado guardado correctamente.'
        )

        await cargarEmpleados()

        mostrarMensajeEmpleado(
            respuesta.message || (editando
                ? 'Empleado actualizado correctamente.'
                : 'Empleado registrado correctamente.')
        )
    } catch (error) {
        mostrarMensajeEmpleado(error.message, 'error')
    } finally {
        boton.disabled = false
        boton.textContent = editando
            ? 'Actualizar empleado'
            : 'Guardar empleado'
    }
}

async function editarEmpleado(id) {
    try {
        const respuesta = await llamarApi(`/api/empleados/${id}`)
        const empleado = respuesta.data || respuesta
        const formulario = document.getElementById('formEmpleado')
        const dialogo = document.getElementById('dialogEmpleados')

        limpiarFormularioEmpleado()
        idEmpleadoEditando = id
        Object.keys(empleado).forEach(campo => {
            const elemento = formulario.elements[campo]
            if (elemento && empleado[campo] !== null) {
                if (['fechanac', 'fecha_inicio', 'fecha_fin'].includes(campo)) {
                    elemento.value = String(empleado[campo]).substring(0, 10)
                } else {
                    elemento.value = empleado[campo]
                }
            }
        })

        formulario.elements.clave_acceso.value = ''
        formulario.elements.clave_acceso.required = false

        document.querySelector('#dialogEmpleados .emp-title').textContent = 'Editar empleado'
        document.getElementById('btnGuardarEmpleado').textContent = 'Actualizar empleado'
        document.getElementById('mensajeEmpleado').style.display = 'none'
        dialogo.showModal()

    } catch (error) {
        alert(error.message)
    }
}

// ELIMINAR EMPLEADO
async function eliminarEmpleado(id) {
    const confirmar = confirm('¿Estás seguro de eliminar este empleado?')

    if (!confirmar) return

    try {
        const respuesta = await llamarApi(`/api/empleados/${id}`, 'DELETE')
        alert(respuesta.message || 'Empleado eliminado correctamente.')
        await cargarEmpleados()
    } catch (error) {
        alert(error.message, 'error')
    }
}

function limpiarFormularioEmpleado() {
    const formulario = document.getElementById('formEmpleado')
    formulario.reset()
    idEmpleadoEditando = null

    formulario.elements.clave_acceso.required = true
    document.getElementById('mensajeEmpleado').textContent = ''
    document.getElementById('mensajeEmpleado').style.display = 'none'
    document.getElementById('btnGuardarEmpleado').textContent = 'Guardar empleado'
}

function cerrarFormularioEmpleado(){
    const dialog = document.getElementById('dialogEmpleados')

    limpiarFormularioEmpleado()
    dialog.close()
}

window.iniciarEmpleado = async function () {
    const formulario = document.getElementById('formEmpleado')
    

    document.getElementById('btnNuevoEmpleado').addEventListener('click', nuevoEmpleado)
    document.getElementById('btnCerrarEmpleado').addEventListener('click', cerrarFormularioEmpleado)
    document.getElementById('btnCancelarEmpleado').addEventListener('click', cerrarFormularioEmpleado)
    formulario.addEventListener('submit', guardarEmpleado)

    await Promise.all([
        cargarOpcionesEmpleado('/api/cargos', 'idcargo', 'idcargo', 'nombre_cargo'),
        cargarOpcionesEmpleado('/api/sedes', 'idsede', 'idsede', 'nombre_sede'),
        cargarOpcionesEmpleado('/api/horarios', 'idhorario', 'idhorario', 'dia'),
        cargarEmpleados()
    ])
}
