/**
 * Funciones puras de formato. No tocan el DOM ni leen estado externo.
 *
 * Los números usan separador de miles con coma y decimal con punto (2,847 y 78.4%)
 * para coincidir con la pantalla actual. Si prefieres el formato colombiano
 * (2.847 y 78,4%), cambia LOCALE_NUMEROS a 'es-CO'.
 */
const LOCALE_NUMEROS = 'en-US';
const LOCALE_TEXTO = 'es-CO';

const esNumero = (valor) => typeof valor === 'number' && Number.isFinite(valor);

/** 2847 -> "2,847" */
export function formatearNumero(valor) {
  if (!esNumero(valor)) return '—';
  return new Intl.NumberFormat(LOCALE_NUMEROS).format(valor);
}

/** 78.4 -> "78.4%" (el valor ya viene en escala 0-100) */
export function formatearPorcentaje(valor, decimales = 1) {
  if (!esNumero(valor)) return '—';
  const numero = new Intl.NumberFormat(LOCALE_NUMEROS, {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor);
  return `${numero}%`;
}

/** 2.1 -> "+2.1%", -0.8 -> "-0.8%" */
export function formatearVariacion(valor, decimales = 1) {
  if (!esNumero(valor)) return '—';
  const signo = valor > 0 ? '+' : '';
  return `${signo}${formatearPorcentaje(valor, decimales)}`;
}

/** Fecha y hora legibles en español de Colombia. */
export function formatearFechaHora(fecha = new Date()) {
  return new Intl.DateTimeFormat(LOCALE_TEXTO, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(fecha);
}

/** "todas" -> "Todas las cohortes"; "2024" -> "Cohorte 2024" */
export function etiquetaCohorte(cohorte) {
  if (!cohorte || cohorte === 'todas') return 'Todas las cohortes';
  return `Cohorte ${cohorte}`;
}

/** "Ingeniería de Sistemas" -> "ingenieria-de-sistemas" */
export function aSlug(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Redondea a un decimal sin errores de coma flotante. */
export function redondear1(valor) {
  return Math.round(valor * 10) / 10;
}

/** Porcentaje de una parte sobre un total, con un decimal. */
export function porcentajeDe(parte, total) {
  if (!esNumero(parte) || !esNumero(total) || total === 0) return 0;
  return redondear1((parte / total) * 100);
}