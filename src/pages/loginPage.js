import { crearLoginForm } from '../components/loginForm.js';
import logoUcc from '../assets/logoUcc.png';

const NOMBRE_UNIVERSIDAD = 'Universidad Cooperativa de Colombia';

/**
 * Logo oficial: colócalo en public/logo-ucc.png.
 * Si el archivo no existe, se muestra el nombre de la universidad en texto.
 */
function crearLogo() {
  const imagen = document.createElement('img');
  imagen.className = 'login-logo';
  imagen.src = logoUcc;
  imagen.alt = NOMBRE_UNIVERSIDAD;
  imagen.addEventListener('error', () => {
    const texto = document.createElement('p');
    texto.className = 'login-logo-texto';
    texto.textContent = NOMBRE_UNIVERSIDAD;
    imagen.replaceWith(texto);
  });
  return imagen;
}

/**
 * Pantalla de inicio de sesión (solo login, sin registro:
 * el egresado no entra al sistema, solo responde las encuestas).
 * @param {HTMLElement} contenedor
 * @param {{ onLoginExitoso: (usuario: object) => void }} opciones
 */
export function montarLoginPage(contenedor, { onLoginExitoso }) {
  contenedor.innerHTML = '';

  const pagina = document.createElement('div');
  pagina.className = 'login-pagina';

  const barra = document.createElement('div');
  barra.className = 'login-barra';
  barra.setAttribute('aria-hidden', 'true');

  const contenido = document.createElement('main');
  contenido.className = 'login-contenido';

  const tarjeta = document.createElement('div');
  tarjeta.className = 'login-tarjeta';

  /* Panel izquierdo: marca */
  const marca = document.createElement('section');
  marca.className = 'login-marca';
  const facultad = document.createElement('p');
  facultad.className = 'login-facultad';
  facultad.textContent = 'Facultad de Ingeniería';
  const titulo = document.createElement('h1');
  titulo.className = 'login-titulo';
  titulo.textContent = 'Sistema de Seguimiento y Caracterización de Egresados';
  marca.append(crearLogo(), facultad, titulo);

  /* Panel derecho: formulario */
  const panel = document.createElement('section');
  panel.className = 'login-panel';
  const encabezado = document.createElement('div');
  encabezado.className = 'login-panel__encabezado';
  const subtitulo = document.createElement('h2');
  subtitulo.className = 'login-panel__titulo';
  subtitulo.textContent = 'Iniciar sesión';
  encabezado.append(subtitulo);
  const formulario = crearLoginForm({ onExito: onLoginExitoso });
  panel.append(encabezado, formulario);

  tarjeta.append(marca, panel);
  contenido.append(tarjeta);
  pagina.append(barra, contenido);
  contenedor.append(pagina);

  formulario.querySelector('input').focus();
}