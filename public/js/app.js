async function llamarApi(url, metodo, datos){
  const opciones = {
    method: metodo || 'GET',
    headers: { 'Content-Type':'application/json' }
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
  document.getElementById('who').textContent = `${yo.nombres} ${yo.apellidos} (${yo.nivel_acceso})`


  //Si eres un ADMIN deberias poder ver otras funciones...

  //Rutina que se ejecuta una vez iniciemos sesion
  cargarPersonas()

}

async function cerrarSesion(){
  await llamarApi('/api/auth/logout', 'POST')
  window,location.href = '/login.html'
}

//Manejador de eventos
document.getElementById("logout").addEventListener("click", cerrarSesion)
iniciar()