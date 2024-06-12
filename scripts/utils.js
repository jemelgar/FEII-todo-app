const regExpHandler = (string, regExp, error) => {
  const rule = new RegExp(regExp);
  if (!rule.test(string)) throw new Error(error);
  return true;
};

/* ---------------------------------- texto --------------------------------- */
function validarTexto(texto) {
  //validamos length
  if (texto.length < 4) throw new Error('Debes poner al menos 4 letras');
  //validamos los caracteres
  regExpHandler(texto, '^[a-zA-Z\\s]*$', 'Incluye solamente letras');
  return texto;
}

function normalizarTexto(texto) {
  //Eliminar espacios en blanco, pasar a minúsculas y reemplazar múltiples espacios por 1 solo
  txtNormalizado = texto.trim().toLowerCase().replace(/\s+/g, ' ');
  return validarTexto(txtNormalizado);
}

/* ---------------------------------- email --------------------------------- */
function validarEmail(email) {
  const emailFormat = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
  regExpHandler(email, emailFormat, 'El email no tiene el formato correcto');
  return email;
}

function normalizarEmail(email) {
  const emailNormalizado = email.trim().toLowerCase();
  return validarEmail(emailNormalizado);
}

/* -------------------------------- password -------------------------------- */
function validarContrasenia(contrasenia) {
  // 7 caracters mínimo de largo 12 máx, 1 mayús, 1 minus, 1 núm y caracter especial mínimamente
  const passFormat =
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{7,12}$';
  regExpHandler(
    contrasenia,
    passFormat,
    'La contraseña debe tener mínimo 7 caracteres, máximo 12, inluye al menos 1 minúscula, una mayúscula, 1 número y un caracter especial',
  );
  return contrasenia;
}

function compararContrasenias(contrasenia_1, contrasenia_2) {
  if (contrasenia_1 !== contrasenia_2)
    throw new Error('Las contraseñas no coinciden');
  return validarContrasenia(contrasenia_1);
}
