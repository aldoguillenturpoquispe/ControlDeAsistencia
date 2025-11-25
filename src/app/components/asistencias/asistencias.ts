import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 AGREGAR ESTO
import { AsistenciaFormModal } from './asistencia-form-modal/asistencia-form-modal';
import { AsistenciaTabla } from './asistencia-tabla/asistencia-tabla';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [CommonModule, FormsModule, AsistenciaFormModal, AsistenciaTabla], // 👈 AGREGAR FormsModule
  templateUrl: './asistencias.html',
  styleUrl: './asistencias.css',
})
export class Asistencias {
  mostrarModal = false;
  paginaActual = 1;
  totalPaginas = 5;

  // 👇 Variables para los filtros
  filtroFecha: string = '';
  filtroUsuario: string = '';
  filtroEstado: string = '';

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

  // 👇 Función para limpiar filtros
  limpiarFiltros() {
    this.filtroFecha = '';
    this.filtroUsuario = '';
    this.filtroEstado = '';
    console.log('Filtros limpiados');
  }

  // 👇 Función para aplicar filtros (opcional)
  aplicarFiltros() {
    console.log('Filtrando por:', {
      fecha: this.filtroFecha,
      usuario: this.filtroUsuario,
      estado: this.filtroEstado
    });
    // Aquí irá la lógica de filtrado
  }
}