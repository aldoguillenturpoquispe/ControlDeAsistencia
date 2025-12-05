import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Asistencia } from '../../../models/asistencia.model';
import { FechaFormatoPipe } from '../../../pipes/fecha-formato-pipe';
import { HorasTrabajadasPipe } from '../../../pipes/horas-trabajadas-pipe';
import { EstadoTextoPipe } from '../../../pipes/estado-texto-pipe';

@Component({
  selector: 'app-asistencia-tabla',
  standalone: true,
  imports: [
    CommonModule,
    // 🔥 AGREGAR LOS PIPES A LOS IMPORTS
    FechaFormatoPipe,
    HorasTrabajadasPipe,
    EstadoTextoPipe
  ],
  templateUrl: './asistencia-tabla.html',
  styleUrl: './asistencia-tabla.css',
})
export class AsistenciaTabla {
  @Input() asistencias: Asistencia[] = [];
  @Input() paginaActual: number = 1;
  @Input() itemsPorPagina: number = 10;
  @Input() esAdmin: boolean = false;
  
  @Output() eliminar = new EventEmitter<string>();
  @Output() editar = new EventEmitter<Asistencia>();

  mostrarModalDetalle = false;
  asistenciaSeleccionada: Asistencia | null = null;

  // VER DETALLE DE ASISTENCIA
  verDetalleAsistencia(asistencia: Asistencia): void {
    console.log('Ver detalle de asistencia:', asistencia);
    this.asistenciaSeleccionada = asistencia;
    this.mostrarModalDetalle = true;
  }

  // EDITAR ASISTENCIA (solo si es admin)
  editarAsistencia(asistencia: Asistencia): void {
    if (!this.esAdmin) {
      alert('⛔ Solo los administradores pueden editar asistencias');
      return;
    }
    console.log('✏️ Editar asistencia:', asistencia);
    this.editar.emit(asistencia);
  }

  // ELIMINAR ASISTENCIA (solo si es admin)
  eliminarAsistencia(id: string): void {
    if (!this.esAdmin) {
      alert('⛔ Solo los administradores pueden eliminar asistencias');
      return;
    }
    console.log('🗑️ Solicitud de eliminar asistencia:', id);
    this.eliminar.emit(id);
  }

  // CERRAR MODAL DETALLE
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.asistenciaSeleccionada = null;
  }

  // 🔥 MÉTODOS ELIMINADOS (ahora son pipes):
  // ❌ formatearFecha() - ahora es FechaFormatoPipe
  // ❌ formatearHora() - ahora se usa el operador || en el template
  // ❌ calcularHorasTrabajadas() - ahora es HorasTrabajadasPipe
  // ❌ obtenerTextoEstado() - ahora es EstadoTextoPipe

  // OBTENER CLASE CSS SEGÚN ESTADO
  obtenerClaseEstado(estado: string): string {
    const clases: { [key: string]: string } = {
      'presente': 'present',
      'ausente': 'absent',
      'tardanza': 'tardanza',
      'permiso': 'permission'
    };
    return clases[estado] || '';
  }

  // OBTENER ÍNDICE GLOBAL PARA ID
  obtenerIndice(index: number): string {
    const indiceGlobal = (this.paginaActual - 1) * this.itemsPorPagina + index + 1;
    return `#${String(indiceGlobal).padStart(3, '0')}`;
  }
}