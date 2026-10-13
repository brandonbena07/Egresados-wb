import { crearSidebar } from '../components/sidebar.js';
import { crearHeader } from '../components/header.js';
import { crearKpiCards } from '../components/kpiCards.js';
import { crearReportPanel } from '../components/reportPanel.js';
import { crearChartsPanel } from '../components/chartsPanel.js';
import {
  listarProgramas,
  listarAnios,
  listarReportes,
  listarFormatos,
  listarCohortes,
  obtenerMetricasDashboard,
  generarReporteSimulado,
  exportarTablero,
} from '../services/dashboardService.js';
import { descargarArchivo } from '../utils/descargas.js';
import { icono } from '../utils/iconos.js';

/**
 * Orquesta la pantalla: ensambla los componentes y mantiene el estado del tablero.
 * Los componentes no se conocen entre sí; solo hablan con esta página.
 *
 * @param {HTMLElement} contenedor
 * @param {object} [opciones]
 * @param {{ nombre: string, rol: string }} [opciones.usuario]  usuario con sesión iniciada
 * @param {() => void} [opciones.onCerrarSesion]
 * @returns {{ desmontar: () => void }}
 */
export function montarDashboardPage(contenedor, { usuario, onCerrarSesion } = {}) {
  /* ---- Estado global del tablero ---- */
  const programas = listarProgramas();
  const anios = listarAnios();
  const estado = {
    programa: programas[0],
    anio: anios[0],
    reporteId: null,
  };
  let solicitudActual = 0; // evita mostrar un reporte viejo si cambian los filtros mientras carga

  /* ---- Componentes ---- */
  const sidebar = crearSidebar({ usuario, onCerrarSesion });
  const kpis = crearKpiCards();
  const graficas = crearChartsPanel();
  const panelReporte = crearReportPanel({
    reportes: listarReportes(),
    formatos: listarFormatos(),
    onSeleccion: (reporteId) => {
      estado.reporteId = reporteId;
    },
    onGenerar: manejarGenerar,
  });
  const header = crearHeader({
    programas,
    anios,
    programa: estado.programa,
    anio: estado.anio,
    onCambio: ({ programa, anio }) => {
      estado.programa = programa;
      estado.anio = anio;
      actualizarTablero();
    },
    onExportar: manejarExportar,
    onAlternarMenu: sidebar.alternar,
  });

  const estadoVacio = document.createElement('section');
  estadoVacio.className = 'card estado-vacio';
  estadoVacio.hidden = true;
  estadoVacio.setAttribute('role', 'status');

  /* ---- Ensamblado ---- */
  contenedor.innerHTML = '';
  const app = document.createElement('div');
  app.className = 'app';
  const principal = document.createElement('main');
  principal.className = 'app__principal';
  principal.append(
    header.elemento,
    kpis.elemento,
    estadoVacio,
    panelReporte.elemento,
    graficas.elemento,
  );
  app.append(sidebar.elemento, principal);
  contenedor.append(app);

  /* ---- Acciones ---- */
  function actualizarTablero() {
    solicitudActual += 1; // invalida cualquier reporte en curso
    const metricas = obtenerMetricasDashboard(estado);

    kpis.actualizar(metricas);
    graficas.actualizar(metricas);
    header.habilitarExportar(Boolean(metricas));

    estadoVacio.hidden = Boolean(metricas);
    if (!metricas) {
      estadoVacio.innerHTML = `
        ${icono('info', 24)}
        <div>
          <h2>Sin datos para esta combinación</h2>
          <p>No hay información de ${estado.programa} en ${estado.anio}. Elige otro año o programa.</p>
        </div>`;
    }

    panelReporte.actualizarFiltros({
      programa: estado.programa,
      anio: estado.anio,
      cohortes: listarCohortes(estado),
    });
    panelReporte.limpiarResultado();
  }

  async function manejarGenerar({ reporteId, cohorte, formato }) {
    const solicitud = ++solicitudActual;
    panelReporte.mostrarCargando();
    try {
      const resultado = await generarReporteSimulado({
        reporteId,
        programa: estado.programa,
        anio: estado.anio,
        cohorte,
        formato,
      });
      if (solicitud === solicitudActual) panelReporte.mostrarResultado(resultado);
    } catch (error) {
      if (solicitud === solicitudActual) panelReporte.mostrarError(error.message);
    }
  }

  function manejarExportar() {
    const archivo = exportarTablero(estado);
    if (archivo) descargarArchivo(archivo);
  }

  actualizarTablero();

  return {
    desmontar() {
      graficas.destruir();
    },
  };
}