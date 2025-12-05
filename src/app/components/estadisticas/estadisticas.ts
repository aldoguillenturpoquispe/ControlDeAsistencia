import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsFiltros } from './stats-filtros/stats-filtros';
import { StatsTotales } from './stats-totales/stats-totales';
import { StatsPromedios } from './stats-promedios/stats-promedios';
import { StatsResumenEstados } from './stats-resumen-estados/stats-resumen-estados';
import { StatsExportActions } from './stats-export-actions/stats-export-actions';
import { AsistenciaService } from '../../services/asistencia.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    StatsFiltros,
    StatsTotales,
    StatsPromedios,
    StatsResumenEstados,
    StatsExportActions
  ],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements OnInit {
  private asistenciaService = inject(AsistenciaService);
  private usuarioService = inject(UsuarioService);

  // Filtros
  periodo: string = 'mes';
  fechaDesde: string = '';
  fechaHasta: string = '';

  // Estado
  isLoading = true;

  // Datos de estadísticas
  datosEstadisticas = {
    totalUsuarios: 0,
    totalAsistencias: 0,
    totalPresentes: 0,
    totalAusentes: 0,
    totalTardanzas: 0,
    totalPermisos: 0,
    promedioHoras: 0,
    porcentajeAsistencia: 0
  };

  async ngOnInit(): Promise<void> {
    this.establecerFechasIniciales();
    await this.cargarEstadisticas();
  }

  establecerFechasIniciales(): void {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    this.fechaHasta = hoy.toISOString().split('T')[0];
    this.fechaDesde = primerDiaMes.toISOString().split('T')[0];
  }

  // 🔥 SIMPLIFICADO: Solo actualizar y recargar
  async onFiltrosChange(filtros: any): Promise<void> {
 this.periodo = filtros.periodo;
    this.fechaDesde = filtros.fechaDesde;
    this.fechaHasta = filtros.fechaHasta;
    
    await this.cargarEstadisticas();
  }

  async cargarEstadisticas(): Promise<void> {
    try {
      this.isLoading = true;

      console.log('📅 Cargando con fechas:', {
        desde: this.fechaDesde,
        hasta: this.fechaHasta
      });

      const desde = new Date(this.fechaDesde);
      const hasta = new Date(this.fechaHasta);
      desde.setHours(0, 0, 0, 0);
      hasta.setHours(23, 59, 59, 999);

      const [usuarios, todasAsistencias] = await Promise.all([
        this.usuarioService.obtenerUsuarios(),
        this.asistenciaService.obtenerAsistencias()
      ]);
 const asistenciasFiltradas = todasAsistencias.filter(a => {
        const fechaAsistencia = new Date(a.fecha);
        fechaAsistencia.setHours(0, 0, 0, 0);
        return fechaAsistencia >= desde && fechaAsistencia <= hasta;
      });
 // Calcular totales
      this.datosEstadisticas.totalUsuarios = usuarios.length;
      this.datosEstadisticas.totalAsistencias = asistenciasFiltradas.length;
      this.datosEstadisticas.totalPresentes = asistenciasFiltradas.filter(a => a.estado === 'presente').length;
      this.datosEstadisticas.totalAusentes = asistenciasFiltradas.filter(a => a.estado === 'ausente').length;
      this.datosEstadisticas.totalTardanzas = asistenciasFiltradas.filter(a => a.estado === 'tardanza').length;
      this.datosEstadisticas.totalPermisos = asistenciasFiltradas.filter(a => a.estado === 'permiso').length;

      // Calcular promedio de horas
      const conSalida = asistenciasFiltradas.filter(a => a.horaSalida);
      if (conSalida.length > 0) {
        const totalHoras = conSalida.reduce((sum, a) => {
          const [hE, mE] = a.horaEntrada.split(':').map(Number);
          const [hS, mS] = a.horaSalida!.split(':').map(Number);
          const mins = (hS * 60 + mS) - (hE * 60 + mE);
          return sum + (mins > 0 ? mins / 60 : 0);
        }, 0);
        this.datosEstadisticas.promedioHoras = parseFloat((totalHoras / conSalida.length).toFixed(1));
      } else {
        this.datosEstadisticas.promedioHoras = 0;
      }

      // Calcular porcentaje de asistencia
      const diasLaborables = this.calcularDiasLaborables(desde, hasta);
      const totalEsperado = usuarios.length * diasLaborables;
      const efectivos = this.datosEstadisticas.totalPresentes + this.datosEstadisticas.totalTardanzas;
      this.datosEstadisticas.porcentajeAsistencia = totalEsperado > 0 
        ? parseFloat(((efectivos / totalEsperado) * 100).toFixed(1)) 
        : 0;
 } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
    } finally {
      this.isLoading = false;
    }
  }

  calcularDiasLaborables(desde: Date, hasta: Date): number {
    let dias = 0;
    const actual = new Date(desde);
    while (actual <= hasta) {
      const dia = actual.getDay();
      if (dia !== 0 && dia !== 6) dias++;
      actual.setDate(actual.getDate() + 1);
    }
    return dias;
  }
}