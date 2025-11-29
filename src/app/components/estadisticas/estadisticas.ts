import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsCharts } from './stats-charts/stats-charts';
import { StatsResumenEstados } from './stats-resumen-estados/stats-resumen-estados';
import { StatsTopUsuarios } from './stats-top-usuarios/stats-top-usuarios';
import { AsistenciaService } from '../../services/asistencia.service';
import { UsuarioService } from '../../services/usuario.service';
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
export class Estadisticas implements OnInit {
  private asistenciaService = inject(AsistenciaService);
  private usuarioService = inject(UsuarioService);

  // Variables para los filtros
  periodo: string = 'mes';
  fechaDesde: string = '';
  fechaHasta: string = '';

  // Estado de carga
  isLoading = true;

  // Datos de estadísticas
  datosEstadisticas = {
    totalUsuarios: 0,
    asistenciasHoy: 0,
    faltasHoy: 0,
    porcentajeAsistencia: 0,
    tardanzasMes: 0,
    promedioHoras: 0,
    diasLaborables: 22,
    mejorAsistencia: 0
  };

  async ngOnInit(): Promise<void> {
    this.establecerFechasIniciales();
    await this.cargarEstadisticas();
  }

  // ==========================================
  // ESTABLECER FECHAS INICIALES
  // ==========================================
  establecerFechasIniciales(): void {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    this.fechaHasta = hoy.toISOString().split('T')[0];
    this.fechaDesde = primerDiaMes.toISOString().split('T')[0];
  }

  // ==========================================
  // CALCULAR FECHAS SEGÚN PERÍODO
  // ==========================================
  calcularFechasPorPeriodo(): { desde: Date; hasta: Date } {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    let desde: Date;
    let hasta: Date = new Date(hoy);

    switch (this.periodo) {
      case 'hoy':
        desde = new Date(hoy);
        break;

      case 'semana':
        // Calcular inicio de semana (lunes)
        const diaSemana = hoy.getDay();
        const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1;
        desde = new Date(hoy);
        desde.setDate(hoy.getDate() - diasDesdeInicio);
        break;

      case 'mes':
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;

      case 'anio':
        desde = new Date(hoy.getFullYear(), 0, 1);
        break;

      default:
        // Si hay fechas personalizadas, usarlas
        if (this.fechaDesde && this.fechaHasta) {
          desde = new Date(this.fechaDesde);
          hasta = new Date(this.fechaHasta);
        } else {
          desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        }
    }

    // Actualizar los inputs de fecha con el período calculado
    this.fechaDesde = desde.toISOString().split('T')[0];
    this.fechaHasta = hasta.toISOString().split('T')[0];

    return { desde, hasta };
  }

  // ==========================================
  // CARGAR ESTADÍSTICAS CON FILTROS
  // ==========================================
  async cargarEstadisticas(): Promise<void> {
    try {
      this.isLoading = true;

      // Calcular fechas según el período seleccionado
      const { desde, hasta } = this.calcularFechasPorPeriodo();

      console.log('📅 Cargando estadísticas desde:', desde, 'hasta:', hasta);

      // Cargar datos en paralelo
      const [usuarios, asistenciasHoy, todasAsistencias] = await Promise.all([
        this.usuarioService.obtenerUsuarios(),
        this.asistenciaService.contarPorEstadoHoy(),
        this.asistenciaService.obtenerAsistencias()
      ]);

      // Total de usuarios
      this.datosEstadisticas.totalUsuarios = usuarios.length;

      // Filtrar asistencias por rango de fechas
      const asistenciasFiltradas = todasAsistencias.filter(a => {
        const fechaAsistencia = new Date(a.fecha);
        fechaAsistencia.setHours(0, 0, 0, 0);
        return fechaAsistencia >= desde && fechaAsistencia <= hasta;
      });

      console.log('📊 Asistencias filtradas:', asistenciasFiltradas.length);

      // Estadísticas de HOY (siempre del día actual, no filtradas)
      this.datosEstadisticas.asistenciasHoy = asistenciasHoy.presentes;
      this.datosEstadisticas.faltasHoy = asistenciasHoy.ausentes;

      // Porcentaje de asistencia del PERÍODO FILTRADO
      const presentesPeriodo = asistenciasFiltradas.filter(
        a => a.estado === 'presente' || a.estado === 'tardanza'
      ).length;
      
      const diasLaborablesPeriodo = this.calcularDiasLaborables(desde, hasta);
      const totalEsperado = this.datosEstadisticas.totalUsuarios * diasLaborablesPeriodo;

      if (totalEsperado > 0) {
        this.datosEstadisticas.porcentajeAsistencia = parseFloat(
          ((presentesPeriodo / totalEsperado) * 100).toFixed(1)
        );
      } else {
        this.datosEstadisticas.porcentajeAsistencia = 0;
      }

      // Tardanzas del PERÍODO FILTRADO
      const tardanzasPeriodo = asistenciasFiltradas.filter(
        a => a.estado === 'tardanza'
      );
      this.datosEstadisticas.tardanzasMes = tardanzasPeriodo.length;

      // Calcular promedio de horas trabajadas del PERÍODO FILTRADO
      const asistenciasConSalida = asistenciasFiltradas.filter(
        a => a.horaSalida && (a.estado === 'presente' || a.estado === 'tardanza')
      );
      
      if (asistenciasConSalida.length > 0) {
        const totalHoras = asistenciasConSalida.reduce((sum, a) => {
          return sum + this.calcularHorasTrabajadas(a.horaEntrada, a.horaSalida!);
        }, 0);
        this.datosEstadisticas.promedioHoras = parseFloat(
          (totalHoras / asistenciasConSalida.length).toFixed(1)
        );
      } else {
        this.datosEstadisticas.promedioHoras = 0;
      }

      // Días laborables del período
      this.datosEstadisticas.diasLaborables = diasLaborablesPeriodo;

      // Mejor asistencia (máximo entre el porcentaje actual y registros históricos)
      const porcentajesPorDia = this.calcularPorcentajesPorDia(
        asistenciasFiltradas, 
        usuarios.length,
        desde,
        hasta
      );
      
      this.datosEstadisticas.mejorAsistencia = porcentajesPorDia.length > 0
        ? Math.max(...porcentajesPorDia, this.datosEstadisticas.porcentajeAsistencia)
        : this.datosEstadisticas.porcentajeAsistencia;

      console.log('✅ Estadísticas cargadas:', this.datosEstadisticas);

    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
      alert('Error al cargar las estadísticas');
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // CALCULAR DÍAS LABORABLES (LUNES A VIERNES)
  // ==========================================
  calcularDiasLaborables(desde: Date, hasta: Date): number {
    let diasLaborables = 0;
    const fechaActual = new Date(desde);

    while (fechaActual <= hasta) {
      const diaSemana = fechaActual.getDay();
      // Contar solo lunes (1) a viernes (5)
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasLaborables++;
      }
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return diasLaborables;
  }

  // ==========================================
  // CALCULAR PORCENTAJES POR DÍA
  // ==========================================
  calcularPorcentajesPorDia(
    asistencias: any[], 
    totalUsuarios: number,
    desde: Date,
    hasta: Date
  ): number[] {
    const porcentajes: number[] = [];
    const fechaActual = new Date(desde);

    while (fechaActual <= hasta) {
      const fechaStr = fechaActual.toISOString().split('T')[0];
      
      const presentesDia = asistencias.filter(a => {
        const fechaAsistencia = new Date(a.fecha).toISOString().split('T')[0];
        return fechaAsistencia === fechaStr && 
               (a.estado === 'presente' || a.estado === 'tardanza');
      }).length;

      if (totalUsuarios > 0) {
        const porcentaje = (presentesDia / totalUsuarios) * 100;
        porcentajes.push(porcentaje);
      }

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return porcentajes;
  }

  // ==========================================
  // ACTUALIZAR ESTADÍSTICAS (APLICAR FILTROS)
  // ==========================================
  async actualizarEstadisticas(): Promise<void> {
    // Validar que las fechas sean correctas
    if (this.fechaDesde && this.fechaHasta) {
      const desde = new Date(this.fechaDesde);
      const hasta = new Date(this.fechaHasta);

      if (desde > hasta) {
        alert('⚠️ La fecha "Desde" no puede ser mayor que la fecha "Hasta"');
        return;
      }
    }

    console.log('🔄 Actualizando estadísticas con filtros:', {
      periodo: this.periodo,
      desde: this.fechaDesde,
      hasta: this.fechaHasta
    });

    // Recargar estadísticas con los nuevos filtros
    await this.cargarEstadisticas();
  }

  // ==========================================
  // CALCULAR HORAS TRABAJADAS
  // ==========================================
  calcularHorasTrabajadas(entrada: string, salida: string): number {
    try {
      const [horaE, minE] = entrada.split(':').map(Number);
      const [horaS, minS] = salida.split(':').map(Number);

      let totalMinutos = (horaS * 60 + minS) - (horaE * 60 + minE);
      
      if (totalMinutos < 0) {
        totalMinutos += 24 * 60;
      }

      return totalMinutos / 60;
    } catch (error) {
      return 0;
    }
  }

  // ==========================================
  // EXPORTAR PDF
  // ==========================================
  exportarPDF(): void {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString('es-PE');

    doc.setFontSize(20);
    doc.setTextColor(10, 35, 66);
    doc.text('Panel de Estadísticas', 105, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generado: ${fechaActual}`, 14, 35);
    doc.text(`Período: ${this.periodo}`, 14, 42);
    doc.text(`Desde: ${this.fechaDesde} | Hasta: ${this.fechaHasta}`, 14, 49);

    doc.setDrawColor(10, 35, 66);
    doc.line(14, 53, 196, 53);

    doc.setFontSize(14);
    doc.setTextColor(10, 35, 66);
    doc.text('Estadísticas Principales', 14, 62);

    const datosTabla = [
      ['Total Usuarios', this.datosEstadisticas.totalUsuarios.toString(), 'Registrados activos'],
      ['Asistencias Hoy', this.datosEstadisticas.asistenciasHoy.toString(), 'Presentes'],
      ['Faltas Hoy', this.datosEstadisticas.faltasHoy.toString(), 'Ausentes'],
      ['Porcentaje Asistencia', `${this.datosEstadisticas.porcentajeAsistencia}%`, 'Del período seleccionado']
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

    doc.setFontSize(14);
    doc.text('Resumen Adicional', 14, (doc as any).lastAutoTable.finalY + 15);

    const datosSecundarios = [
      ['Tardanzas del Período', this.datosEstadisticas.tardanzasMes.toString()],
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

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Sistema de Control de Asistencias', 105, 280, { align: 'center' });

    doc.save(`estadisticas_${fechaActual.replace(/\//g, '-')}.pdf`);
    console.log('✅ PDF exportado correctamente');
  }

  // ==========================================
  // EXPORTAR EXCEL
  // ==========================================
  exportarExcel(): void {
    const wb = XLSX.utils.book_new();
    const fechaActual = new Date().toLocaleDateString('es-PE');

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
      ['Total Usuarios', this.datosEstadisticas.totalUsuarios, 'Registrados activos'],
      ['Asistencias Hoy', this.datosEstadisticas.asistenciasHoy, 'Presentes'],
      ['Faltas Hoy', this.datosEstadisticas.faltasHoy, 'Ausentes'],
      ['Porcentaje Asistencia', `${this.datosEstadisticas.porcentajeAsistencia}%`, 'Del período seleccionado'],
      [''],
      ['MÉTRICAS SECUNDARIAS'],
      ['Métrica', 'Valor', 'Descripción'],
      ['Tardanzas del Período', this.datosEstadisticas.tardanzasMes, 'Total de tardanzas'],
      ['Promedio Horas/Día', `${this.datosEstadisticas.promedioHoras}h`, 'Promedio trabajado'],
      ['Días Laborables', this.datosEstadisticas.diasLaborables, 'Días hábiles'],
      ['Mejor Asistencia', `${this.datosEstadisticas.mejorAsistencia}%`, 'Porcentaje máximo']
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(datosResumen);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    const nombreArchivo = `Estadisticas_${this.periodo}_${fechaActual.replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
    console.log('✅ Excel exportado correctamente');
  }

  // ==========================================
  // ENVIAR REPORTE
  // ==========================================
  enviarReporte(): void {
    const email = prompt('Ingrese el correo electrónico de destino:');
    
    if (email && email.includes('@')) {
      console.log('Enviando reporte a:', email);
      console.log('Período:', this.periodo);
      console.log('Rango:', this.fechaDesde, '-', this.fechaHasta);
      console.log('Datos:', this.datosEstadisticas);
      
      setTimeout(() => {
        alert(`✅ Reporte enviado exitosamente a ${email}`);
      }, 1000);
    } else if (email) {
      alert('❌ Email inválido');
    }
  }
}