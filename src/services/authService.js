/**
 * Servicio de autenticación simulado.
 * Regla: este archivo NO manipula el DOM ni crea HTML.
 */
import { USUARIOS, CLAVE_USUARIO_STORAGE } from '../data/authData.js';

/** Quita la clave: nunca se guarda en el navegador. */
const aUsuarioPublico = ({ clave, ...publico }) => publico;

/**
 * Verifica las credenciales contra authData.js.
 * Si son válidas guarda el usuario en localStorage (clave "sige_usuario")
 * y retorna { exito: true, usuario }. Si no, { exito: false, mensaje }.
 */
export function iniciarSesionSimulado({ email, password }) {
  const correo = String(email ?? '').trim().toLowerCase();
  const encontrado = USUARIOS.find((u) => u.email === correo && u.clave === password);

  if (!encontrado) {
    return { exito: false, mensaje: 'Credenciales incorrectas' };
  }

  const usuario = aUsuarioPublico(encontrado);
  try {
    localStorage.setItem(CLAVE_USUARIO_STORAGE, JSON.stringify(usuario));
  } catch {
    // Sin almacenamiento disponible (modo privado, bloqueado): la sesión dura solo esta pestaña.
  }
  return { exito: true, usuario };
}

/** Lee el usuario guardado, o null si no hay sesión o el dato no es válido. */
export function obtenerUsuarioAutenticado() {
  try {
    const guardado = localStorage.getItem(CLAVE_USUARIO_STORAGE);
    if (!guardado) return null;
    const usuario = JSON.parse(guardado);
    const valido = usuario && typeof usuario.email === 'string' && typeof usuario.nombre === 'string';
    return valido ? usuario : null;
  } catch {
    return null;
  }
}

/** Elimina la sesión guardada. */
export function cerrarSesion() {
  try {
    localStorage.removeItem(CLAVE_USUARIO_STORAGE);
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}