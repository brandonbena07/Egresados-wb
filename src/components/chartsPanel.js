import { formatearPorcentaje } from '../utils/formatters.js';
import { COLORES, OPCIONES_LEYENDA, crearGrafica, destruirGrafica } from '../utils/graficas.js';

/**
 * Las dos gráficas del tablero (Chart.js):
 *  - barras agrupadas: empleabilidad por cohorte (Aspecto 38)
 *  - dona: apreciación de la formación (Aspecto 39)
 * Devuelve { elemento, actualizar(metricas), destruir() }.
 */
export function crearChartsPanel() {
  const elemento = document.createElement('section');
  elemento.className = 'graficas';
  elemento.setAttribute('aria-label', 'Gráficas de seguimiento');
  elemento.innerHTML = `
    <article class="card grafica">
      <header class="grafica__cabecera">
        <div>
          <h2 class="grafica__titulo">Tasa de Empleabilidad por Cohorte de Graduación</h2>
          <p class="grafica__subtitulo">Indicador requerido para el Aspecto 38 (Desarrollo Profesional)</p>
        </div>
        <span class="etiqueta-aspecto">Aspecto 38</span>
      </header>
      <div class="grafica__lienzo">
        <canvas id="grafica-empleabilidad" role="img" aria-label="Gráfica de barras de empleabilidad por cohorte"></canvas>
      </div>
    </article>

    <article class="card grafica">
      <header class="grafica__cabecera">
        <div>
          <h2 class="grafica__titulo">Apreciación de la Formación</h2>
          <p class="grafica__subtitulo">Insumo para mejora curricular</p>
        </div>
        <span class="etiqueta-aspecto">Aspecto 39</span>
      </header>
      <div class="grafica__lienzo">
        <canvas id="grafica-apreciacion" role="img" aria-label="Gráfica de dona de apreciación de la formación"></canvas>
      </div>
    </article>
  `;

  let graficaBarras = null;
  let graficaDona = null;

  function destruir() {
    destruirGrafica(graficaBarras);
    destruirGrafica(graficaDona);
    graficaBarras = null;
    graficaDona = null;
  }

  function actualizar(metricas) {
    destruir();
    elemento.hidden = !metricas;
    if (!metricas) return;

    const { empleabilidad, apreciacion } = metricas.graficas;
    const colores = [COLORES.pizarra, COLORES.lima];

    elemento.querySelector('#grafica-empleabilidad').setAttribute(
      'aria-label',
      `Empleabilidad por cohorte, ${metricas.programa} ${metricas.anio}. ` +
        empleabilidad.etiquetas
          .map((c, i) => `${c}: ${formatearPorcentaje(empleabilidad.series[0].valores[i])} empleados`)
          .join('; '),
    );
    elemento.querySelector('#grafica-apreciacion').setAttribute(
      'aria-label',
      `Apreciación de la formación. ` +
        apreciacion.etiquetas.map((e, i) => `${e}: ${formatearPorcentaje(apreciacion.valores[i], 0)}`).join('; '),
    );

    graficaBarras = crearGrafica(elemento.querySelector('#grafica-empleabilidad'), {
      type: 'bar',
      data: {
        labels: empleabilidad.etiquetas,
        datasets: empleabilidad.series.map((serie, i) => ({
          label: serie.nombre,
          data: serie.valores,
          backgroundColor: colores[i],
          borderRadius: 3,
          categoryPercentage: 0.8,
          barPercentage: 0.9,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: { stepSize: 10, callback: (v) => `${v}%` },
            grid: { color: COLORES.rejilla },
            border: { display: false },
          },
          x: { grid: { display: false } },
        },
        plugins: {
          legend: OPCIONES_LEYENDA,
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${formatearPorcentaje(ctx.parsed.y)}`,
            },
          },
        },
      },
    });

    graficaDona = crearGrafica(elemento.querySelector('#grafica-apreciacion'), {
      type: 'doughnut',
      data: {
        labels: apreciacion.etiquetas,
        datasets: [
          {
            data: apreciacion.valores,
            backgroundColor: [COLORES.azul, COLORES.lima, COLORES.pizarra, COLORES.rojo],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: OPCIONES_LEYENDA,
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.label}: ${formatearPorcentaje(ctx.parsed, 0)}` },
          },
        },
      },
    });
  }

  return { elemento, actualizar, destruir };
}