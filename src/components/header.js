import { icono } from '../utils/iconos.js';

const opciones = (lista, seleccionado) =>
  lista
    .map((valor) => `<option value="${valor}"${String(valor) === String(seleccionado) ? ' selected' : ''}>${valor}</option>`)
    .join('');

/**
 * Encabezado de la página: título, desplegables de programa y año, y botón "Exportar tablero".
 * Devuelve { elemento, habilitarExportar }.
 *
 * @param {object} props
 * @param {string[]} props.programas
 * @param {number[]} props.anios
 * @param {string}   props.programa   programa seleccionado
 * @param {number}   props.anio       año seleccionado
 * @param {(f: {programa: string, anio: number}) => void} props.onCambio
 * @param {() => void} props.onExportar
 * @param {() => void} props.onAlternarMenu
 */
export function crearHeader({ programas, anios, programa, anio, onCambio, onExportar, onAlternarMenu }) {
  const elemento = document.createElement('header');
  elemento.className = 'card encabezado';
  elemento.innerHTML = `
    <button type="button" class="encabezado__menu" aria-label="Abrir menú" aria-controls="sidebar" aria-expanded="false">
      ${icono('menu', 22)}
    </button>

    <div class="encabezado__titulos">
      <h1 class="encabezado__titulo">Seguimiento y Caracterización para Acreditación</h1>
      <p class="encabezado__subtitulo">Métricas consolidadas para evidencias del Factor 4 (CNA)</p>
    </div>

    <div class="encabezado__controles">
      <div class="select-contenedor">
        <label class="sr-only" for="filtro-programa">Programa</label>
        <select id="filtro-programa" class="select">${opciones(programas, programa)}</select>
      </div>
      <div class="select-contenedor select-contenedor--corto">
        <label class="sr-only" for="filtro-anio">Año</label>
        <select id="filtro-anio" class="select">${opciones(anios, anio)}</select>
      </div>
      <button type="button" class="btn btn--primario" id="btn-exportar-tablero">
        ${icono('descargar', 18)}
        <span>Exportar tablero</span>
      </button>
    </div>
  `;

  const selectPrograma = elemento.querySelector('#filtro-programa');
  const selectAnio = elemento.querySelector('#filtro-anio');
  const botonExportar = elemento.querySelector('#btn-exportar-tablero');
  const botonMenu = elemento.querySelector('.encabezado__menu');

  const notificarCambio = () =>
    onCambio({ programa: selectPrograma.value, anio: Number(selectAnio.value) });

  selectPrograma.addEventListener('change', notificarCambio);
  selectAnio.addEventListener('change', notificarCambio);
  botonExportar.addEventListener('click', onExportar);
  botonMenu.addEventListener('click', onAlternarMenu);

  // Mantiene el estado ARIA del botón de menú sincronizado con la barra lateral.
  document.addEventListener('sidebar:cambio', (evento) => {
    botonMenu.setAttribute('aria-expanded', String(evento.detail.abierto));
  });

  return {
    elemento,
    habilitarExportar(habilitado) {
      botonExportar.disabled = !habilitado;
    },
  };
}