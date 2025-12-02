import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Asistencia } from '../../../models/asistencia.model';

@Component({
  selector: 'app-asistencia-tabla',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asistencia-tabla.html',
  styleUrl: './asistencia-tabla.css',
})
export class AsistenciaTabla {
  @Input() asistencias: Asistencia[] = [];
  @Input() paginaActual: number = 1;
  @Input() itemsPorPagina: number = 10;
  
  // 🔥 NUEVO: Recibir si el usuario es admin
  @Input() esAdmin: boolean = false;
  
  @Output() eliminar = new EventEmitter<string>();
  @Output() editar = new EventEmitter<Asistencia>();

  mostrarModalDetalle = false;
  asistenciaSeleccionada: Asistencia | null = null;

  // ==========================================
  // VER DETALLE DE ASISTENCIA
  // ==========================================
  verDetalleAsistencia(asistencia: Asistencia): void {
    console.log('Ver detalle de asistencia:', asistencia);
    this.asistenciaSeleccionada = asistencia;
    this.mostrarModalDetalle = true;
  }

  // ==========================================
  // EDITAR ASISTENCIA (solo si es admin)
  // ==========================================
  editarAsistencia(asistencia: Asistencia): void {
    if (!this.esAdmin) {
      alert('⛔ Solo los administradores pueden editar asistencias');
      return;
    }
    console.log('✏️ Editar asistencia:', asistencia);
    this.editar.emit(asistencia);
  }

  // ==========================================
  // ELIMINAR ASISTENCIA (solo si es admin)
  // ==========================================
  eliminarAsistencia(id: string): void {
    if (!this.esAdmin) {
      alert('⛔ Solo los administradores pueden eliminar asistencias');
      return;
    }
    console.log('🗑️ Solicitud de eliminar asistencia:', id);
    this.eliminar.emit(id);
  }

  // ==========================================
  // CERRAR MODAL DETALLE
  // ==========================================
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.asistenciaSeleccionada = null;
  }

  // ==========================================
  // FORMATEAR FECHA
  // ==========================================
  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // ==========================================
  // FORMATEAR HORA
  // ==========================================
  formatearHora(hora: string | undefined): string {
    return hora || '--';
  }

  // ==========================================
  // CALCULAR HORAS TRABAJADAS
  // ==========================================
  calcularHorasTrabajadas(entrada: string, salida?: string): string {
    if (!salida) return '--';

    try {
      const [horaE, minE] = entrada.split(':').map(Number);
      const [horaS, minS] = salida.split(':').map(Number);

      let totalMinutos = (horaS * 60 + minS) - (horaE * 60 + minE);
      
      if (totalMinutos < 0) {
        totalMinutos += 24 * 60;
      }

      const horas = Math.floor(totalMinutos / 60);
      const minutos = totalMinutos % 60;

      return `${horas}h ${minutos}m`;
    } catch (error) {
      console.error('Error al calcular horas:', error);
      return '--';
    }
  }

  // ==========================================
  // OBTENER CLASE CSS SEGÚN ESTADO
  // ==========================================
  obtenerClaseEstado(estado: string): string {
    const clases: { [key: string]: string } = {
      'presente': 'present',
      'ausente': 'absent',
      'tardanza': 'tardanza',
      'permiso': 'permission'
    };
    return clases[estado] || '';
  }

  // ==========================================
  // OBTENER TEXTO DEL ESTADO
  // ==========================================
  obtenerTextoEstado(estado: string): string {
    const textos: { [key: string]: string } = {
      'presente': 'Presente',
      'ausente': 'Ausente',
      'tardanza': 'Tardanza',
      'permiso': 'Permiso'
    };
    return textos[estado] || estado;
  }

  // ==========================================
  // OBTENER ÍNDICE GLOBAL PARA ID
  // ==========================================
  obtenerIndice(index: number): string {
    const indiceGlobal = (this.paginaActual - 1) * this.itemsPorPagina + index + 1;
    return `#${String(indiceGlobal).padStart(3, '0')}`;
  }
}