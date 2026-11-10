async function llamarApi(url, metodo, datos){
  const opciones = {
    method: metodo || 'GET',
    headers: { 'Content-Type':'application/json' },
    credentials: 'same-origin'
  }

  //No siempre se enviaran datos...
  if (datos) { opciones.body = JSON.stringify(datos) }

  //Ejecutamos la peticion (PROMESA)
  const respuesta = await fetch(url, opciones)

  //Es posible que la peticion no resuelva
  //Evaluamos todos los escenarios donde falla
  if ( respuesta.status == 401) {
    window.location.href = '/login.html'
    throw new Error('Sesion expirada')
  }
  const resultado = await respuesta.json()
  
  //Si el estado es diferente a 2XX
  if (!respuesta.ok) {
    throw new Error(resultado.message)
  }

  return resultado
}

async function iniciar() {
  const yo = await llamarApi('/api/auth/me')

  window.usuarioActual = yo
  document.getElementById('who').textContent = `${yo.nombres} ${yo.apellidos} (${yo.nivel_acceso})`

  if (typeof cargarPersonas === 'function') {
    await cargarPersonas()
   }
  //Si eres un ADMIN deberias poder ver otras funciones...

  //Rutina que se ejecuta una vez iniciemos sesion
 

}

async function cerrarSesion(){
  await llamarApi('/api/auth/logout', 'POST')
  window.location.href = '/login.html'
}

function marcarMenuActivo(item) {
  document.querySelectorAll('.sidebar .nav-item').forEach((el) => el.classList.remove('active'))
  item.classList.add('active')
}

async function cargarPagina(url) {
  const mainContent = document.getElementById('mainContent')

  try {
    const respuesta = await fetch(url)
    if (!respuesta.ok) { throw new Error(`Error ${respuesta.status}: No se pudo cargar la página`) }

    mainContent.innerHTML = await respuesta.text()

    if (url === '/asistencia.html') { await window.iniciarAsistencia?.() }
  } catch (error) {
    console.error('Error al cargar la página:', error)

    mainContent.innerHTML = `
      <div class="alert alert-danger">
        ${error.message}
      </div>
    `
  }
}


const contenidoDashboard = document.getElementById('mainContent').innerHTML
//Manejador de eventos
document.getElementById("logout").addEventListener("click", cerrarSesion)
document.getElementById('menuDashboard').addEventListener('click', (e) => {
  e.preventDefault()
  marcarMenuActivo(e.currentTarget)
  document.getElementById('mainContent').innerHTML = contenidoDashboard
})

document.getElementById('menuAsistencia').addEventListener('click', (e) => {
  e.preventDefault()
  marcarMenuActivo(e.currentTarget)
  cargarPagina('/asistencia.html')
})
iniciar()