import { formatearNumero, formatearPorcentaje, formatearVariacion } from '../utils/formatters.js';
import { icono } from '../utils/iconos.js';

const FORMATEADORES = {
  numero: formatearNumero,
  porcentaje: (valor) => formatearPorcentaje(valor, 1),
};

function htmlDetalle(detalle) {
  switch (detalle.tipo) {
    case 'etiqueta':
      return `<span class="kpi__etiqueta">${detalle.texto}</span>`;
    case 'variacion': {
      const sube = detalle.valor >= 0;
      return `<p class="kpi__detalle kpi__detalle--${sube ? 'sube' : 'baja'}">
        ${icono(sube ? 'sube' : 'baja', 16)}
        <span>${formatearVariacion(detalle.valor)} ${detalle.texto}</span>
      </p>`;
    }
    case 'conteo':
      return `<p class="kpi__detalle">${formatearNumero(detalle.valor)} ${detalle.texto}</p>`;
    default:
      return `<p class="kpi__detalle">${detalle.texto}</p>`;
  }
}

/**
 * Fila de 4 tarjetas de indicadores.
 * Devuelve { elemento, actualizar(metricas) }. Con metricas = null se oculta.
 */
export function crearKpiCards() {
  const elemento = document.createElement('section');
  elemento.className = 'kpis';
  elemento.setAttribute('aria-label', 'Indicadores principales');

  function actualizar(metricas) {
    elemento.hidden = !metricas;
    if (!metricas) {
      elemento.innerHTML = '';
      return;
    }
    elemento.innerHTML = metricas.kpis
      .map(
        (kpi) => `
        <article class="card kpi kpi--${kpi.color}">
          <h2 class="kpi__titulo">${kpi.titulo}</h2>
          <p class="kpi__valor">${FORMATEADORES[kpi.formato](kpi.valor)}</p>
          ${htmlDetalle(kpi.detalle)}
        </article>`,
      )
      .join('');
  }

  return { elemento, actualizar };
}