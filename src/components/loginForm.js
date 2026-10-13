import { validarLogin } from '../utils/validators.js';
import { iniciarSesionSimulado } from '../services/authService.js';

/** Crea un elemento con clase, atributos y texto, usando solo APIs nativas del DOM. */
function crear(etiqueta, clase, atributos = {}, texto) {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  Object.entries(atributos).forEach(([nombre, valor]) => nodo.setAttribute(nombre, valor));
  if (texto !== undefined) nodo.textContent = texto;
  return nodo;
}

/** Campo de formulario: etiqueta + input + mensaje de error accesible. */
function crearCampo({ id, etiqueta, tipo, autocomplete, placeholder, conToggle = false }) {
  const contenedor = crear('div', 'login-campo');
  const label = crear('label', 'login-campo__etiqueta', { for: id }, etiqueta);
  const caja = crear('div', 'login-campo__caja');
  const input = crear('input', 'login-campo__input', {
    id,
    name: id,
    type: tipo,
    autocomplete,
    placeholder,
    'aria-describedby': `${id}-error`,
  });
  const error = crear('p', 'login-campo__error', { id: `${id}-error` });
  error.hidden = true;

  caja.append(input);

  if (conToggle) {
    const toggle = crear('button', 'login-campo__toggle', { type: 'button', 'aria-controls': id, 'aria-pressed': 'false' }, 'Mostrar');
    toggle.addEventListener('click', () => {
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      toggle.textContent = visible ? 'Mostrar' : 'Ocultar';
      toggle.setAttribute('aria-pressed', String(!visible));
    });
    caja.append(toggle);
    input.classList.add('login-campo__input--con-toggle');
  }

  contenedor.append(label, caja, error);

  return {
    contenedor,
    input,
    mostrarError(mensaje) {
      error.textContent = mensaje;
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    },
    limpiarError() {
      error.textContent = '';
      error.hidden = true;
      input.removeAttribute('aria-invalid');
    },
  };
}

/**
 * Fabrica y retorna el formulario de inicio de sesión.
 * @param {object} props
 * @param {(usuario: object) => void} props.onExito  se llama cuando las credenciales son correctas
 * @returns {HTMLFormElement}
 */
export function crearLoginForm({ onExito }) {
  const formulario = crear('form', 'login-form', { novalidate: '', 'aria-label': 'Iniciar sesión' });

  const mensaje = crear('div', 'login-mensaje', { role: 'alert' });
  mensaje.hidden = true;

  const campoEmail = crearCampo({
    id: 'login-email',
    etiqueta: 'Correo',
    tipo: 'email',
    autocomplete: 'username',
    placeholder: 'nombre.apellido@ucc.edu.co',
  });
  const campoPassword = crearCampo({
    id: 'login-password',
    etiqueta: 'Contraseña',
    tipo: 'password',
    autocomplete: 'current-password',
    placeholder: 'Tu contraseña',
    conToggle: true,
  });

  const filaRecuperar = crear('div', 'login-recuperar');
  const textoRecuperar = crear('span', '', {}, '¿Olvidaste tu contraseña?');
  const botonRecuperar = crear('button', 'login-enlace', { type: 'button' }, 'Recuperarla');
  filaRecuperar.append(textoRecuperar, botonRecuperar);

  const botonIngresar = crear('button', 'login-boton', { type: 'submit' }, 'Ingresar al sistema');

  formulario.append(mensaje, campoEmail.contenedor, campoPassword.contenedor, filaRecuperar, botonIngresar);

  /* ---- Mensajes globales ---- */
  function mostrarMensaje(texto, tipo = 'error') {
    mensaje.textContent = texto;
    mensaje.className = `login-mensaje login-mensaje--${tipo}`;
    mensaje.hidden = false;
  }

  function limpiarMensaje() {
    mensaje.textContent = '';
    mensaje.hidden = true;
  }

  /* ---- Eventos ---- */
  [campoEmail, campoPassword].forEach((campo) => {
    campo.input.addEventListener('input', () => {
      campo.limpiarError();
      limpiarMensaje();
    });
  });

  botonRecuperar.addEventListener('click', () => {
    mostrarMensaje('Para restablecer tu contraseña, comunícate con el administrador del sistema.', 'info');
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    limpiarMensaje();
    campoEmail.limpiarError();
    campoPassword.limpiarError();

    const datos = { email: campoEmail.input.value, password: campoPassword.input.value };
    const errores = validarLogin(datos);

    if (Object.keys(errores).length > 0) {
      if (errores.email) campoEmail.mostrarError(errores.email);
      if (errores.password) campoPassword.mostrarError(errores.password);
      (errores.email ? campoEmail : campoPassword).input.focus();
      return;
    }

    const resultado = iniciarSesionSimulado(datos);
    if (!resultado.exito) {
      mostrarMensaje(resultado.mensaje, 'error');
      campoPassword.input.value = '';
      campoPassword.input.focus();
      return;
    }

    onExito(resultado.usuario);
  });

  return formulario;
}