import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenciaFormModal } from './asistencia-form-modal/asistencia-form-modal';
import { AsistenciaTabla } from './asistencia-tabla/asistencia-tabla';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [CommonModule, AsistenciaFormModal, AsistenciaTabla],
  templateUrl: './asistencias.html',
  styleUrl: './asistencias.css',
})
export class Asistencias {
  mostrarModal = false;

  abrirModal() {
    console.log('Abriendo modal...');
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }
}