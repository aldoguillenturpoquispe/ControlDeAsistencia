import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-totales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-totales.html',
  styleUrl: './stats-totales.css',
})
export class StatsTotales {
  @Input() datosEstadisticas: any = {};
}