import { Component } from '@angular/core';
import { ReportesTabla } from './components/reportes/reportes-tabla/reportes-tabla';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [ReportesTabla], // 👈 AGREGAR
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes {
  paginaActual = 1;
  totalPaginas = 5;

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }
}