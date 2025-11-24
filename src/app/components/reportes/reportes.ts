import { Component } from '@angular/core';

@Component({
  selector: 'app-reportes',
  imports: [],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes {
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
