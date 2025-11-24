import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-asistencia-form-modal',
  imports: [],
  templateUrl: './asistencia-form-modal.html',
  styleUrl: './asistencia-form-modal.css',
})
export class AsistenciaFormModal {
  @Output() cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.cerrar.emit();
  }
}