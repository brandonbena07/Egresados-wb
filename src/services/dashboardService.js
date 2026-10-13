/**
 * Servicio del Tablero. Aquí vive la lógica de datos.
 * Regla: este archivo NO manipula el DOM ni crea HTML.
 */
import {
  PROGRAMAS,
  ANIOS,
  DATOS,
  REPORTES,
  KPI_DEFINICIONES,
  DISTRIBUCIONES,
  FORMATOS_SALIDA,
  CATEGORIAS_APRECIACION,
} from '../data/dashboardData.js';
import { aSlug, etiquetaCohorte, porcentajeDe, redondear1 } from '../utils/formatters.js';

const RETARDO_MS = { pantalla: 500, excel: 900, pdf: 900 };

/* ------------------------------------------------------------------ */
/* Consultas simples                                                   */
/* ------------------------------------------------------------------ */
export const listarProgramas = () => [...PROGRAMAS];
export const listarAnios = () => [...ANIOS];
export const listarFormatos = () => FORMATOS_SALIDA.map((f) => ({ ...f }));
export const listarReportes = () => REPORTES.map((r) => ({ ...r }));

const obtenerPeriodo = (programa, anio) => DATOS[programa]?.[anio] ?? null;

/** Cohortes disponibles (etiquetas) para el programa y año. */
export function listarCohortes({ programa, anio }) {
  const periodo = obtenerPeriodo(programa, anio);
  return periodo ? periodo.cohortes.map((c) => c.etiqueta) : [];
}

/* ------------------------------------------------------------------ */
/* Métricas del tablero                                                */
/* ------------------------------------------------------------------ */
/**
 * Devuelve las 4 tarjetas y los datos de las 2 gráficas para un programa y año.
 * Retorna null si no hay datos para esa combinación.
 */
export function obtenerMetricasDashboard({ programa, anio }) {
  const periodo = obtenerPeriodo(programa, anio);
  if (!periodo) return null;

  const k = periodo.kpis;
  const valores = {
    total: k.totalEgresados,
    empleabilidad: k.tasaEmpleabilidad,
    seguimiento: k.seguimientoVigente,
    posgrado: k.formacionPosgradual,
  };
  const detalles = {
    total: { tipo: 'etiqueta', texto: 'Población total' },
    empleabilidad: { tipo: 'variacion', valor: k.variacionEmpleabilidad, texto: 'vs semestre anterior' },
    seguimiento: { tipo: 'conteo', valor: k.encuestasValidadas, texto: 'encuestas validadas' },
    posgrado: { tipo: 'texto', texto: 'Egresados con posgrado' },
  };

  return {
    programa,
    anio,
    kpis: KPI_DEFINICIONES.map((def) => ({
      ...def,
      valor: valores[def.id],
      detalle: detalles[def.id],
    })),
    graficas: {
      empleabilidad: {
        etiquetas: periodo.cohortes.map((c) => c.etiqueta),
        series: [
          { nombre: '% Empleados', valores: periodo.cohortes.map((c) => c.empleados) },
          { nombre: '% Independientes', valores: periodo.cohortes.map((c) => c.independientes) },
        ],
      },
      apreciacion: {
        etiquetas: [...CATEGORIAS_APRECIACION],
        valores: [...periodo.apreciacion],
      },
    },
  };
}

/* ------------------------------------------------------------------ */
/* Reportes                                                            */
/* ------------------------------------------------------------------ */
/** Reparte un total entre categorías según pesos, sin perder unidades por redondeo. */
function repartir(total, pesos) {
  const suma = pesos.reduce((a, b) => a + b, 0);
  const crudos = pesos.map((p) => (total * p) / suma);
  const enteros = crudos.map(Math.floor);
  let faltan = total - enteros.reduce((a, b) => a + b, 0);
  const ordenados = crudos
    .map((valor, i) => ({ i, resto: valor - enteros[i] }))
    .sort((a, b) => b.resto - a.resto);
  for (let j = 0; faltan > 0 && j < ordenados.length; j += 1, faltan -= 1) {
    enteros[ordenados[j].i] += 1;
  }
  return enteros;
}

const col = (clave, titulo, tipo = 'texto') => ({ clave, titulo, tipo });

/** Prepara las cifras base (filtradas por cohorte) que usan todos los reportes. */
function crearContexto({ programa, anio, cohorte }) {
  const periodo = obtenerPeriodo(programa, anio);
  if (!periodo) return null;

  const todas = !cohorte || cohorte === 'todas';
  const cohortes = todas ? periodo.cohortes : periodo.cohortes.filter((c) => c.etiqueta === cohorte);
  if (cohortes.length === 0) return null;

  const k = periodo.kpis;
  const base = todas ? k.totalEgresados : cohortes[0].egresados;
  const factor = base / k.totalEgresados;
  const tasa = todas ? k.tasaEmpleabilidad : cohortes[0].empleados + cohortes[0].independientes;

  return {
    periodo,
    cohortes,
    base,
    validadas: Math.round(k.encuestasValidadas * factor),
    empleados: Math.round((base * tasa) / 100),
    conPosgrado: Math.round((base * k.formacionPosgradual) / 100),
  };
}

function filasDistribucion(variable, categorias, conteos, total) {
  return categorias.map((categoria, i) => ({
    variable,
    categoria,
    egresados: conteos[i],
    porcentaje: porcentajeDe(conteos[i], total),
  }));
}

const CONSTRUCTORES = {
  general(ctx) {
    const k = ctx.periodo.kpis;
    const filas = [
      { indicador: 'Total egresados', valor: k.totalEgresados, porcentaje: 100 },
      { indicador: 'Tasa de empleabilidad', valor: k.tasaEmpleabilidad, porcentaje: k.tasaEmpleabilidad },
      { indicador: 'Seguimiento vigente', valor: k.seguimientoVigente, porcentaje: k.seguimientoVigente },
      { indicador: 'Formación posgradual', valor: k.formacionPosgradual, porcentaje: k.formacionPosgradual },
      { indicador: 'Encuestas validadas', valor: k.encuestasValidadas, porcentaje: porcentajeDe(k.encuestasValidadas, k.totalEgresados) },
    ];
    return {
      columnas: [
        col('indicador', 'Indicador'),
        col('valor', 'Valor', 'numero'),
        col('porcentaje', 'Porcentaje (%)', 'porcentaje'),
      ],
      filas,
      grafica: {
        tipo: 'barras',
        titulo: 'Indicadores generales del programa',
        etiquetas: filas.map((f) => f.indicador),
        series: [{ nombre: '% / Total', valores: filas.map((f) => f.porcentaje) }],
        maximo: 100,
      },
    };
  },

  perfil(ctx) {
    const { ubicacion, estrato } = DISTRIBUCIONES;
    const mujeres = ctx.periodo.mujeres;
    const generoCategorias = ['Masculino', 'Femenino', 'Otro'];
    const generoConteos = repartir(ctx.base, [1 - mujeres - 0.01, mujeres, 0.01]);
    const ubicacionConteos = repartir(ctx.base, ubicacion.pesos);
    const estratoConteos = repartir(ctx.base, estrato.pesos);
    return {
      columnas: [
        col('variable', 'Variable'),
        col('categoria', 'Categoría'),
        col('egresados', 'Egresados', 'numero'),
        col('porcentaje', 'Porcentaje', 'porcentaje'),
      ],
      filas: [
        ...filasDistribucion('Género', generoCategorias, generoConteos, ctx.base),
        ...filasDistribucion('Residencia', ubicacion.categorias, ubicacionConteos, ctx.base),
        ...filasDistribucion('Estrato', estrato.categorias, estratoConteos, ctx.base),
      ],
      grafica: {
        tipo: 'dona',
        titulo: 'Egresados por género',
        etiquetas: generoCategorias,
        series: [{ nombre: 'Egresados', valores: generoConteos }],
      },
    };
  },

  empleabilidad(ctx) {
    return {
      columnas: [
        col('cohorte', 'Cohorte'),
        col('egresados', 'Egresados', 'numero'),
        col('empleados', 'Empleados', 'porcentaje'),
        col('independientes', 'Independientes', 'porcentaje'),
        col('sinVinculo', 'Sin vínculo laboral', 'porcentaje'),
      ],
      filas: ctx.cohortes.map((c) => ({
        cohorte: c.etiqueta,
        egresados: c.egresados,
        empleados: c.empleados,
        independientes: c.independientes,
        sinVinculo: redondear1(100 - c.empleados - c.independientes),
      })),
      grafica: {
        tipo: 'barras',
        titulo: 'Empleabilidad por cohorte (%)',
        etiquetas: ctx.cohortes.map((c) => c.etiqueta),
        series: [
          { nombre: '% Empleados', valores: ctx.cohortes.map((c) => c.empleados) },
          { nombre: '% Independientes', valores: ctx.cohortes.map((c) => c.independientes) },
        ],
        maximo: 100,
      },
    };
  },

  'calidad-empleo'(ctx) {
    const { categorias, pesos } = DISTRIBUCIONES.ingresos;
    const conteos = repartir(ctx.empleados, pesos);
    return {
      columnas: [
        col('rango', 'Ingreso mensual'),
        col('egresados', 'Egresados empleados', 'numero'),
        col('porcentaje', 'Porcentaje', 'porcentaje'),
      ],
      filas: categorias.map((rango, i) => ({
        rango,
        egresados: conteos[i],
        porcentaje: porcentajeDe(conteos[i], ctx.empleados),
      })),
      grafica: {
        tipo: 'barras',
        titulo: 'Egresados empleados por rango de ingreso',
        etiquetas: categorias,
        series: [{ nombre: 'Egresados', valores: conteos }],
      },
    };
  },

  posgrado(ctx) {
    const { categorias, pesos } = DISTRIBUCIONES.nivelesPosgrado;
    const conteos = repartir(ctx.conPosgrado, pesos);
    return {
      columnas: [
        col('nivel', 'Nivel alcanzado'),
        col('egresados', 'Egresados', 'numero'),
        col('porcentaje', '% de quienes tienen posgrado', 'porcentaje'),
      ],
      filas: categorias.map((nivel, i) => ({
        nivel,
        egresados: conteos[i],
        porcentaje: porcentajeDe(conteos[i], ctx.conPosgrado),
      })),
      grafica: {
        tipo: 'dona',
        titulo: 'Nivel de posgrado alcanzado',
        etiquetas: categorias,
        series: [{ nombre: 'Egresados', valores: conteos }],
      },
    };
  },

  apreciacion(ctx) {
    const conteos = repartir(ctx.validadas, ctx.periodo.apreciacion);
    return {
      columnas: [
        col('valoracion', 'Valoración'),
        col('encuestas', 'Encuestas', 'numero'),
        col('porcentaje', 'Porcentaje', 'porcentaje'),
      ],
      filas: CATEGORIAS_APRECIACION.map((valoracion, i) => ({
        valoracion,
        encuestas: conteos[i],
        porcentaje: porcentajeDe(conteos[i], ctx.validadas),
      })),
      grafica: {
        tipo: 'dona',
        titulo: 'Apreciación de la formación',
        etiquetas: [...CATEGORIAS_APRECIACION],
        series: [{ nombre: 'Encuestas', valores: conteos }],
      },
    };
  },

  impacto(ctx) {
    const { categorias, pesos } = DISTRIBUCIONES.impacto;
    const conteos = pesos.map((p) => Math.round(ctx.validadas * p));
    return {
      columnas: [
        col('indicador', 'Indicador de impacto'),
        col('egresados', 'Egresados', 'numero'),
        col('porcentaje', '% de encuestas validadas', 'porcentaje'),
      ],
      filas: categorias.map((indicador, i) => ({
        indicador,
        egresados: conteos[i],
        porcentaje: porcentajeDe(conteos[i], ctx.validadas),
      })),
      grafica: {
        tipo: 'barras',
        titulo: 'Egresados por indicador de impacto',
        etiquetas: categorias,
        series: [{ nombre: 'Egresados', valores: conteos }],
      },
    };
  },

  empleadores(ctx) {
    const { categorias, pesos } = DISTRIBUCIONES.sectores;
    const conteos = repartir(ctx.empleados, pesos);
    return {
      columnas: [
        col('sector', 'Sector económico'),
        col('empresas', 'Empresas registradas', 'numero'),
        col('egresados', 'Egresados vinculados', 'numero'),
      ],
      filas: categorias.map((sector, i) => ({
        sector,
        empresas: Math.max(1, Math.round(conteos[i] * 0.6)),
        egresados: conteos[i],
      })),
      grafica: {
        tipo: 'barras',
        titulo: 'Egresados vinculados por sector',
        etiquetas: categorias,
        series: [{ nombre: 'Egresados', valores: conteos }],
      },
    };
  },

  capacitacion(ctx) {
    const { categorias, pesos } = DISTRIBUCIONES.temasCapacitacion;
    const interesados = Math.round(ctx.validadas * 0.6);
    const conteos = repartir(interesados, pesos);
    return {
      columnas: [
        col('tema', 'Tema de capacitación'),
        col('interesados', 'Egresados interesados', 'numero'),
        col('porcentaje', 'Porcentaje', 'porcentaje'),
      ],
      filas: categorias.map((tema, i) => ({
        tema,
        interesados: conteos[i],
        porcentaje: porcentajeDe(conteos[i], interesados),
      })),
      grafica: {
        tipo: 'barras',
        titulo: 'Temas más solicitados',
        etiquetas: categorias,
        series: [{ nombre: 'Egresados', valores: conteos }],
      },
    };
  },

  cobertura(ctx) {
    const { correoValido, celularValido, camposCompletos } = DISTRIBUCIONES.cobertura;
    const indicadores = [
      ['Con encuesta vigente', ctx.validadas],
      ['Con correo válido', Math.round(ctx.base * correoValido)],
      ['Con celular válido', Math.round(ctx.base * celularValido)],
      ['Con campos obligatorios completos', Math.round(ctx.validadas * camposCompletos)],
      ['Sin encuesta vigente', ctx.base - ctx.validadas],
    ];
    return {
      columnas: [
        col('indicador', 'Indicador'),
        col('egresados', 'Egresados', 'numero'),
        col('porcentaje', '% del total', 'porcentaje'),
      ],
      filas: indicadores.map(([indicador, egresados]) => ({
        indicador,
        egresados,
        porcentaje: porcentajeDe(egresados, ctx.base),
      })),
      grafica: {
        tipo: 'barras',
        titulo: 'Cobertura del dato (% del total)',
        etiquetas: indicadores.map(([nombre]) => nombre),
        series: [
          { nombre: '% del total', valores: indicadores.map(([, n]) => porcentajeDe(n, ctx.base)) },
        ],
        maximo: 100,
      },
    };
  },
};

function nombreArchivo({ reporteId, programa, anio, cohorte, extension }) {
  const partes = ['reporte', reporteId, aSlug(programa), anio];
  if (cohorte && cohorte !== 'todas') partes.push(`cohorte-${cohorte}`);
  return `${partes.join('-')}.${extension}`;
}

/**
 * Simula la generación de un reporte.
 *  - formato "pantalla": devuelve columnas, filas y datos de gráfica para la vista previa.
 *  - formato "excel" o "pdf": simula la descarga y devuelve el nombre del archivo.
 * Lanza un Error si el reporte o el formato no existen.
 */
export async function generarReporteSimulado({ reporteId, programa, anio, cohorte = 'todas', formato = 'pantalla' }) {
  const reporte = REPORTES.find((r) => r.id === reporteId);
  if (!reporte) throw new Error(`El reporte "${reporteId}" no existe.`);

  const formatoElegido = FORMATOS_SALIDA.find((f) => f.id === formato);
  if (!formatoElegido) throw new Error(`El formato "${formato}" no es válido.`);

  await new Promise((resolver) => setTimeout(resolver, RETARDO_MS[formato] ?? 600));

  const ctx = crearContexto({ programa, anio, cohorte });
  if (!ctx) return { estado: 'sin-datos', programa, anio, cohorte };

  const resumen = {
    reporteId,
    nombre: reporte.nombre,
    aspecto: reporte.aspecto,
    programa,
    anio,
    cohorte,
    etiquetaCohorte: etiquetaCohorte(cohorte),
    formato,
    generadoEn: new Date(),
  };

  if (formatoElegido.extension) {
    return {
      estado: 'ok',
      tipo: 'descarga',
      ...resumen,
      nombreArchivo: nombreArchivo({ reporteId, programa, anio, cohorte, extension: formatoElegido.extension }),
    };
  }

  const { columnas, filas, grafica } = CONSTRUCTORES[reporteId](ctx);
  return { estado: 'ok', tipo: 'vista', ...resumen, columnas, filas, grafica };
}

/* ------------------------------------------------------------------ */
/* Exportar tablero                                                    */
/* ------------------------------------------------------------------ */
const escaparCsv = (valor) => {
  const texto = String(valor ?? '');
  return /[";\n]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto;
};

/**
 * Prepara el contenido (CSV separado por punto y coma, apto para Excel en español)
 * con lo que se ve en el tablero: indicadores, empleabilidad por cohorte y apreciación.
 * Retorna null si no hay datos.
 */
export function exportarTablero({ programa, anio }) {
  const metricas = obtenerMetricasDashboard({ programa, anio });
  if (!metricas) return null;

  const lineas = [
    ['Tablero de seguimiento a egresados'],
    ['Programa', programa],
    ['Año', anio],
    [],
    ['Indicador', 'Valor'],
    ...metricas.kpis.map((k) => [k.titulo, k.valor]),
    [],
    ['Cohorte', ...metricas.graficas.empleabilidad.series.map((s) => s.nombre)],
    ...metricas.graficas.empleabilidad.etiquetas.map((etiqueta, i) => [
      etiqueta,
      ...metricas.graficas.empleabilidad.series.map((s) => s.valores[i]),
    ]),
    [],
    ['Apreciación de la formación', '%'],
    ...metricas.graficas.apreciacion.etiquetas.map((etiqueta, i) => [
      etiqueta,
      metricas.graficas.apreciacion.valores[i],
    ]),
  ];

  return {
    nombre: `tablero-${aSlug(programa)}-${anio}.csv`,
    tipoMime: 'text/csv;charset=utf-8',
    // ﻿ (BOM) para que Excel reconozca las tildes
    contenido: `﻿${lineas.map((fila) => fila.map(escaparCsv).join(';')).join('\n')}`,
  };
}