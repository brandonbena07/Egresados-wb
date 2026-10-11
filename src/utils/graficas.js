/** Utilidades compartidas para Chart.js (cargado por CDN como window.Chart). */

export const COLORES = {
  pizarra: '#3e4f5f',
  lima: '#c5d92d',
  azul: '#00a3e0',
  rojo: '#e5484d',
  grisClaro: '#8aa0b4',
  ambar: '#f0b429',
  texto: '#4a5a68',
  rejilla: '#e6eaee',
};

/** Colores para series categóricas, en orden de uso. */
export const PALETA_CATEGORIAS = [
  COLORES.azul,
  COLORES.lima,
  COLORES.pizarra,
  COLORES.rojo,
  COLORES.grisClaro,
  COLORES.ambar,
];

let configuracionAplicada = false;

function aplicarConfiguracionGlobal() {
  if (configuracionAplicada) return;
  const { Chart } = window;
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
  Chart.defaults.color = COLORES.texto;
  configuracionAplicada = true;
}

/**
 * Crea una gráfica. Si Chart.js no cargó (sin internet, CDN bloqueado),
 * muestra un mensaje en lugar de romper la pantalla.
 */
export function crearGrafica(lienzo, configuracion) {
  if (typeof window.Chart === 'undefined') {
    const mensaje = document.createElement('p');
    mensaje.className = 'grafica__error';
    mensaje.textContent = 'No se pudo cargar la librería de gráficas. Revisa tu conexión a internet.';
    lienzo.replaceWith(mensaje);
    return null;
  }
  aplicarConfiguracionGlobal();
  return new window.Chart(lienzo, configuracion);
}

export function destruirGrafica(grafica) {
  if (grafica) grafica.destroy();
}

export const OPCIONES_LEYENDA = {
  position: 'bottom',
  labels: { usePointStyle: true, pointStyle: 'rect', boxWidth: 10, boxHeight: 10, padding: 16 },
};