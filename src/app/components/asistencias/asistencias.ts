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
  
  // 🔥 Para edición
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
 await this.cargarDatos();
  }

   // CARGAR DATOS INICIALES
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
 } catch (error) {
      console.error('❌ Error al cargar datos:', error);
    } finally {
      this.isLoading = false;
    }
  }

   // CALCULAR PAGINACIÓN
   calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.asistenciasFiltradas.length / this.itemsPorPagina);
    if (this.totalPaginas === 0) this.totalPaginas = 1;
  }

   // OBTENER ASISTENCIAS DE LA PÁGINA ACTUAL
   get asistenciasPaginadas(): Asistencia[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.asistenciasFiltradas.slice(inicio, fin);
  }

   // APLICAR FILTROS
   aplicarFiltros(): void {
    this.asistenciasFiltradas = this.asistencias.filter(asistencia => {
      let cumpleFecha = true;
      let cumpleUsuario = true;
      let cumpleEstado = true;

      if (this.filtroFecha && this.filtroFecha.trim() !== '') {
        try {
          const fecha = asistencia.fecha instanceof Date 
            ? asistencia.fecha 
            : new Date(asistencia.fecha as any);
          
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          const fechaAsistencia = `${year}-${month}-${day}`;
          
          cumpleFecha = fechaAsistencia === this.filtroFecha;
        } catch (error) {
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
  }

   // LIMPIAR FILTROS
   limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroUsuario = '';
    this.filtroEstado = '';
    this.asistenciasFiltradas = this.asistencias;
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

   // MODAL - NUEVA ASISTENCIA
   abrirModal(): void {
 this.asistenciaParaEditar = null;
    this.mostrarModal = true;
  }

   // 🔥 MODAL - EDITAR ASISTENCIA
   abrirModalEditar(asistencia: Asistencia): void {
    if (!this.esAdmin) {
      this.mostrarToast('⛔ Solo los administradores pueden editar asistencias', 'error');
      return;
    }
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

   // MODAL DE ELIMINACIÓN
   async eliminarAsistencia(id: string): Promise<void> {
    if (!this.esAdmin) {
      this.mostrarToast('⛔ Solo los administradores pueden eliminar asistencias', 'error');
      return;
    }

    const asistencia = this.asistencias.find(a => a.id === id);
    
    if (!asistencia) {
      this.mostrarToast('❌ Asistencia no encontrada', 'error');
      return;
    }

    this.asistenciaParaEliminar = asistencia;
    this.mostrarModalEliminar = true;
  }

  async confirmarEliminacion(): Promise<void> {
    if (!this.asistenciaParaEliminar?.id) {
      this.mostrarToast('❌ Error: No se puede eliminar', 'error');
      return;
    }

    try {
      const id = this.asistenciaParaEliminar.id;
      const nombreUsuario = this.asistenciaParaEliminar.nombreCompleto;
      
      await this.asistenciaService.eliminarAsistencia(id);
      
      this.mostrarToast(`✅ Asistencia de ${nombreUsuario} eliminada`, 'success');
      
      this.cancelarEliminacion();
      await this.cargarDatos();
      
    } catch (error: any) {
      console.error('❌ Error al eliminar asistencia:', error);
      this.mostrarToast(`❌ Error al eliminar: ${error.message}`, 'error');
    }
  }

  cancelarEliminacion(): void {
    this.mostrarModalEliminar = false;
    this.asistenciaParaEliminar = null;
  }

   // PAGINACIÓN
   paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

   // MOSTRAR TOAST
   mostrarToast(mensaje: string, tipo: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}