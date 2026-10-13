/**
 * Validadores puros. No tocan el DOM ni leen estado externo.
 */
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LARGO_MINIMO_CLAVE = 4;

/**
 * Valida los datos del formulario de inicio de sesión.
 * Retorna un objeto con un mensaje por cada campo con error,
 * por ejemplo { email: '...', password: '...' }. Si todo es válido, retorna {}.
 */
export function validarLogin({ email = '', password = '' } = {}) {
  const errores = {};
  const correo = String(email).trim();
  const clave = String(password);

  if (!correo) {
    errores.email = 'Ingresa tu correo electrónico.';
  } else if (!REGEX_CORREO.test(correo)) {
    errores.email = 'Escribe un correo válido, por ejemplo nombre.apellido@ucc.edu.co.';
  }

  if (!clave) {
    errores.password = 'Ingresa tu contraseña.';
  } else if (clave.length < LARGO_MINIMO_CLAVE) {
    errores.password = `La contraseña debe tener al menos ${LARGO_MINIMO_CLAVE} caracteres.`;
  }

  return errores;
}