import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-stats-export-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-export-actions.html',
  styleUrl: './stats-export-actions.css',
})
export class StatsExportActions {
  // Recibir datos desde el componente padre
  @Input() datosEstadisticas: any = {};
  @Input() periodo: string = 'mes';
  @Input() fechaDesde: string = '';
  @Input() fechaHasta: string = '';

  // Estado de carga para cada botón
  isExportingPDF = false;
  isExportingExcel = false;
  isSendingReport = false;

   // EXPORTAR PDF
   exportarPDF(): void {
    try {
      this.isExportingPDF = true;
      
      const doc = new jsPDF();
      const fechaActual = new Date().toLocaleDateString('es-PE');

      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(10, 35, 66);
      doc.text('Panel de Estadísticas', 105, 20, { align: 'center' });

      // Información del reporte
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generado: ${fechaActual}`, 14, 35);
      doc.text(`Período: ${this.periodo}`, 14, 42);
      doc.text(`Desde: ${this.fechaDesde} | Hasta: ${this.fechaHasta}`, 14, 49);

      // Línea separadora
      doc.setDrawColor(10, 35, 66);
      doc.line(14, 53, 196, 53);

      // Sección: Estadísticas Principales
      doc.setFontSize(14);
      doc.setTextColor(10, 35, 66);
      doc.text('Estadísticas Principales', 14, 62);

      const datosTabla = [
        ['Total Usuarios', this.datosEstadisticas.totalUsuarios?.toString() || '0', 'Registrados activos'],
        ['Asistencias Hoy', this.datosEstadisticas.asistenciasHoy?.toString() || '0', 'Presentes'],
        ['Faltas Hoy', this.datosEstadisticas.faltasHoy?.toString() || '0', 'Ausentes'],
        ['Porcentaje Asistencia', `${this.datosEstadisticas.porcentajeAsistencia || 0}%`, 'Del período seleccionado']
      ];

      autoTable(doc, {
        startY: 67,
        head: [['Indicador', 'Valor', 'Observación']],
        body: datosTabla,
        theme: 'grid',
        headStyles: { 
          fillColor: [10, 35, 66],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: { fontSize: 10, cellPadding: 5 }
      });

      // Sección: Resumen Adicional
      doc.setFontSize(14);
      doc.text('Resumen Adicional', 14, (doc as any).lastAutoTable.finalY + 15);

      const datosSecundarios = [
        ['Tardanzas del Período', this.datosEstadisticas.tardanzasMes?.toString() || '0'],
        ['Promedio Horas/Día', `${this.datosEstadisticas.promedioHoras || 0}h`],
        ['Días Laborables', this.datosEstadisticas.diasLaborables?.toString() || '0'],
        ['Mejor Asistencia', `${this.datosEstadisticas.mejorAsistencia || 0}%`]
      ];

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Métrica', 'Valor']],
        body: datosSecundarios,
        theme: 'striped',
        headStyles: { 
          fillColor: [10, 35, 66],
          textColor: 255
        },
        styles: { fontSize: 10 }
      });

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text('Sistema de Control de Asistencias', 105, 280, { align: 'center' });

      // Guardar PDF
      const nombreArchivo = `estadisticas_${fechaActual.replace(/\//g, '-')}.pdf`;
      doc.save(nombreArchivo);
 this.mostrarToast('✅ PDF descargado correctamente', 'success');

    } catch (error) {
      console.error('❌ Error al exportar PDF:', error);
      this.mostrarToast('❌ Error al exportar PDF', 'error');
    } finally {
      this.isExportingPDF = false;
    }
  }

   // EXPORTAR EXCEL
   exportarExcel(): void {
    try {
      this.isExportingExcel = true;

      const wb = XLSX.utils.book_new();
      const fechaActual = new Date().toLocaleDateString('es-PE');

      // Hoja 1: Resumen de Estadísticas
      const datosResumen = [
        ['PANEL DE ESTADÍSTICAS - CONTROL DE ASISTENCIAS'],
        [''],
        ['Información del Reporte'],
        ['Fecha de Generación:', fechaActual],
        ['Período Seleccionado:', this.periodo],
        ['Rango de Fechas:', `${this.fechaDesde} al ${this.fechaHasta}`],
        [''],
        ['ESTADÍSTICAS PRINCIPALES'],
        ['Indicador', 'Valor', 'Descripción'],
        ['Total Usuarios', this.datosEstadisticas.totalUsuarios || 0, 'Registrados activos'],
        ['Asistencias Hoy', this.datosEstadisticas.asistenciasHoy || 0, 'Presentes'],
        ['Faltas Hoy', this.datosEstadisticas.faltasHoy || 0, 'Ausentes'],
        ['Porcentaje Asistencia', `${this.datosEstadisticas.porcentajeAsistencia || 0}%`, 'Del período seleccionado'],
        [''],
        ['MÉTRICAS SECUNDARIAS'],
        ['Métrica', 'Valor', 'Descripción'],
        ['Tardanzas del Período', this.datosEstadisticas.tardanzasMes || 0, 'Total de tardanzas'],
        ['Promedio Horas/Día', `${this.datosEstadisticas.promedioHoras || 0}h`, 'Promedio trabajado'],
        ['Días Laborables', this.datosEstadisticas.diasLaborables || 0, 'Días hábiles'],
        ['Mejor Asistencia', `${this.datosEstadisticas.mejorAsistencia || 0}%`, 'Porcentaje máximo']
      ];

      const wsResumen = XLSX.utils.aoa_to_sheet(datosResumen);
      
      // Ajustar ancho de columnas
      wsResumen['!cols'] = [
        { wch: 30 },
        { wch: 15 },
        { wch: 40 }
      ];

      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Guardar archivo
      const nombreArchivo = `Estadisticas_${this.periodo}_${fechaActual.replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);
 this.mostrarToast('✅ Excel descargado correctamente', 'success');

    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      this.mostrarToast('❌ Error al exportar Excel', 'error');
    } finally {
      this.isExportingExcel = false;
    }
  }
   // VALIDAR EMAIL
   validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

   // MOSTRAR TOAST (NOTIFICACIÓN)
   mostrarToast(mensaje: string, tipo: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 4px;
      color: #fff;
      font-weight: 500;
      z-index: 2000;
      background: ${tipo === 'success' ? '#2e7d32' : '#c62828'};
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}