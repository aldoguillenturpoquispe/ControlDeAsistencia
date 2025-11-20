import { Component } from '@angular/core';
import { StatsCharts } from './stats-charts/stats-charts';
import { StatsResumenEstados } from './stats-resumen-estados/stats-resumen-estados';
import { StatsTopUsuarios } from './stats-top-usuarios/stats-top-usuarios';

@Component({
  selector: 'app-estadisticas',
  imports: [StatsCharts, StatsResumenEstados, StatsTopUsuarios],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas {

}
