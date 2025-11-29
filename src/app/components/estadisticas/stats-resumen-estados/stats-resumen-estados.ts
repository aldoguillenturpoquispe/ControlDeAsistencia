import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenciaService } from '../../../services/asistencia.service';
import { Asistencia } from '../../../models/asistencia.model';

@Component({
  selector: 'app-stats-resumen-estados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-resumen-estados.html',
  styleUrl: './stats-resumen-estados.css',
})
export class StatsResumenEstados implements OnInit {
  private asistenciaService = inject(AsistenciaService);

  // Recibir fechas desde el componente padre
  @Input() fechaDesde: string = '';
  @Input() fechaHasta: string = '';

  // Datos de resumen
  presentes = 0;
  tardanzas = 0;
  ausentes = 0;
  permisos = 0;
  total = 0;

  // Porcentajes para las barras
  porcentajePresentes = 0;
  porcentajeTardanzas = 0;
  porcentajeAusentes = 0;
  porcentajePermisos = 0;

  isLoading = true;

  async ngOnInit(): Promise<void> {
    await this.cargarResumenEstados();
  }

  // ==========================================
  // DETECTAR CAMBIOS EN LOS INPUTS
  // ==========================================
  async ngOnChanges(): Promise<void> {
    if (this.fechaDesde && this.fechaHasta) {
      await this.cargarResumenEstados();
    }
  }

  // ==========================================
  // CARGAR RESUMEN POR ESTADOS
  // ==========================================
  async cargarResumenEstados(): Promise<void> {
    try {
      this.isLoading = true;

      // Obtener todas las asistencias
      const todasAsistencias = await this.asistenciaService.obtenerAsistencias();

      // Filtrar por rango de fechas
      const desde = new Date(this.fechaDesde || new Date());
      const hasta = new Date(this.fechaHasta || new Date());
      desde.setHours(0, 0, 0, 0);
      hasta.setHours(23, 59, 59, 999);

      const asistenciasFiltradas = todasAsistencias.filter(a => {
        const fechaAsistencia = new Date(a.fecha);
        return fechaAsistencia >= desde && fechaAsistencia <= hasta;
      });

      console.log('📊 Resumen Estados - Asistencias filtradas:', asistenciasFiltradas.length);
      console.log('📅 Rango:', desde, 'a', hasta);

      // Contar por estado
      this.presentes = asistenciasFiltradas.filter(a => a.estado === 'presente').length;
      this.tardanzas = asistenciasFiltradas.filter(a => a.estado === 'tardanza').length;
      this.ausentes = asistenciasFiltradas.filter(a => a.estado === 'ausente').length;
      this.permisos = asistenciasFiltradas.filter(a => a.estado === 'permiso').length;

      // Total de registros
      this.total = this.presentes + this.tardanzas + this.ausentes + this.permisos;

      // Calcular porcentajes
      if (this.total > 0) {
        this.porcentajePresentes = (this.presentes / this.total) * 100;
        this.porcentajeTardanzas = (this.tardanzas / this.total) * 100;
        this.porcentajeAusentes = (this.ausentes / this.total) * 100;
        this.porcentajePermisos = (this.permisos / this.total) * 100;
      } else {
        this.porcentajePresentes = 0;
        this.porcentajeTardanzas = 0;
        this.porcentajeAusentes = 0;
        this.porcentajePermisos = 0;
      }

      console.log('✅ Resumen de estados cargado');
      console.log('Presentes:', this.presentes, `(${this.porcentajePresentes.toFixed(1)}%)`);
      console.log('Tardanzas:', this.tardanzas, `(${this.porcentajeTardanzas.toFixed(1)}%)`);
      console.log('Ausentes:', this.ausentes, `(${this.porcentajeAusentes.toFixed(1)}%)`);
      console.log('Permisos:', this.permisos, `(${this.porcentajePermisos.toFixed(1)}%)`);

    } catch (error) {
      console.error('❌ Error al cargar resumen de estados:', error);
    } finally {
      this.isLoading = false;
    }
  }
}