import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { ForgotPassword } from './components/auth/forgot-password/forgot-password';

export const routes: Routes = [
   // RUTAS EAGER (carga inmediata)
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

   // RUTAS CON LAZY LOADING (carga diferida)
   {
    path: 'inicio',
    loadComponent: () => import('./components/home/home').then(m => m.Home),
    title: 'Inicio'
  },
  {
    path: 'asistencias',
    loadComponent: () => import('./components/asistencias/asistencias').then(m => m.Asistencias),
    title: 'Asistencias'
  },
  {
    path: 'estadisticas',
    loadComponent: () => import('./components/estadisticas/estadisticas').then(m => m.Estadisticas),
    title: 'Estadísticas'
  },
  {
    path: 'reportes',
    loadComponent: () => import('./components/reportes/reportes').then(m => m.Reportes),
    title: 'Reportes'
  },

   // RUTA 404 - Redirigir a login
   {
    path: '**', 
    redirectTo: 'login'
  }
];