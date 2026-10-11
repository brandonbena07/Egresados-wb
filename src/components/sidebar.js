import { icono } from '../utils/iconos.js';

const MODULOS = [
  { id: 'tablero', etiqueta: 'Tablero (Dashboard)', icono: 'tablero', activo: true },
  { id: 'egresados', etiqueta: 'Egresados', icono: 'egresados' },
  { id: 'cargar-datos', etiqueta: 'Cargar datos', icono: 'cargar' },
  { id: 'reportes-cna', etiqueta: 'Reportes CNA', icono: 'reportes' },
  { id: 'calidad-datos', etiqueta: 'Calidad de datos', icono: 'calidad' },
  { id: 'catalogos', etiqueta: 'Catálogos', icono: 'catalogos' },
];

const USUARIO = { nombre: 'Esteban Idárraga', rol: 'Encargado de Acreditación', iniciales: 'EI' };

/**
 * Barra lateral fija. En pantallas angostas se vuelve un panel que se abre y cierra.
 * Devuelve { elemento, abrir, cerrar, alternar }.
 */
export function crearSidebar() {
  const elemento = document.createElement('div');
  elemento.className = 'sidebar-contenedor';
  elemento.innerHTML = `
    <aside class="sidebar" id="sidebar" aria-label="Navegación principal">
      <div class="sidebar__marca">
        <!-- Reemplaza este ícono por el logo oficial de la UCC (archivo de imagen) -->
        <span class="sidebar__logo" aria-hidden="true">U</span>
        <div class="sidebar__marca-texto">
          <span class="sidebar__facultad">FACULTAD DE INGENIERÍA</span>
          <span class="sidebar__sistema">SIGE - UCC</span>
        </div>
      </div>

      <nav class="sidebar__nav">
        <p class="sidebar__seccion" id="titulo-modulos">MÓDULOS ADMINISTRATIVOS</p>
        <ul class="sidebar__lista" aria-labelledby="titulo-modulos">
          ${MODULOS.map(
            (m) => `
            <li>
              <a href="#${m.id}" class="sidebar__enlace${m.activo ? ' sidebar__enlace--activo' : ''}"
                 ${m.activo ? 'aria-current="page"' : 'title="Próximamente"'} data-modulo="${m.id}">
                ${icono(m.icono, 20)}
                <span>${m.etiqueta}</span>
              </a>
            </li>`,
          ).join('')}
        </ul>
      </nav>

      <div class="sidebar__usuario">
        <span class="sidebar__avatar" aria-hidden="true">${USUARIO.iniciales}</span>
        <div class="sidebar__usuario-texto">
          <span class="sidebar__nombre">${USUARIO.nombre}</span>
          <span class="sidebar__rol">${USUARIO.rol}</span>
        </div>
      </div>
    </aside>
    <div class="sidebar__fondo" data-cerrar-menu></div>
  `;

  const panel = elemento.querySelector('.sidebar');

  const abrir = () => {
    elemento.classList.add('sidebar-contenedor--abierto');
    document.dispatchEvent(new CustomEvent('sidebar:cambio', { detail: { abierto: true } }));
  };
  const cerrar = () => {
    elemento.classList.remove('sidebar-contenedor--abierto');
    document.dispatchEvent(new CustomEvent('sidebar:cambio', { detail: { abierto: false } }));
  };
  const alternar = () => {
    if (elemento.classList.contains('sidebar-contenedor--abierto')) cerrar();
    else abrir();
  };

  elemento.querySelector('[data-cerrar-menu]').addEventListener('click', cerrar);
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') cerrar();
  });

  // Los módulos aún no existen: no se navega, solo se cierra el menú en móvil.
  panel.querySelectorAll('.sidebar__enlace').forEach((enlace) => {
    enlace.addEventListener('click', (evento) => {
      evento.preventDefault();
      cerrar();
    });
  });

  return { elemento, abrir, cerrar, alternar };
}