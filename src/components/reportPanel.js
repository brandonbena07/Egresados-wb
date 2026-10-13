import { formatearFechaHora, formatearNumero, formatearPorcentaje, etiquetaCohorte } from '../utils/formatters.js';
import { icono } from '../utils/iconos.js';
import {
  COLORES,
  PALETA_CATEGORIAS,
  OPCIONES_LEYENDA,
  crearGrafica,
  destruirGrafica,
} from '../utils/graficas.js';

const FORMATEADORES_CELDA = {
  texto: (v) => v,
  numero: formatearNumero,
  porcentaje: (v) => formatearPorcentaje(v, 1),
};

/**
 * Panel "Generar reporte".
 * Devuelve { elemento, actualizarFiltros, limpiarResultado, mostrarCargando, mostrarResultado, mostrarError }.
 *
 * @param {object} props
 * @param {Array}  props.reportes   [{ id, nombre, aspecto, descripcion }]
 * @param {Array}  props.formatos   [{ id, etiqueta }]
 * @param {(reporteId: string|null) => void} props.onSeleccion
 * @param {string[]} props.programas   lista de programas
 * @param {number[]} props.anios        lista de años
 * @param {(f: {programa: string, anio: number}) => string[]} props.obtenerCohortes   fn para obtener cohortes
 * @param {(f: {reporteId: string, cohorte: string, formato: string}) => void} props.onGenerar
 */
export function crearReportPanel({ reportes, formatos, programas, anios, obtenerCohortes, onSeleccion, onGenerar }) {
  const elemento = document.createElement('section');
  elemento.className = 'card panel-reporte';
  elemento.setAttribute('aria-labelledby', 'titulo-generar-reporte');
  elemento.innerHTML = `
    <header class="panel-reporte__cabecera">
      <h2 class="panel-reporte__titulo" id="titulo-generar-reporte">Generar reporte</h2>
      <p class="panel-reporte__subtitulo">Elige un reporte para el programa y año seleccionados arriba</p>
    </header>

    <form class="panel-reporte__form" novalidate>
      <div class="campo campo--reporte">
        <label class="campo__etiqueta" for="select-reporte">Reporte</label>
        <select id="select-reporte" class="select" aria-describedby="descripcion-reporte">
          <option value="" selected disabled>Selecciona un reporte…</option>
          ${reportes.map((r) => `<option value="${r.id}">${r.nombre}</option>`).join('')}
        </select>
        <div class="campo__descripcion" id="descripcion-reporte" aria-live="polite">
          <span class="campo__texto">Selecciona un reporte para ver qué incluye.</span>
          <span class="etiqueta-aspecto" hidden></span>
        </div>
      </div>

      <div class="campo">
        <label class="campo__etiqueta" for="rp-programa">Programa</label>
        <select id="rp-programa" class="select">
          ${programas.map((p) => `<option value="${p}">${p}</option>`).join('')}
        </select>
      </div>

      <div class="campo">
        <label class="campo__etiqueta" for="rp-anio">Año</label>
        <select id="rp-anio" class="select">
          ${anios.map((a) => `<option value="${a}">${a}</option>`).join('')}
        </select>
      </div>

      <div class="campo">
        <label class="campo__etiqueta" for="select-cohorte">Cohorte (opcional)</label>
        <select id="select-cohorte" class="select"></select>
      </div>

      <fieldset class="campo campo--formato">
        <legend class="campo__etiqueta">Formato de salida</legend>
        <div class="segmentado">
          ${formatos
      .map(
        (f, i) => `
            <input type="radio" name="formato-salida" id="formato-${f.id}" value="${f.id}"${i === 0 ? ' checked' : ''} />
            <label for="formato-${f.id}">${f.etiqueta}</label>`,
      )
      .join('')}
        </div>
      </fieldset>

      <button type="submit" class="btn btn--primario panel-reporte__boton" id="btn-generar-reporte" disabled>
        Generar reporte
      </button>
    </form>

    <div class="resultado" id="resultado-reporte" aria-live="polite" hidden></div>
  `;

  const formulario = elemento.querySelector('form');
  const selectReporte = elemento.querySelector('#select-reporte');
  const selectCohorte = elemento.querySelector('#select-cohorte');
  const selectPrograma = elemento.querySelector('#rp-programa');
  const selectAnio = elemento.querySelector('#rp-anio');
  const textoDescripcion = elemento.querySelector('.campo__texto');
  const etiquetaAspecto = elemento.querySelector('.campo__descripcion .etiqueta-aspecto');
  const botonGenerar = elemento.querySelector('#btn-generar-reporte');
  const contenedorResultado = elemento.querySelector('#resultado-reporte');

  let graficaVista = null;

  const formatoSeleccionado = () => elemento.querySelector('input[name="formato-salida"]:checked').value;

  /* ---- Selección de reporte ---- */
  selectReporte.addEventListener('change', () => {
    const reporte = reportes.find((r) => r.id === selectReporte.value);
    if (!reporte) return;
    textoDescripcion.textContent = reporte.descripcion;
    etiquetaAspecto.textContent = reporte.aspecto;
    etiquetaAspecto.hidden = false;
    botonGenerar.disabled = false;
    limpiarResultado();
    onSeleccion(reporte.id);
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!selectReporte.value) return;
    onGenerar({
      reporteId: selectReporte.value,
      programa: selectPrograma.value,
      anio: Number(selectAnio.value),
      cohorte: selectCohorte.value,
      formato: formatoSeleccionado(),
    });
  });

  /* ---- Resultado ---- */
  function mostrar(html) {
    contenedorResultado.hidden = false;
    contenedorResultado.innerHTML = html;
  }

  function limpiarResultado() {
    destruirGrafica(graficaVista);
    graficaVista = null;
    contenedorResultado.hidden = true;
    contenedorResultado.innerHTML = '';
    botonGenerar.disabled = !selectReporte.value;
  }

  function mostrarCargando() {
    destruirGrafica(graficaVista);
    graficaVista = null;
    botonGenerar.disabled = true;
    mostrar(`
      <div class="aviso aviso--neutro" role="status">
        <span class="spinner" aria-hidden="true"></span>
        <span>Generando reporte…</span>
      </div>`);
  }

  function mostrarError(mensaje) {
    botonGenerar.disabled = !selectReporte.value;
    mostrar(`
      <div class="aviso aviso--error" role="alert">
        ${icono('alerta', 20)}
        <div>
          <strong>No se pudo generar el reporte.</strong>
          <p>${mensaje}</p>
        </div>
      </div>`);
  }

  function mostrarResultado(resultado) {
    botonGenerar.disabled = !selectReporte.value;

    if (resultado.estado === 'sin-datos') {
      mostrar(`
        <div class="aviso aviso--info" role="status">
          ${icono('info', 20)}
          <div>
            <strong>Sin datos para esta combinación.</strong>
            <p>No hay información de ${resultado.programa} en ${resultado.anio}${resultado.cohorte && resultado.cohorte !== 'todas' ? ` (cohorte ${resultado.cohorte})` : ''
        }. Prueba con otro año o programa.</p>
          </div>
        </div>`);
      return;
    }

    if (resultado.tipo === 'descarga') {
      mostrar(`
        <div class="aviso aviso--ok" role="status">
          ${icono('ok', 20)}
          <div>
            <strong>Reporte generado: ${resultado.nombre}, ${resultado.programa}, ${resultado.anio}.</strong>
            <p>Archivo: <code>${resultado.nombreArchivo}</code>. Simulación: todavía no se crea un archivo real.</p>
          </div>
        </div>`);
      return;
    }

    mostrarVistaPrevia(resultado);
  }

  function mostrarVistaPrevia(resultado) {
    const { columnas, filas, grafica } = resultado;
    const encabezados = columnas
      .map((c) => `<th scope="col"${c.tipo !== 'texto' ? ' class="num"' : ''}>${c.titulo}</th>`)
      .join('');
    const cuerpo = filas
      .map(
        (fila) =>
          `<tr>${columnas
            .map((c) => `<td${c.tipo !== 'texto' ? ' class="num"' : ''}>${FORMATEADORES_CELDA[c.tipo](fila[c.clave])}</td>`)
            .join('')}</tr>`,
      )
      .join('');

    mostrar(`
      <div class="vista">
        <header class="vista__cabecera">
          <div>
            <h3 class="vista__titulo">${resultado.nombre}</h3>
            <p class="vista__meta">${resultado.programa} · ${resultado.anio} · ${etiquetaCohorte(resultado.cohorte)} · Generado ${formatearFechaHora(resultado.generadoEn)}</p>
          </div>
          <span class="etiqueta-aspecto">${resultado.aspecto}</span>
        </header>
        <div class="vista__cuerpo">
          <div class="tabla-contenedor" tabindex="0" role="region" aria-label="Tabla del reporte ${resultado.nombre}">
            <table class="tabla">
              <thead><tr>${encabezados}</tr></thead>
              <tbody>${cuerpo}</tbody>
            </table>
          </div>
          <figure class="vista__grafica">
            <figcaption>${grafica.titulo}</figcaption>
            <div class="vista__lienzo"><canvas id="grafica-vista-previa" role="img" aria-label="${grafica.titulo}"></canvas></div>
          </figure>
        </div>
      </div>`);

    graficaVista = crearGrafica(contenedorResultado.querySelector('#grafica-vista-previa'), configuracionGrafica(grafica));
  }

  function configuracionGrafica(grafica) {
    if (grafica.tipo === 'dona') {
      return {
        type: 'doughnut',
        data: {
          labels: grafica.etiquetas,
          datasets: [
            {
              data: grafica.series[0].valores,
              backgroundColor: PALETA_CATEGORIAS,
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: OPCIONES_LEYENDA } },
      };
    }

    const variasSeries = grafica.series.length > 1;
    const colores = [COLORES.pizarra, COLORES.lima];
    return {
      type: 'bar',
      data: {
        labels: grafica.etiquetas,
        datasets: grafica.series.map((serie, i) => ({
          label: serie.nombre,
          data: serie.valores,
          backgroundColor: variasSeries ? colores[i] : COLORES.pizarra,
          borderRadius: 3,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: grafica.maximo,
            grid: { color: COLORES.rejilla },
            border: { display: false },
          },
          x: { grid: { display: false } },
        },
        plugins: { legend: { ...OPCIONES_LEYENDA, display: variasSeries } },
      },
    };
  }

  /* ---- Cohortes ---- */
  function actualizarCohortes() {
    const cohortes = obtenerCohortes
      ? obtenerCohortes({ programa: selectPrograma.value, anio: Number(selectAnio.value) })
      : [];
    const anterior = selectCohorte.value;
    selectCohorte.innerHTML = [
      '<option value="todas">Todas las cohortes</option>',
      ...cohortes.map((c) => `<option value="${c}">${c}</option>`),
    ].join('');
    if (cohortes.includes(anterior)) selectCohorte.value = anterior;
  }

  selectPrograma.addEventListener('change', actualizarCohortes);
  selectAnio.addEventListener('change', actualizarCohortes);
  actualizarCohortes(); // inicializar al montar

  function actualizarFiltros({ cohortes }) {
    const anterior = selectCohorte.value;
    selectCohorte.innerHTML = [
      '<option value="todas">Todas las cohortes</option>',
      ...cohortes.map((c) => `<option value="${c}">${c}</option>`),
    ].join('');
    if (cohortes.includes(anterior)) selectCohorte.value = anterior;
  }

  return { elemento, actualizarFiltros, limpiarResultado, mostrarCargando, mostrarResultado, mostrarError };
}