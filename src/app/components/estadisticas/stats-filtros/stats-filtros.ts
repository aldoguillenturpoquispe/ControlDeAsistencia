import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stats-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stats-filtros.html',
  styleUrl: './stats-filtros.css',
})
export class StatsFiltros implements OnChanges {
  @Input() periodo: string = 'mes';
  @Input() fechaDesde: string = '';
  @Input() fechaHasta: string = '';
  
  @Output() filtrosChange = new EventEmitter<{periodo: string, fechaDesde: string, fechaHasta: string}>();

  // Variables locales para los inputs
  periodoLocal: string = 'mes';
  fechaDesdeLocal: string = '';
  fechaHastaLocal: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    // Sincronizar valores del padre con los locales
    if (changes['periodo']) {
      this.periodoLocal = this.periodo;
    }
    if (changes['fechaDesde']) {
      this.fechaDesdeLocal = this.fechaDesde;
    }
    if (changes['fechaHasta']) {
      this.fechaHastaLocal = this.fechaHasta;
    }
  }

  // 🔥 Cuando cambia el período, calcular fechas automáticamente
  onPeriodoChange(): void {
    const { desde, hasta } = this.calcularFechasPorPeriodo(this.periodoLocal);
    this.fechaDesdeLocal = desde.toISOString().split('T')[0];
    this.fechaHastaLocal = hasta.toISOString().split('T')[0];
    this.emitirCambios();
  }

  // 🔥 Cuando se da click en Actualizar (con fechas manuales)
  onActualizar(): void {
    this.emitirCambios();
  }

  // 🔥 Calcular fechas según período
  private calcularFechasPorPeriodo(periodo: string): { desde: Date; hasta: Date } {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    let desde: Date;
    let hasta: Date = new Date(hoy);

    switch (periodo) {
      case 'hoy':
        desde = new Date(hoy);
        break;

      case 'semana':
        const diaSemana = hoy.getDay();
        const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1;
        desde = new Date(hoy);
        desde.setDate(hoy.getDate() - diasDesdeInicio);
        break;

      case 'mes':
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;

      case 'anio':
        desde = new Date(hoy.getFullYear(), 0, 1);
        break;

      default:
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    }

    return { desde, hasta };
  }

  private emitirCambios(): void {
    console.log('📤 Emitiendo cambios:', {
      periodo: this.periodoLocal,
      fechaDesde: this.fechaDesdeLocal,
      fechaHasta: this.fechaHastaLocal
    });

    this.filtrosChange.emit({
      periodo: this.periodoLocal,
      fechaDesde: this.fechaDesdeLocal,
      fechaHasta: this.fechaHastaLocal
    });
  }
}