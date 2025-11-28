import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaFormModal } from './asistencia-form-modal/asistencia-form-modal';
import { AsistenciaTabla } from './asistencia-tabla/asistencia-tabla';
import { AsistenciaService } from '../../services/asistencia.service';
import { UsuarioService } from '../../services/usuario.service';
import { Asistencia } from '../../models/asistencia.model';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [CommonModule, FormsModule, AsistenciaFormModal, AsistenciaTabla],
  templateUrl: './asistencias.html',
  styleUrl: './asistencias.css',
})
export class Asistencias implements OnInit {
  private asistenciaService = inject(AsistenciaService);
  private usuarioService = inject(UsuarioService);

  // Estado
  mostrarModal = false;
  isLoading = true;

  // Datos
  asistencias: Asistencia[] = [];
  asistenciasFiltradas: Asistencia[] = [];
  
  // Estadísticas
  totalRegistros = 0;
  presentesHoy = 0;
  ausentesHoy = 0;
  tardanzasHoy = 0;

  // Filtros
  filtroFecha: string = '';
  filtroUsuario: string = '';
  filtroEstado: string = '';

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  async ngOnInit(): Promise<void> {
    await this.cargarDatos();
  }

  // ==========================================
  // CARGAR DATOS INICIALES
  // ==========================================
  async cargarDatos(): Promise<void> {
    try {
      this.isLoading = true;

      // Cargar asistencias y estadísticas en paralelo
      const [asistencias, estadisticas] = await Promise.all([
        this.asistenciaService.obtenerAsistencias(),
        this.asistenciaService.contarPorEstadoHoy()
      ]);

      this.asistencias = asistencias;
      this.asistenciasFiltradas = asistencias;
      
      // Actualizar estadísticas
      this.totalRegistros = asistencias.length;
      this.presentesHoy = estadisticas.presentes;
      this.ausentesHoy = estadisticas.ausentes;
      this.tardanzasHoy = estadisticas.tardanzas;

      // Calcular paginación
      this.calcularPaginacion();

      console.log('✅ Datos de asistencias cargados');
      console.log('Total registros:', this.totalRegistros);
      console.log('Presentes hoy:', this.presentesHoy);

    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // CALCULAR PAGINACIÓN
  // ==========================================
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.asistenciasFiltradas.length / this.itemsPorPagina);
    if (this.totalPaginas === 0) this.totalPaginas = 1;
  }

  // ==========================================
  // OBTENER ASISTENCIAS DE LA PÁGINA ACTUAL
  // ==========================================
  get asistenciasPaginadas(): Asistencia[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.asistenciasFiltradas.slice(inicio, fin);
  }

  // ==========================================
  // APLICAR FILTROS
  // ==========================================
  aplicarFiltros(): void {
    console.log('Aplicando filtros:', {
      fecha: this.filtroFecha,
      usuario: this.filtroUsuario,
      estado: this.filtroEstado
    });

    this.asistenciasFiltradas = this.asistencias.filter(asistencia => {
      let cumpleFecha = true;
      let cumpleUsuario = true;
      let cumpleEstado = true;

      // Filtro por fecha
      if (this.filtroFecha && this.filtroFecha.trim() !== '') {
        try {
          // Convertir la fecha de asistencia a formato YYYY-MM-DD usando hora local
          let fechaAsistencia: string;
          let fecha: Date;
          
          if (asistencia.fecha instanceof Date) {
            fecha = asistencia.fecha;
          } else {
            fecha = new Date(asistencia.fecha as any);
          }
          
          // Usar getFullYear, getMonth, getDate para evitar problemas de zona horaria
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          fechaAsistencia = `${year}-${month}-${day}`;
          
          cumpleFecha = fechaAsistencia === this.filtroFecha;
          
          console.log('🔍 Comparando fechas:', {
            fechaAsistencia,
            filtroFecha: this.filtroFecha,
            coincide: cumpleFecha
          });
        } catch (error) {
          console.warn('Error al comparar fecha para asistencia:', asistencia.id, error);
          cumpleFecha = false;
        }
      }

      // Filtro por usuario (nombre) - con validación de undefined/null
      if (this.filtroUsuario && this.filtroUsuario.trim() !== '') {
        const nombreCompleto = asistencia.nombreCompleto || '';
        cumpleUsuario = nombreCompleto
          .toLowerCase()
          .includes(this.filtroUsuario.toLowerCase().trim());
      }

      // Filtro por estado
      if (this.filtroEstado && this.filtroEstado.trim() !== '') {
        cumpleEstado = asistencia.estado === this.filtroEstado;
      }

      return cumpleFecha && cumpleUsuario && cumpleEstado;
    });

    // Resetear paginación y recalcular
    this.paginaActual = 1;
    this.calcularPaginacion();

    console.log('✅ Resultados filtrados:', this.asistenciasFiltradas.length);
  }

  // ==========================================
  // LIMPIAR FILTROS
  // ==========================================
  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroUsuario = '';
    this.filtroEstado = '';
    this.asistenciasFiltradas = this.asistencias;
    this.paginaActual = 1;
    this.calcularPaginacion();
    console.log('✅ Filtros limpiados');
  }

  // ==========================================
  // MODAL
  // ==========================================
  abrirModal(): void {
    console.log('Abriendo modal...');
    this.mostrarModal = true;
  }

  async cerrarModal(asistenciaGuardada?: boolean): Promise<void> {
    this.mostrarModal = false;
    
    // Si se guardó una asistencia, recargar datos
    if (asistenciaGuardada) {
      await this.cargarDatos();
    }
  }

  // ==========================================
  // PAGINACIÓN
  // ==========================================
  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      console.log('Página anterior:', this.paginaActual);
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      console.log('Página siguiente:', this.paginaActual);
    }
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // ==========================================
  // ELIMINAR ASISTENCIA
  // ==========================================
  async eliminarAsistencia(id: string): Promise<void> {
    if (!confirm('¿Estás seguro de eliminar esta asistencia?')) {
      return;
    }

    try {
      // Aquí llamarás al servicio cuando lo implementes
      console.log('Eliminando asistencia:', id);
      await this.cargarDatos();
    } catch (error) {
      console.error('❌ Error al eliminar asistencia:', error);
    }
  }
}