/**
 * Datos de prueba del Tablero (SIGE - UCC).
 * Cuando exista backend, este archivo se reemplaza por llamadas a la API
 * sin tocar los componentes: solo cambia dashboardService.js.
 */
import { redondear1 } from '../utils/formatters.js';

/* ------------------------------------------------------------------ */
/* Catálogos básicos                                                   */
/* ------------------------------------------------------------------ */
export const PROGRAMAS = [
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Ingeniería Civil',
  'Ingeniería Ambiental',
];

export const ANIOS = [2026, 2025, 2024];

export const FORMATOS_SALIDA = [
  { id: 'pantalla', etiqueta: 'Ver en pantalla', extension: null },
  { id: 'excel', etiqueta: 'Excel', extension: 'xlsx' },
  { id: 'pdf', etiqueta: 'PDF', extension: 'pdf' },
];

/* ------------------------------------------------------------------ */
/* Definición de las 4 tarjetas de indicadores                         */
/* ------------------------------------------------------------------ */
export const KPI_DEFINICIONES = [
  { id: 'total', titulo: 'Total egresados', formato: 'numero', color: 'pizarra' },
  { id: 'empleabilidad', titulo: 'Tasa de empleabilidad', formato: 'porcentaje', color: 'lima' },
  { id: 'seguimiento', titulo: 'Seguimiento vigente', formato: 'porcentaje', color: 'azul' },
  { id: 'posgrado', titulo: 'Formación posgradual', formato: 'porcentaje', color: 'azul' },
];

/* ------------------------------------------------------------------ */
/* Los 9 reportes que se pueden generar                                */
/* ------------------------------------------------------------------ */
export const REPORTES = [
  {
    id: 'perfil',
    nombre: 'Perfil de egresados',
    aspecto: 'Aspecto 38',
    descripcion: 'Género, ubicación de residencia y estrato de los egresados del programa.',
  },
  {
    id: 'empleabilidad',
    nombre: 'Empleabilidad',
    aspecto: 'Aspecto 38',
    descripcion: '% de egresados que trabaja, por cohorte, como empleado o independiente.',
  },
  {
    id: 'calidad-empleo',
    nombre: 'Calidad del empleo',
    aspecto: 'Aspecto 38',
    descripcion: 'Distribución del ingreso mensual de los egresados empleados, en SMMLV.',
  },
  {
    id: 'posgrado',
    nombre: 'Formación posgradual',
    aspecto: 'Aspecto 38',
    descripcion: 'Egresados con posgrado y nivel alcanzado: especialización, maestría o doctorado.',
  },
  {
    id: 'apreciacion',
    nombre: 'Apreciación de la formación',
    aspecto: 'Aspecto 39',
    descripcion: 'Cómo califican los egresados la formación recibida, de excelente a deficiente.',
  },
  {
    id: 'impacto',
    nombre: 'Impacto en el medio',
    aspecto: 'Aspecto 40',
    descripcion:
      'Asociaciones, aportes significativos, reconocimientos, producción intelectual y emprendimiento.',
  },
  {
    id: 'empleadores',
    nombre: 'Mapa de empleadores',
    aspecto: 'Aspecto 41 (apoyo)',
    descripcion: 'Sectores donde trabajan los egresados y número de empresas registradas por sector.',
  },
  {
    id: 'capacitacion',
    nombre: 'Demanda de capacitación',
    aspecto: 'Extensión y Alumni',
    descripcion: 'Temas de capacitación que los egresados piden a la universidad.',
  },
  {
    id: 'cobertura',
    nombre: 'Cobertura y calidad del dato',
    aspecto: 'Aspecto 38',
    descripcion:
      '% de egresados con encuesta vigente, correo y celular válidos, y campos obligatorios completos.',
  },
];

/* ------------------------------------------------------------------ */
/* Distribuciones de apoyo para los reportes (pesos que suman 1)       */
/* ------------------------------------------------------------------ */
export const DISTRIBUCIONES = {
  ubicacion: {
    categorias: ['Medellín', 'Bogotá', 'Cali', 'Bucaramanga', 'Otras ciudades de Colombia', 'Exterior'],
    pesos: [0.28, 0.22, 0.14, 0.12, 0.21, 0.03],
  },
  estrato: {
    categorias: ['Estrato 1', 'Estrato 2', 'Estrato 3', 'Estrato 4', 'Estrato 5', 'Estrato 6'],
    pesos: [0.12, 0.34, 0.31, 0.15, 0.06, 0.02],
  },
  ingresos: {
    categorias: [
      'Menos de 1 SMMLV',
      '1 a menos de 2 SMMLV',
      '2 a menos de 3 SMMLV',
      '3 a menos de 5 SMMLV',
      '5 o más SMMLV',
    ],
    pesos: [0.06, 0.31, 0.27, 0.24, 0.12],
  },
  nivelesPosgrado: {
    categorias: ['Especialización', 'Maestría', 'Doctorado'],
    pesos: [0.52, 0.41, 0.07],
  },
  sectores: {
    categorias: ['Servicios', 'Industrial', 'Comercial', 'Público', 'Otro'],
    pesos: [0.42, 0.26, 0.14, 0.12, 0.06],
  },
  temasCapacitacion: {
    categorias: [
      'Gestión de proyectos',
      'Analítica de datos',
      'Transformación digital',
      'Idiomas',
      'Liderazgo',
      'Otros',
    ],
    pesos: [0.22, 0.2, 0.17, 0.15, 0.14, 0.12],
  },
  impacto: {
    categorias: [
      'Participa en asociaciones',
      'Reporta aportes significativos',
      'Tiene reconocimientos',
      'Tiene producción intelectual',
      'Tiene emprendimiento activo',
    ],
    // proporción de las encuestas validadas (no suman 1: son indicadores independientes)
    pesos: [0.31, 0.18, 0.12, 0.07, 0.14],
  },
  cobertura: {
    correoValido: 0.91,
    celularValido: 0.87,
    camposCompletos: 0.72,
  },
};

/* ------------------------------------------------------------------ */
/* Generación de datos de prueba por programa y año                    */
/* ------------------------------------------------------------------ */
const PATRON_EMPLEADOS = [88, 85, 82, 79, 75, 71];
const PATRON_INDEPENDIENTES = [8, 10, 11, 13, 14, 15];
const PESOS_COHORTE = [0.17, 0.18, 0.19, 0.18, 0.17, 0.11];
const ANIO_BASE = 2026;

/**
 * Valores del año base (2026). Ingeniería de Sistemas coincide con
 * la pantalla de referencia del proyecto.
 */
const BASE_PROGRAMAS = {
  'Ingeniería de Sistemas': {
    anios: [2024, 2025, 2026],
    total: 2847,
    tasa: 78.4,
    variacion: 2.1,
    seguimiento: 64.2,
    posgrado: 18.5,
    apreciacion: [52, 28, 14, 6],
    ajusteIndependientes: 0,
    mujeres: 0.22,
  },
  'Ingeniería Industrial': {
    anios: [2024, 2025, 2026],
    total: 3120,
    tasa: 74.9,
    variacion: 1.4,
    seguimiento: 58.7,
    posgrado: 15.2,
    apreciacion: [46, 31, 16, 7],
    ajusteIndependientes: 1.5,
    mujeres: 0.46,
  },
  'Ingeniería Civil': {
    anios: [2024, 2025, 2026],
    total: 2365,
    tasa: 72.3,
    variacion: 0.9,
    seguimiento: 55.4,
    posgrado: 12.8,
    apreciacion: [44, 32, 17, 7],
    ajusteIndependientes: 3,
    mujeres: 0.34,
  },
  'Ingeniería Ambiental': {
    // Programa más reciente: no tiene datos de 2024 (sirve para probar el estado "sin datos")
    anios: [2025, 2026],
    total: 1140,
    tasa: 69.8,
    variacion: 3.2,
    seguimiento: 61.0,
    posgrado: 14.1,
    apreciacion: [48, 30, 15, 7],
    ajusteIndependientes: 2,
    mujeres: 0.56,
  },
};

function construirPeriodo(base, anio) {
  const desfase = anio - ANIO_BASE; // 0, -1, -2
  const totalEgresados = Math.round(base.total * (1 + desfase * 0.05));
  const tasaEmpleabilidad = redondear1(base.tasa + desfase * base.variacion);
  const seguimientoVigente = redondear1(base.seguimiento + desfase * 2.5);
  const formacionPosgradual = redondear1(base.posgrado + desfase * 1.2);
  const encuestasValidadas = Math.floor((totalEgresados * seguimientoVigente) / 100);

  const etiquetasCohorte = [];
  for (let i = 5; i >= 1; i -= 1) etiquetasCohorte.push(String(anio - i));
  etiquetasCohorte.push(`${anio}-1`);

  const cohortes = etiquetasCohorte.map((etiqueta, i) => {
    const independientes = redondear1(PATRON_INDEPENDIENTES[i] + base.ajusteIndependientes);
    const empleadosBruto = PATRON_EMPLEADOS[i] + (base.tasa - 78.4) * 0.5 + desfase * 0.8;
    const empleados = redondear1(Math.min(empleadosBruto, 100 - independientes));
    return {
      etiqueta,
      egresados: Math.round(totalEgresados * PESOS_COHORTE[i]),
      empleados,
      independientes,
    };
  });

  const [excelente, , aceptable, deficiente] = base.apreciacion;
  const excelenteAjustada = excelente + desfase;
  const apreciacion = [
    excelenteAjustada,
    100 - excelenteAjustada - aceptable - deficiente, // "Buena" completa el 100%
    aceptable,
    deficiente,
  ];

  return {
    kpis: {
      totalEgresados,
      tasaEmpleabilidad,
      variacionEmpleabilidad: base.variacion,
      seguimientoVigente,
      encuestasValidadas,
      formacionPosgradual,
    },
    cohortes,
    apreciacion,
    mujeres: base.mujeres,
  };
}

/** DATOS[programa][anio] -> periodo, o undefined si no hay datos. */
export const DATOS = Object.fromEntries(
  Object.entries(BASE_PROGRAMAS).map(([programa, base]) => [
    programa,
    Object.fromEntries(base.anios.map((anio) => [anio, construirPeriodo(base, anio)])),
  ]),
);

export const CATEGORIAS_APRECIACION = ['Excelente', 'Buena', 'Aceptable', 'Deficiente'];