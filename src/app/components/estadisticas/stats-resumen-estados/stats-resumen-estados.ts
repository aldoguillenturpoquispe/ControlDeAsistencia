import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-resumen-estados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-resumen-estados.html',
  styleUrl: './stats-resumen-estados.css',
})
export class StatsResumenEstados {
  @Input() datosEstadisticas: any = {};

  // Calcular porcentaje de cada estado
  calcularPorcentaje(cantidad: number): number {
    const total = this.datosEstadisticas.totalAsistencias || 0;
    return total > 0 ? (cantidad / total) * 100 : 0;
  }
}