import { icono } from '../utils/iconos.js';

const opciones = (lista, seleccionado) =>
  lista
    .map((valor) => `<option value="${valor}"${String(valor) === String(seleccionado) ? ' selected' : ''}>${valor}</option>`)
    .join('');

/**
 * Encabezado de la página: título y botón de menú.
 * Devuelve { elemento }.
 *
 * @param {object} props
 * @param {() => void} props.onAlternarMenu
 */
export function crearHeader({ onAlternarMenu }) {
  const elemento = document.createElement('header');
  elemento.className = 'card encabezado';
  elemento.innerHTML = `
    <button type="button" class="encabezado__menu" aria-label="Abrir menú" aria-controls="sidebar" aria-expanded="false">
      ${icono('menu', 22)}
    </button>

    <div class="encabezado__titulos">
      <h1 class="encabezado__titulo">Gestión y Centralización de Información</h1>
      <p class="encabezado__subtitulo">Métricas consolidadas para evidencias del Factor 4 (CNA)</p>
    </div>
  `;

  const botonMenu = elemento.querySelector('.encabezado__menu');
  botonMenu.addEventListener('click', onAlternarMenu);

  // Mantiene el estado ARIA del botón de menú sincronizado con la barra lateral.
  document.addEventListener('sidebar:cambio', (evento) => {
    botonMenu.setAttribute('aria-expanded', String(evento.detail.abierto));
  });

  return { elemento };
}