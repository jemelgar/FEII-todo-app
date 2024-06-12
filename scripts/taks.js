// SEGURIDAD: Si no se encuentra en localStorage info del usuario
// no lo deja acceder a la página, redirigiendo al login inmediatamente.
const isJWTDefined = localStorage.getItem('jwt');
if (!isJWTDefined) location.replace('../index.html');
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
  let btnChangeState = '';

  /* -------------------------------------------------------------------------- */
  /*                          FUNCIÓN 1 - Cerrar sesión                         */
  /* -------------------------------------------------------------------------- */

  btnCerrarSesion.addEventListener('click', function () {
    localStorage.clear();
    location.replace('../index.html');
  });

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 2 - Obtener nombre de usuario [GET]                */
  /* -------------------------------------------------------------------------- */

  (async function obtenerNombreUsuario() {
    const settings = {
      method: 'GET',
      headers: {
        authorization: token,
      },
    };
    const response = await fetch(`${apiUrl}/users/getMe`, settings);
    const data = await response.json();
    userName.textContent = data.firstName;
  })(); // IIFE para que se ejecute al cargar

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 3 - Obtener listado de tareas [GET]                */
  /* -------------------------------------------------------------------------- */

  async function consultarTareas() {
    const settings = {
      method: 'GET',
      headers: {
        authorization: token,
      },
    };
    const response = await fetch(`${apiUrl}/tasks`, settings);
    const data = await response.json();
    if (data) return renderizarTareas(data);
    return console.log('No hay tareas');
  }
  consultarTareas();

  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 4 - Crear nueva tarea [POST]                    */
  /* -------------------------------------------------------------------------- */

  formCrearTarea.addEventListener('submit', async function (event) {
    event.preventDefault();
    const payload = { description: nuevaTarea.value, completed: false };
    console.log(payload);

    const settings = {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
    };
    await fetch(`${apiUrl}/tasks`, settings);
    await consultarTareas();
  });

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 5 - Renderizar tareas en pantalla                 */
  /* -------------------------------------------------------------------------- */
  function renderizarTareas(listado) {
    tareasTerminadas.innerHTML = '';
    tareasPendientes.innerHTML = '';

    listado.forEach((tarea) => {
      if (tarea.completed) {
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
    //ya que tenemos cargadas las tareas agregamos el evento click a cada una
    btnChangeState = document.querySelectorAll('.change');
    btnChangeState.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        botonesCambioEstado(e.target.id);
      });
    });
    return btnChangeState;
  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Cambiar estado de tarea [PUT]                 */
  /* -------------------------------------------------------------------------- */
  async function botonesCambioEstado(taskId) {
    const settings = {
      method: 'GET',
      headers: {
        authorization: token,
      },
    };

    //cargamos la info de la task desde el server mediante el id
    const response = await fetch(`${apiUrl}/tasks/${taskId}`, settings);
    const data = await response.json();
    //al ser un boolean podemos negar el valor de completed para obtener su inverso
    data.completed = !data.completed;

    //mandamos la nueva info de la task (al ser PUT es necesario mandar todo)
    const settingsPut = {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
    };
    await fetch(`${apiUrl}/tasks/${taskId}`, settingsPut);
    await consultarTareas();
  }

  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar tarea [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function botonBorrarTarea() {}
});
