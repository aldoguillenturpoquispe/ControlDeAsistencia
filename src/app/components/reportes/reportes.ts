import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesTabla } from './reportes-tabla/reportes-tabla';
import { AsistenciaService } from '../../services/asistencia.service';
import { Asistencia } from '../../models/asistencia.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportesTabla],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  // Arrays de datos
  reportes: Asistencia[] = [];
  reportesFiltrados: Asistencia[] = [];
  reportesPaginados: Asistencia[] = [];
  
  // Estado de carga
  cargando = false;
  
  // Filtros
  filtros = {
    fechaInicio: '',
    fechaFin: '',
    usuario: '',
    estado: ''
  };
  
  // Resumen estadístico
  resumen = {
    totalRegistros: 0,
    presentes: 0,
    ausentes: 0,
    tardanzas: 0,
    promedioAsistencia: 0
  };
  
  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  registrosPorPagina = 10;

  constructor(private asistenciaService: AsistenciaService) {
    // Inicializar fechas por defecto (último mes)
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);
    
    this.filtros.fechaInicio = this.formatearFecha(haceUnMes);
    this.filtros.fechaFin = this.formatearFecha(hoy);
  }

  ngOnInit() {
    this.cargarReportes();
  }

  /**
   * Carga todos los reportes desde Firebase
   */
  async cargarReportes() {
    this.cargando = true;
    
    try {
      this.reportes = await this.asistenciaService.obtenerAsistencias();
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      alert('Error al cargar los reportes. Por favor, intenta de nuevo.');
    } finally {
      this.cargando = false;
    }
  }

/**
 * Aplica los filtros a los reportes
 */
aplicarFiltros() {
  let reportesFiltrados = [...this.reportes];

  // Filtrar por rango de fechas
  if (this.filtros.fechaInicio) {
    reportesFiltrados = reportesFiltrados.filter(r => {
      const fechaReporte = typeof r.fecha === 'string' ? new Date(r.fecha) : r.fecha;
      const fechaInicio = new Date(this.filtros.fechaInicio);
      
      // Comparar solo las fechas sin hora
      const fechaReporteSoloFecha = new Date(fechaReporte.getFullYear(), fechaReporte.getMonth(), fechaReporte.getDate());
      const fechaInicioSoloFecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
      
      return fechaReporteSoloFecha >= fechaInicioSoloFecha;
    });
  }
  
  if (this.filtros.fechaFin) {
    reportesFiltrados = reportesFiltrados.filter(r => {
      const fechaReporte = typeof r.fecha === 'string' ? new Date(r.fecha) : r.fecha;
      const fechaFin = new Date(this.filtros.fechaFin);
      
      // Comparar solo las fechas sin hora
      const fechaReporteSoloFecha = new Date(fechaReporte.getFullYear(), fechaReporte.getMonth(), fechaReporte.getDate());
      const fechaFinSoloFecha = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());
      
      return fechaReporteSoloFecha <= fechaFinSoloFecha;
    });
  }

  // Filtrar por usuario (búsqueda por nombre)
  if (this.filtros.usuario.trim()) {
    const busqueda = this.filtros.usuario.toLowerCase().trim();
    reportesFiltrados = reportesFiltrados.filter(r => {
      const nombreCompleto = r.nombreCompleto || '';
      return nombreCompleto.toLowerCase().includes(busqueda);
    });
  }

  // Filtrar por estado
  if (this.filtros.estado) {
    reportesFiltrados = reportesFiltrados.filter(r => 
      r.estado === this.filtros.estado
    );
  }

  this.reportesFiltrados = reportesFiltrados;
  this.calcularResumen();
  this.calcularPaginacion();
  this.actualizarPagina();
 console.log('Registros filtrados:', this.reportesFiltrados.length);
}

  /**
   * Limpia todos los filtros y recarga los datos
   */
  limpiarFiltros() {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);
    
    this.filtros = {
      fechaInicio: this.formatearFecha(haceUnMes),
      fechaFin: this.formatearFecha(hoy),
      usuario: '',
      estado: ''
    };
    
    this.aplicarFiltros();
  }

  /**
   * Calcula el resumen estadístico de los reportes filtrados
   */
  calcularResumen() {
    const total = this.reportesFiltrados.length;
    
    this.resumen = {
      totalRegistros: total,
      presentes: this.reportesFiltrados.filter(r => r.estado === 'presente').length,
      ausentes: this.reportesFiltrados.filter(r => r.estado === 'ausente').length,
      tardanzas: this.reportesFiltrados.filter(r => r.estado === 'tardanza').length,
      promedioAsistencia: 0
    };

    // Calcular promedio de asistencia
    if (total > 0) {
      const porcentaje = ((this.resumen.presentes + this.resumen.tardanzas) / total) * 100;
      this.resumen.promedioAsistencia = Math.round(porcentaje * 10) / 10; // Redondear a 1 decimal
    }
  }

  /**
   * Calcula la paginación
   */
  calcularPaginacion() {
    this.totalPaginas = Math.ceil(this.reportesFiltrados.length / this.registrosPorPagina);
    if (this.totalPaginas === 0) this.totalPaginas = 1;
    this.paginaActual = 1; // Reset a la primera página
  }

  /**
   * Actualiza los registros que se muestran en la página actual
   */
  actualizarPagina() {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    this.reportesPaginados = this.reportesFiltrados.slice(inicio, fin);
  }

  /**
   * Navega a la página anterior
   */
  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarPagina();
    }
  }

  /**
   * Navega a la página siguiente
   */
  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarPagina();
    }
  }

  /**
   * Formatea una fecha al formato YYYY-MM-DD
   */
  private formatearFecha(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }
}