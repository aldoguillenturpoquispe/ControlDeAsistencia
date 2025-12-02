import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaFormModal } from './asistencia-form-modal/asistencia-form-modal';
import { AsistenciaDeleteModal } from './asistencia-delete-modal/asistencia-delete-modal';
import { AsistenciaTabla } from './asistencia-tabla/asistencia-tabla';
import { AsistenciaService } from '../../services/asistencia.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Asistencia } from '../../models/asistencia.model';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    AsistenciaFormModal, 
    AsistenciaDeleteModal,
    AsistenciaTabla
  ],
  templateUrl: './asistencias.html',
  styleUrl: './asistencias.css',
})
export class Asistencias implements OnInit {
  private asistenciaService = inject(AsistenciaService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  // Variables de rol
  esAdmin: boolean = false;

  // Estado
  mostrarModal = false;
  mostrarModalEliminar = false;
  isLoading = true;
  
  // Para edición
  asistenciaParaEditar: Asistencia | null = null;
  
  // Para eliminación
  asistenciaParaEliminar: Asistencia | null = null;

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
    this.esAdmin = this.authService.esAdmin();
    console.log('🔐 Usuario es admin:', this.esAdmin);
    
    await this.cargarDatos();
  }

  // ==========================================
  // CARGAR DATOS INICIALES
  // ==========================================
  async cargarDatos(): Promise<void> {
    try {
      this.isLoading = true;

      const [asistencias, estadisticas] = await Promise.all([
        this.asistenciaService.obtenerAsistencias(),
        this.asistenciaService.contarPorEstadoHoy()
      ]);

      this.asistencias = asistencias;
      this.asistenciasFiltradas = asistencias;
      
      this.totalRegistros = asistencias.length;
      this.presentesHoy = estadisticas.presentes;
      this.ausentesHoy = estadisticas.ausentes;
      this.tardanzasHoy = estadisticas.tardanzas;

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

      if (this.filtroFecha && this.filtroFecha.trim() !== '') {
        try {
          let fechaAsistencia: string;
          let fecha: Date;
          
          if (asistencia.fecha instanceof Date) {
            fecha = asistencia.fecha;
          } else {
            fecha = new Date(asistencia.fecha as any);
          }
          
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          fechaAsistencia = `${year}-${month}-${day}`;
          
          cumpleFecha = fechaAsistencia === this.filtroFecha;
        } catch (error) {
          console.warn('Error al comparar fecha para asistencia:', asistencia.id, error);
          cumpleFecha = false;
        }
      }

      if (this.filtroUsuario && this.filtroUsuario.trim() !== '') {
        const nombreCompleto = asistencia.nombreCompleto || '';
        cumpleUsuario = nombreCompleto
          .toLowerCase()
          .includes(this.filtroUsuario.toLowerCase().trim());
      }

      if (this.filtroEstado && this.filtroEstado.trim() !== '') {
        cumpleEstado = asistencia.estado === this.filtroEstado;
      }

      return cumpleFecha && cumpleUsuario && cumpleEstado;
    });

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
  // MODAL - NUEVA ASISTENCIA
  // ==========================================
  abrirModal(): void {
    console.log('Abriendo modal para nueva asistencia...');
    this.asistenciaParaEditar = null;
    this.mostrarModal = true;
  }

  // ==========================================
  // MODAL - EDITAR ASISTENCIA
  // ==========================================
  abrirModalEditar(asistencia: Asistencia): void {
    if (!this.esAdmin) {
      this.mostrarToast('⛔ Solo los administradores pueden editar asistencias', 'error');
      return;
    }

    console.log('Abriendo modal para editar asistencia:', asistencia);
    this.asistenciaParaEditar = asistencia;
    this.mostrarModal = true;
  }

  async cerrarModal(asistenciaGuardada?: boolean): Promise<void> {
    this.mostrarModal = false;
    this.asistenciaParaEditar = null;
    
    if (asistenciaGuardada) {
      await this.cargarDatos();
    }
  }

  // ==========================================
  // 🔥 NUEVO: MODAL DE ELIMINACIÓN
  // ==========================================
  async eliminarAsistencia(id: string): Promise<void> {
    if (!this.esAdmin) {
      this.mostrarToast('⛔ Solo los administradores pueden eliminar asistencias', 'error');
      return;
    }

    // Encontrar la asistencia
    const asistencia = this.asistencias.find(a => a.id === id);
    
    if (!asistencia) {
      this.mostrarToast('❌ Asistencia no encontrada', 'error');
      return;
    }

    // Guardar para el modal y abrir
    this.asistenciaParaEliminar = asistencia;
    this.mostrarModalEliminar = true;
  }

  // ==========================================
  // 🔥 CONFIRMAR ELIMINACIÓN
  // ==========================================
  async confirmarEliminacion(): Promise<void> {
    if (!this.asistenciaParaEliminar?.id) {
      this.mostrarToast('❌ Error: No se puede eliminar', 'error');
      return;
    }

    try {
      const id = this.asistenciaParaEliminar.id;
      const nombreUsuario = this.asistenciaParaEliminar.nombreCompleto;
      
      console.log('🗑️ Eliminando asistencia:', id);
      
      await this.asistenciaService.eliminarAsistencia(id);
      
      this.mostrarToast(`✅ Asistencia de ${nombreUsuario} eliminada`, 'success');
      
      // Cerrar modal y recargar
      this.cancelarEliminacion();
      await this.cargarDatos();
      
    } catch (error: any) {
      console.error('❌ Error al eliminar asistencia:', error);
      this.mostrarToast(`❌ Error al eliminar: ${error.message}`, 'error');
    }
  }

  // ==========================================
  // 🔥 CANCELAR ELIMINACIÓN
  // ==========================================
  cancelarEliminacion(): void {
    this.mostrarModalEliminar = false;
    this.asistenciaParaEliminar = null;
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
  // 🔥 MOSTRAR TOAST (NOTIFICACIÓN)
  // ==========================================
  mostrarToast(mensaje: string, tipo: 'success' | 'error'): void {
    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    // Remover después de 3 segundos
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}