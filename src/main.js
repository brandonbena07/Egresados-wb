import './styles/main.css';
import './styles/login.css';
import { montarLoginPage } from './pages/loginPage.js';
import { montarDashboardPage } from './pages/dashboardPage.js';
import { obtenerUsuarioAutenticado, cerrarSesion } from './services/authService.js';

const contenedor = document.getElementById('app');
let dashboardActivo = null;

function mostrarLogin() {
  document.title = 'SIGE - UCC | Iniciar sesión';
  montarLoginPage(contenedor, { onLoginExitoso: mostrarDashboard });
}

function mostrarDashboard(usuario) {
  document.title = 'SIGE - UCC | Tablero';
  dashboardActivo = montarDashboardPage(contenedor, {
    usuario,
    onCerrarSesion: () => {
      dashboardActivo?.desmontar();
      dashboardActivo = null;
      cerrarSesion();
      mostrarLogin();
    },
  });
}

// Si ya hay una sesión guardada, se entra directo al tablero.
const usuarioActivo = obtenerUsuarioAutenticado();
if (usuarioActivo) mostrarDashboard(usuarioActivo);
else mostrarLogin();