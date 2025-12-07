import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { ForgotPassword } from './components/auth/forgot-password/forgot-password';
import { NotFound } from './components/not-found/not-found';
import { adminGuardGuard } from './guards/admin.guard-guard';

export const routes: Routes = [
  // RUTAS PÚBLICAS (sin autenticación)
  {
    path: '', 
    component: Login, 
    title: 'Login'
  },
  {
    path: 'login', 
    component: Login, 
    title: 'Login'
  },
  {
    path: 'register', 
    component: Register, 
    title: 'Register'
  },
  {
    path: 'forgot-password', 
    component: ForgotPassword, 
    title: 'Recuperar Contraseña'
  },

  // RUTAS PROTEGIDAS (requieren autenticación)
  {
    path: 'inicio',
    loadComponent: () => import('./components/home/home').then(m => m.Home),
    title: 'Inicio',
    canActivate: [adminGuardGuard] // 🔒 Protegida
  },
  {
    path: 'asistencias',
    loadComponent: () => import('./components/asistencias/asistencias').then(m => m.Asistencias),
    title: 'Asistencias',
    canActivate: [adminGuardGuard] // 🔒 Protegida
  },
  {
    path: 'estadisticas',
    loadComponent: () => import('./components/estadisticas/estadisticas').then(m => m.Estadisticas),
    title: 'Estadísticas',
    canActivate: [adminGuardGuard] // 🔒 Protegida
  },
  {
    path: 'reportes',
    loadComponent: () => import('./components/reportes/reportes').then(m => m.Reportes),
    title: 'Reportes',
    canActivate: [adminGuardGuard] // 🔒 Protegida
  },

  // RUTA 404 - Página no encontrada
  {
    path: '**', 
    component: NotFound,  // 👈 Muestra el componente 404
    title: 'Página no encontrada'
  }
];