import { Routes } from '@angular/router';
import { Home } from './componente/home/home';
import { Asistencias } from './componente/asistencias/asistencias';
import { Estadisticas } from './componente/estadisticas/estadisticas';
import { Reportes } from './componente/reportes/reportes';

export const routes: Routes = [

  {path:'', component: Home, title:'Inicio'},
  {path: 'asistencias', component: Asistencias, title: 'Asistencias'},
  {path: 'estadisticas', component: Estadisticas, title: 'Estadísticas'},
  {path: 'reportes', component: Reportes, title: 'Reportes' },
	{ path: '**', redirectTo: '' },
];
