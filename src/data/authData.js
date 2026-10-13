/**
 * Usuarios de prueba para el inicio de sesión simulado.
 * Solo para desarrollo: cuando exista backend, la verificación de credenciales
 * se hace en el servidor y este archivo desaparece.
 */
export const CLAVE_USUARIO_STORAGE = 'sige_usuario';

export const USUARIOS = [
  {
    id: 1,
    email: 'esteban.idarraga@ucc.edu.co',
    clave: 'sige2026',
    nombre: 'Esteban Idárraga',
    rol: 'Encargado de Acreditación',
  },
  {
    id: 2,
    email: 'consulta.ingenieria@ucc.edu.co',
    clave: 'consulta2026',
    nombre: 'Coordinación de Ingeniería',
    rol: 'Consulta',
  },
];