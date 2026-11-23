
let registrosOriginales = []

async function cargarRegistros() {
    const tabla = document.getElementById('tablaRegistros')

    try {
        tabla.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-4">
                    Cargando registros...
                </td>
            </tr>`

        registrosOriginales = await llamarApi('/api/marcaciones', 'GET')

        // Cargar sedes en el filtro
        const sedes = [...new Set(
            registrosOriginales.map(r => r.nombre_sede)
        )]

        const filtroSede = document.getElementById('filtroSede')
        filtroSede.innerHTML = '<option value="">Todas las sedes</option>'

        sedes.forEach(sede => {
            filtroSede.innerHTML += `
                <option value="${sede}">${sede}</option>`
        })

        mostrarRegistros(registrosOriginales)

    } catch (error) {
        console.error(error)
        tabla.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-danger py-4">
                    ${error.message}
                </td>
            </tr>`
    }
}

function mostrarRegistros(registros) {
    const tabla = document.getElementById('tablaRegistros')
    document.getElementById('totalRegistros').textContent =
        `${registros.length} registros`

    if (!registros.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-4">
                    No se encontraron registros
                </td>
            </tr>`
        return
    }

    tabla.innerHTML = registros.map(r => `
        <tr>
            <td>${r.apellidos}, ${r.nombres}</td>
            <td>${r.numdoc}</td>
            <td>${r.nombre_cargo}</td>
            <td>${r.nombre_sede}</td>
            <td>${formatearFecha(r.fecha)}</td>
            <td>${r.entrada || '-'}</td>
            <td>${r.inicio_ref || '-'}</td>
            <td>${r.fin_ref || '-'}</td>
            <td>${r.salida || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary"
                    onclick="verRegistro(${r.idmarcacion})"
                    title="Ver detalle">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        </tr>
    `).join('')
}

function filtrarRegistros() {
    const texto = document.getElementById('buscarEmpleado').value.toLowerCase()
    const desde = document.getElementById('fechaDesde').value
    const hasta = document.getElementById('fechaHasta').value
    const sede = document.getElementById('filtroSede').value

    const filtrados = registrosOriginales.filter(r => {
        const empleado = `${r.nombres} ${r.apellidos} ${r.numdoc}`.toLowerCase()

        return empleado.includes(texto) &&
            (!desde || r.fecha.slice(0, 10) >= desde) &&
            (!hasta || r.fecha.slice(0, 10) <= hasta) &&
            (!sede || r.nombre_sede === sede)
    })

    mostrarRegistros(filtrados)
}

function formatearFecha(fecha) {
    if (!fecha) return '-'
    const [anio, mes, dia] = String(fecha).slice(0, 10).split('-')
    return `${dia}/${mes}/${anio}`
}

async function verRegistro(id) {
    try {
        const registro = await llamarApi(`/api/marcaciones/${id}`, 'GET')

        alert(
            `Empleado: ${registro.nombres} ${registro.apellidos}\n` +
            `Cargo: ${registro.nombre_cargo}\n` +
            `Fecha: ${formatearFecha(registro.fecha)}\n` +
            `Entrada: ${registro.entrada || '-'}\n` +
            `Inicio refrigerio: ${registro.inicio_ref || '-'}\n` +
            `Fin refrigerio: ${registro.fin_ref || '-'}\n` +
            `Salida: ${registro.salida || '-'}`
        )
    } catch (error) {
        alert(error.message)
    }
}

window.iniciarRegistros = cargarRegistros
