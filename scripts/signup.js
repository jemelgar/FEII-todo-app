window.addEventListener('load', function () {
  /* ---------------------- obtenemos variables globales ---------------------- */
  const email = document.getElementById('inputEmail');
  const firstName = document.getElementById('inputNombre');
  const form = document.forms[0];
  const lastName = document.getElementById('inputApellido');
  const password = document.getElementById('inputPassword');
  const passwordRepeat = document.getElementById('inputPasswordRepetida');
  const apiUrl = 'https://todo-api.digitalhouse.com/v1';

  const verifyJwt = () => {
    const isJWTDefined = localStorage.getItem('jwt');
    if (isJWTDefined) location.replace('../mis-tareas.html');
  };
  verifyJwt();

  /* -------------------------------------------------------------------------- */
  /*            FUNCIÓN 1: Escuchamos el submit y preparamos el envío           */
  /* -------------------------------------------------------------------------- */
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    try {
      normalizedName = normalizarTexto(firstName.value);
      normalizedLastName = normalizarTexto(lastName.value);
      normalizedEmail = normalizarEmail(email.value);
      validPassword = compararContrasenias(
        password.value,
        passwordRepeat.value,
      );

      const payload = {
        firstName: normalizedName,
        lastName: normalizedLastName,
        email: normalizedEmail,
        password: validPassword,
      };
      const registerConf = {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      };
      realizarRegister(registerConf);
      verifyJwt();
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  });

  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 2: Realizar el signup [POST]                    */
  /* -------------------------------------------------------------------------- */
  async function realizarRegister(settings) {
    try {
      const response = await fetch(`${apiUrl}/users`, settings);
      console.log(response);

      if (!response.ok) throw new Error('Algo salío mal, intenta más tarde');

      const data = await response.json();
      if (data.jwt) localStorage.setItem('jwt', JSON.stringify(data.jwt));
    } catch (error) {
      console.error(`Algo salió mal: ${error}`);
    }
  }
});
