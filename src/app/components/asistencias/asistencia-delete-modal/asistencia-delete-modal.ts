import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Asistencia } from '../../../models/asistencia.model';

@Component({
  selector: 'app-asistencia-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asistencia-delete-modal.html',
  styleUrl: './asistencia-delete-modal.css',
})
export class AsistenciaDeleteModal {
  @Input() asistencia!: Asistencia;
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  isDeleting = false;

  // Formatear fecha para mostrar
  get fechaFormateada(): string {
    if (!this.asistencia?.fecha) return '';
    
    const fecha = this.asistencia.fecha instanceof Date 
      ? this.asistencia.fecha 
      : new Date(this.asistencia.fecha);
    
    return fecha.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Obtener clase de estado
  getEstadoClass(): string {
    return `estado-badge ${this.asistencia?.estado || 'presente'}`;
  }

  // Obtener texto del estado
  getEstadoTexto(): string {
    const estados: { [key: string]: string } = {
      'presente': 'Presente',
      'ausente': 'Ausente',
      'tardanza': 'Tardanza',
      'permiso': 'Permiso'
    };
    return estados[this.asistencia?.estado || 'presente'] || 'Desconocido';
  }

  // Confirmar eliminación
  confirmarEliminacion(): void {
    this.isDeleting = true;
    this.confirmar.emit();
  }

  // Cancelar eliminación
  cancelarEliminacion(): void {
    this.cancelar.emit();
  }
}