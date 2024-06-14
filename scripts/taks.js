// SEGURIDAD: Si no se encuentra en localStorage info del usuario
// no lo deja acceder a la página, redirigiendo al login inmediatamente.
if (!localStorage.getItem('jwt')) {
  location.replace('../index.html');
}
/* ------ comienzan las funcionalidades una vez que carga el documento ------ */
window.addEventListener('load', function () {
  /* ---------------- variables globales y llamado a funciones ---------------- */
  const apiUrl = 'https://todo-api.digitalhouse.com/v1';
  const token = localStorage.getItem('jwt');
  const btnCerrarSesion = document.getElementById('closeApp');
  const formCrearTarea = document.querySelector('.nueva-tarea');
  const nuevaTarea = document.getElementById('nuevaTarea');
  const userName = document.querySelector('.user-info p');
  const tareasPendientes = document.querySelector('.tareas-pendientes');
  const tareasTerminadas = document.querySelector('.tareas-terminadas');
  const cantTareasTerminadas = document.getElementById('cantidad-finalizadas');

  //Función helper para armar los settings para fetch
  function HTTPSettings(method, bodyData) {
    const settings = {
      method: method,
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
    };
    if (bodyData) settings.body = JSON.stringify(bodyData);
    return settings;
  }

  //Helper para manejar las dos promesas en cada consulta a la api
  async function sendFetch(route, settings) {
    const res = await fetch(`${apiUrl}/${route}`, settings);
    if (!res.ok) throw new Error(`Error en la solicitud: ${res.status}`);
    return await res.json();
  }
  /* -------------------------------------------------------------------------- */
  /*                          FUNCIÓN 1 - Cerrar sesión                         */
  /* -------------------------------------------------------------------------- */

  btnCerrarSesion.addEventListener('click', function () {
    const confirmClose = confirm('¿Estás seguro que quieres salir?');
    if (confirmClose) {
      localStorage.clear();
      location.replace('../index.html');
    }
  });

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 2 - Obtener nombre de usuario [GET]                */
  /* -------------------------------------------------------------------------- */

  (async function obtenerNombreUsuario() {
    try {
      const settings = HTTPSettings('GET');
      const data = await sendFetch('users/getMe', settings);
      userName.textContent = data.firstName;
    } catch (error) {
      console.error('Error al cargar el nombre de usuario: ', error);
    }
  })(); // IIFE para que se ejecute al cargar

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 3 - Obtener listado de tareas [GET]                */
  /* -------------------------------------------------------------------------- */

  async function consultarTareas() {
    try {
      const settings = HTTPSettings('GET');
      const data = await sendFetch('tasks', settings);
      renderizarTareas(data);
      if (!data.length) return console.log('No hay tareas');
    } catch (error) {
      console.log('Error al cargar las tareas:', error);
    }
  }
  consultarTareas();

  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 4 - Crear nueva tarea [POST]                    */
  /* -------------------------------------------------------------------------- */

  formCrearTarea.addEventListener('submit', async function (event) {
    event.preventDefault();
    const payload = { description: nuevaTarea.value, completed: false };
    const settings = HTTPSettings('POST', payload);
    try {
      await fetch(`${apiUrl}/tasks`, settings);
      formCrearTarea.reset();
      consultarTareas();
    } catch (error) {
      console.log('Error al crear la tarea', error);
    }
  });

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 5 - Renderizar tareas en pantalla                 */
  /* -------------------------------------------------------------------------- */
  function renderizarTareas(listado) {
    tareasTerminadas.innerHTML = '';
    tareasPendientes.innerHTML = '';
    let completedTasks = 0;

    listado.forEach((tarea) => {
      if (tarea.completed) {
        completedTasks++;
        const htmlTareaCompleta = `
        <li class="tarea">
        <div class="hecha">
          <i class="fa-regular fa-circle-check"></i>
        </div>
        <div class="descripcion">
          <p class="nombre">${tarea.description}</p>
          <div class="cambios-estados">
            <button class="change incompleta" id="${tarea.id}">
              <i class="fa-solid fa-rotate-left"></i>
            </button>
            <button class="borrar" id="${tarea.id}">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      </li>
        `;
        tareasTerminadas.innerHTML += htmlTareaCompleta;
      } else {
        const htmlTareaPendiente = `
        <li class="tarea">
          <button class="change" id="${tarea.id}">
            <i class="fa-regular fa-circle"></i>
          </button>
          <div class="descripcion">
            <p class="nombre">${tarea.description}</p>
            <p class="timestamp">${tarea.createdAt}</p>
          </div>
        </li>
      `;
        tareasPendientes.innerHTML += htmlTareaPendiente;
      }
    });
    cantTareasTerminadas.innerText = completedTasks;
    //Delegamos el evento al padre para pasarlo a los hijos
    tareasPendientes.addEventListener('click', manejarBotones);
    tareasTerminadas.addEventListener('click', manejarBotones);
  }
  function manejarBotones(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.classList.contains('borrar')) {
      botonBorrarTarea(btn.id);
    } else if (btn.classList.contains('change')) {
      botonesCambioEstado(btn.id);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Cambiar estado de tarea [PUT]                 */
  /* -------------------------------------------------------------------------- */
  async function botonesCambioEstado(taskId) {
    const settings = HTTPSettings('GET');
    //cargamos la info de la task desde el server mediante el id
    // ya que si tomamos la info en el front es posible manpular el texto y enviar cambios fuera de la regla de negocio
    const data = await sendFetch(`tasks/${taskId}`, settings);
    //al ser un boolean podemos negar el valor de completed para obtener su inverso
    data.completed = !data.completed;
    //mandamos la nueva info de la task (al ser PUT es necesario mandar todo🙃)
    const settingsPut = HTTPSettings('PUT', data);
    await fetch(`${apiUrl}/tasks/${taskId}`, settingsPut);
    consultarTareas();
  }

  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar tarea [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  async function botonBorrarTarea(taskId) {
    try {
      const settings = HTTPSettings('DELETE');
      const data = await sendFetch(`tasks/${taskId}`, settings);
      console.log(data);
      consultarTareas();
    } catch (error) {
      console.log('Error al borrar la tara:', error);
    }
  }
});
