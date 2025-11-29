import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Asistencia } from '../../../models/asistencia.model';

@Component({
  selector: 'app-reportes-tabla',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-tabla.html',
  styleUrl: './reportes-tabla.css',
})
export class ReportesTabla {
  @Input() reportes: Asistencia[] = [];
  @Input() paginaActual: number = 1;
  @Input() itemsPorPagina: number = 10;

  /**
   * Formatea la fecha a formato legible
   */
  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '--';
    
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const año = fechaObj.getFullYear();
    
    return `${dia}/${mes}/${año}`;
  }

  /**
   * Formatea la hora a formato HH:MM
   */
  formatearHora(hora: string | undefined): string {
    if (!hora) return '--';
    return hora;
  }

  /**
   * Calcula las horas trabajadas entre entrada y salida
   */
  calcularHorasTrabajadas(entrada: string | undefined, salida: string | undefined): string {
    if (!entrada || !salida) return '--';
    
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

  /**
   * Obtiene el texto del estado
   */
  obtenerTextoEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'presente': 'Presente',
      'ausente': 'Ausente',
      'tardanza': 'Tardanza',
      'permiso': 'Permiso'
    };
    
    return estados[estado] || estado;
  }

  /**
   * Obtiene índice global para ID
   */
  obtenerIndice(index: number): string {
    const indiceGlobal = (this.paginaActual - 1) * this.itemsPorPagina + index + 1;
    return `#${String(indiceGlobal).padStart(3, '0')}`;
  }
}