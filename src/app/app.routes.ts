import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Asistencias } from './components/asistencias/asistencias';
import { Estadisticas } from './components/estadisticas/estadisticas';
import { Reportes } from './components/reportes/reportes';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';

export const routes: Routes = [
  {path: '', component: Login, title:'Login'},
  {path: 'login', component: Login, title:'Login'},
  {path: 'register', component: Register, title:'Register'},
  {path: 'inicio', component: Home, title:'Inicio'},
  {path: 'asistencias', component: Asistencias, title: 'Asistencias'},
  {path: 'estadisticas', component: Estadisticas, title: 'Estadísticas'},
  {path: 'reportes', component: Reportes, title: 'Reportes'},
  {path: '**', redirectTo: 'login'},
];