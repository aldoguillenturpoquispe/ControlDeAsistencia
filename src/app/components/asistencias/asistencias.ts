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
  paginaActual = 1;
  totalPaginas = 5;

  abrirModal() {
    console.log('Abriendo modal...');
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      console.log('Página anterior:', this.paginaActual);
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      console.log('Página siguiente:', this.paginaActual);
    }
  }
}