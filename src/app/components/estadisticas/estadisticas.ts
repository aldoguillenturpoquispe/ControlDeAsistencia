import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsCharts } from './stats-charts/stats-charts';
import { StatsResumenEstados } from './stats-resumen-estados/stats-resumen-estados';
import { StatsTopUsuarios } from './stats-top-usuarios/stats-top-usuarios';
import { RouterLink } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    StatsCharts, 
    StatsResumenEstados, 
    StatsTopUsuarios
  ],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas {
  // Variables para los filtros
  periodo: string = 'mes';
  fechaDesde: string = '2025-11-01';
  fechaHasta: string = '2025-11-20';

  // Datos extraídos del HTML
  datosEstadisticas = {
    totalUsuarios: 120,
    asistenciasHoy: 95,
    faltasHoy: 25,
    porcentajeAsistencia: 79.2,
    tardanzasMes: 38,
    promedioHoras: 8.2,
    diasLaborables: 22,
    mejorAsistencia: 98
  };

  // Función para actualizar estadísticas
  actualizarEstadisticas() {
    console.log('Actualizando estadísticas con:', {
      periodo: this.periodo,
      desde: this.fechaDesde,
      hasta: this.fechaHasta
    });
  }

  // 📥 Exportar a PDF
  exportarPDF() {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString('es-ES');

    // Título
    doc.setFontSize(20);
    doc.setTextColor(10, 35, 66);
    doc.text('Panel de Estadísticas', 105, 20, { align: 'center' });

    // Info del período
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generado: ${fechaActual}`, 14, 35);
    doc.text(`Período: ${this.periodo}`, 14, 42);
    doc.text(`Desde: ${this.fechaDesde} | Hasta: ${this.fechaHasta}`, 14, 49);

    // Línea separadora
    doc.setDrawColor(10, 35, 66);
    doc.line(14, 53, 196, 53);

    // Tabla de estadísticas principales
    doc.setFontSize(14);
    doc.setTextColor(10, 35, 66);
    doc.text('Estadísticas Principales', 14, 62);

    const datosTabla = [
      ['Total Usuarios', this.datosEstadisticas.totalUsuarios.toString(), 'Registrados activos'],
      ['Asistencias Hoy', this.datosEstadisticas.asistenciasHoy.toString(), '+5 vs ayer'],
      ['Faltas Hoy', this.datosEstadisticas.faltasHoy.toString(), '-2 vs ayer'],
      ['Porcentaje Asistencia', `${this.datosEstadisticas.porcentajeAsistencia}%`, 'Del mes actual']
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

    // Estadísticas secundarias
    doc.setFontSize(14);
    doc.text('Resumen Adicional', 14, (doc as any).lastAutoTable.finalY + 15);

    const datosSecundarios = [
      ['Tardanzas Este Mes', this.datosEstadisticas.tardanzasMes.toString()],
      ['Promedio Horas/Día', `${this.datosEstadisticas.promedioHoras}h`],
      ['Días Laborables', this.datosEstadisticas.diasLaborables.toString()],
      ['Mejor Asistencia', `${this.datosEstadisticas.mejorAsistencia}%`]
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

    // Guardar
    doc.save(`estadisticas_${fechaActual.replace(/\//g, '-')}.pdf`);
    console.log('✅ PDF exportado correctamente');
  }

// 📊 Exportar a Excel (MEJORADO)
exportarExcel() {
  const wb = XLSX.utils.book_new();
  const fechaActual = new Date().toLocaleDateString('es-ES');

  // ============ HOJA 1: RESUMEN EJECUTIVO ============
  const datosResumen = [
    ['PANEL DE ESTADÍSTICAS - CONTROL DE ASISTENCIAS'],
    [''],
    ['Información del Reporte'],
    ['Fecha de Generación:', fechaActual],
    ['Período Seleccionado:', this.periodo],
    ['Rango de Fechas:', `${this.fechaDesde} al ${this.fechaHasta}`],
    [''],
    [''],
    ['TARJETAS PRINCIPALES'],
    ['Indicador', 'Valor', 'Comparación', 'Estado'],
    ['👥 Total Usuarios', this.datosEstadisticas.totalUsuarios, 'Registrados activos', '✓'],
    ['✅ Asistencias Hoy', this.datosEstadisticas.asistenciasHoy, '+5 vs ayer', '↑'],
    ['❌ Faltas Hoy', this.datosEstadisticas.faltasHoy, '-2 vs ayer', '↓'],
    [`📊 Porcentaje Asistencia`, `${this.datosEstadisticas.porcentajeAsistencia}%`, 'Del mes actual', '⚠'],
    [''],
    [''],
    ['MÉTRICAS SECUNDARIAS'],
    ['Métrica', 'Valor', 'Descripción'],
    ['Tardanzas Este Mes', this.datosEstadisticas.tardanzasMes, 'Total de llegadas tarde'],
    ['Promedio Horas/Día', `${this.datosEstadisticas.promedioHoras}h`, 'Promedio de horas trabajadas'],
    ['Días Laborables', this.datosEstadisticas.diasLaborables, 'Días hábiles del período'],
    ['Mejor Asistencia', `${this.datosEstadisticas.mejorAsistencia}%`, 'Porcentaje más alto registrado']
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(datosResumen);

  // Configurar anchos de columna
  wsResumen['!cols'] = [
    { wch: 28 },  // Columna A
    { wch: 18 },  // Columna B
    { wch: 28 },  // Columna C
    { wch: 12 }   // Columna D
  ];

  // Merge de celdas para el título
  wsResumen['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },  // Título principal
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },  // "Información del Reporte"
    { s: { r: 8, c: 0 }, e: { r: 8, c: 3 } },  // "TARJETAS PRINCIPALES"
    { s: { r: 16, c: 0 }, e: { r: 16, c: 2 } } // "MÉTRICAS SECUNDARIAS"
  ];

  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');


  // ============ HOJA 2: ANÁLISIS DETALLADO ============
  const analisis = [
    ['ANÁLISIS DETALLADO DE ASISTENCIAS'],
    [''],
    ['Período de Análisis:', `${this.fechaDesde} - ${this.fechaHasta}`],
    [''],
    ['DISTRIBUCIÓN POR ESTADO'],
    ['Estado', 'Cantidad', 'Porcentaje', 'Tendencia'],
    ['Presentes', this.datosEstadisticas.asistenciasHoy, 
     `${((this.datosEstadisticas.asistenciasHoy / this.datosEstadisticas.totalUsuarios) * 100).toFixed(1)}%`, 
     'Estable'],
    ['Ausentes', this.datosEstadisticas.faltasHoy, 
     `${((this.datosEstadisticas.faltasHoy / this.datosEstadisticas.totalUsuarios) * 100).toFixed(1)}%`, 
     'Disminuyendo'],
    ['Tardanzas', this.datosEstadisticas.tardanzasMes, 
     `${((this.datosEstadisticas.tardanzasMes / this.datosEstadisticas.totalUsuarios) * 100).toFixed(1)}%`, 
     'Variable'],
    [''],
    ['INDICADORES DE RENDIMIENTO (KPIs)'],
    ['Indicador', 'Valor Actual', 'Meta', 'Cumplimiento'],
    ['Tasa de Asistencia', `${this.datosEstadisticas.porcentajeAsistencia}%`, '85%', 
     this.datosEstadisticas.porcentajeAsistencia >= 85 ? 'Cumplido ✓' : 'Por mejorar ⚠'],
    ['Promedio Horas Diarias', `${this.datosEstadisticas.promedioHoras}h`, '8h', 
     this.datosEstadisticas.promedioHoras >= 8 ? 'Cumplido ✓' : 'Por mejorar ⚠'],
    ['Tasa de Puntualidad', `${(100 - (this.datosEstadisticas.tardanzasMes / this.datosEstadisticas.totalUsuarios * 100)).toFixed(1)}%`, 
     '90%', 'En progreso'],
    [''],
    ['COMPARATIVA TEMPORAL'],
    ['Período', 'Asistencias', 'Cambio'],
    ['Hoy', this.datosEstadisticas.asistenciasHoy, '+5'],
    ['Ayer', this.datosEstadisticas.asistenciasHoy - 5, 'Base'],
    ['Promedio Semanal', Math.round(this.datosEstadisticas.asistenciasHoy * 0.95), '-5%'],
    ['Promedio Mensual', Math.round(this.datosEstadisticas.asistenciasHoy * 0.92), '-8%']
  ];

  const wsAnalisis = XLSX.utils.aoa_to_sheet(analisis);

  wsAnalisis['!cols'] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 15 },
    { wch: 20 }
  ];

  wsAnalisis['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } },
    { s: { r: 10, c: 0 }, e: { r: 10, c: 3 } },
    { s: { r: 16, c: 0 }, e: { r: 16, c: 2 } }
  ];

  XLSX.utils.book_append_sheet(wb, wsAnalisis, 'Análisis Detallado');


  // ============ HOJA 3: DATOS CRUDOS ============
  const datosCrudos = [
    ['DATOS CRUDOS - EXPORTACIÓN COMPLETA'],
    ['Generado:', fechaActual, '', 'Período:', this.periodo],
    [''],
    ['TODAS LAS MÉTRICAS'],
    ['Métrica', 'Valor', 'Tipo', 'Unidad'],
    ['Total Usuarios', this.datosEstadisticas.totalUsuarios, 'Contador', 'usuarios'],
    ['Asistencias Hoy', this.datosEstadisticas.asistenciasHoy, 'Contador', 'personas'],
    ['Faltas Hoy', this.datosEstadisticas.faltasHoy, 'Contador', 'personas'],
    ['Porcentaje Asistencia', this.datosEstadisticas.porcentajeAsistencia, 'Porcentaje', '%'],
    ['Tardanzas Mes', this.datosEstadisticas.tardanzasMes, 'Contador', 'eventos'],
    ['Promedio Horas Día', this.datosEstadisticas.promedioHoras, 'Promedio', 'horas'],
    ['Días Laborables', this.datosEstadisticas.diasLaborables, 'Contador', 'días'],
    ['Mejor Asistencia', this.datosEstadisticas.mejorAsistencia, 'Porcentaje', '%'],
    [''],
    ['CÁLCULOS DERIVADOS'],
    ['Fórmula', 'Resultado'],
    ['Total Registros Hoy', this.datosEstadisticas.asistenciasHoy + this.datosEstadisticas.faltasHoy],
    ['Tasa de Ausencia', `${((this.datosEstadisticas.faltasHoy / this.datosEstadisticas.totalUsuarios) * 100).toFixed(2)}%`],
    ['Usuarios sin Registro', this.datosEstadisticas.totalUsuarios - (this.datosEstadisticas.asistenciasHoy + this.datosEstadisticas.faltasHoy)],
    ['Horas Totales Trabajadas (estimado)', `${(this.datosEstadisticas.asistenciasHoy * this.datosEstadisticas.promedioHoras).toFixed(1)}h`]
  ];

  const wsCrudos = XLSX.utils.aoa_to_sheet(datosCrudos);

  wsCrudos['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 }
  ];

  wsCrudos['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } },
    { s: { r: 14, c: 0 }, e: { r: 14, c: 1 } }
  ];

  XLSX.utils.book_append_sheet(wb, wsCrudos, 'Datos Crudos');


  // ============ GUARDAR ARCHIVO ============
  const nombreArchivo = `Estadisticas_Asistencias_${this.periodo}_${fechaActual.replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);
  
}

  // 📧 Enviar Reporte
  enviarReporte() {
    const email = prompt('Ingrese el correo electrónico de destino:');
    
    if (email && email.includes('@')) {
      console.log('Enviando reporte a:', email);
      console.log('Datos:', this.datosEstadisticas);
      
      // Simular envío (aquí integrarías tu backend)
      setTimeout(() => {
        alert(`✅ Reporte enviado exitosamente a ${email}`);
      }, 1000);
    } else if (email) {
      alert('❌ Email inválido');
    }
  }
}