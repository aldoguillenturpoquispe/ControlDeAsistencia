import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-promedios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-promedios.html',
  styleUrl: './stats-promedios.css',
})
export class StatsPromedios {
  @Input() datosEstadisticas: any = {};
}