import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asistencia-tabla',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asistencia-tabla.html',
  styleUrl: './asistencia-tabla.css',
})
export class AsistenciaTabla {
  mostrarModalEditar = false;
  mostrarModalDetalle = false;
  asistenciaSeleccionada: any = null;

  editarAsistencia(id: string) {
    console.log('Editar asistencia:', id);
    this.asistenciaSeleccionada = { id }; // Aquí cargarías los datos reales
    this.mostrarModalEditar = true;
  }

  eliminarAsistencia(id: string) {
    console.log('Eliminar asistencia:', id);
    if (confirm('¿Estás seguro de eliminar esta asistencia?')) {
      alert('Asistencia eliminada correctamente');
    }
  }

  verDetalleAsistencia(id: string) {
    console.log('Ver detalle de asistencia:', id);
    this.asistenciaSeleccionada = { id }; // Aquí cargarías los datos reales
    this.mostrarModalDetalle = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.asistenciaSeleccionada = null;
  }

  cerrarModalDetalle() {
    this.mostrarModalDetalle = false;
    this.asistenciaSeleccionada = null;
  }
}