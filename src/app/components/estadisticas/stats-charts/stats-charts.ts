import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenciaService } from '../../../services/asistencia.service';
import { Asistencia } from '../../../models/asistencia.model';

@Component({
  selector: 'app-stats-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-charts.html',
  styleUrl: './stats-charts.css',
})
export class StatsCharts implements OnInit {
  private asistenciaService = inject(AsistenciaService);

  // Recibir fechas desde el componente padre
  @Input() fechaDesde: string = '';
  @Input() fechaHasta: string = '';

  // Datos para gráfico semanal
  datosSemanal = {
    lunes: 0,
    martes: 0,
    miercoles: 0,
    jueves: 0,
    viernes: 0
  };

  // Datos para gráfico mensual
  datosMensual: { mes: string; cantidad: number }[] = [];

  // Porcentajes para las barras
  porcentajesSemanal = {
    lunes: 0,
    martes: 0,
    miercoles: 0,
    jueves: 0,
    viernes: 0
  };

  isLoading = true;

  async ngOnInit(): Promise<void> {
    await this.cargarDatosGraficos();
  }

  // ==========================================
  // DETECTAR CAMBIOS EN LOS INPUTS
  // ==========================================
  async ngOnChanges(): Promise<void> {
    if (this.fechaDesde && this.fechaHasta) {
      await this.cargarDatosGraficos();
    }
  }

  // ==========================================
  // CARGAR DATOS DE LOS GRÁFICOS
  // ==========================================
  async cargarDatosGraficos(): Promise<void> {
    try {
      this.isLoading = true;

      // Obtener todas las asistencias
      const todasAsistencias = await this.asistenciaService.obtenerAsistencias();

      // Filtrar por rango de fechas
      const desde = new Date(this.fechaDesde || new Date());
      const hasta = new Date(this.fechaHasta || new Date());
      desde.setHours(0, 0, 0, 0);
      hasta.setHours(23, 59, 59, 999);

      const asistenciasFiltradas = todasAsistencias.filter(a => {
        const fechaAsistencia = new Date(a.fecha);
        return fechaAsistencia >= desde && fechaAsistencia <= hasta;
      });

      console.log('📊 Charts - Asistencias filtradas:', asistenciasFiltradas.length);

      // Calcular datos semanales
      this.calcularDatosSemanal(asistenciasFiltradas, desde, hasta);

      // Calcular datos mensuales
      this.calcularDatosMensual(asistenciasFiltradas, desde, hasta);

      console.log('✅ Datos de gráficos cargados');
      console.log('Semanal:', this.datosSemanal);
      console.log('Mensual:', this.datosMensual);

    } catch (error) {
      console.error('❌ Error al cargar datos de gráficos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // CALCULAR DATOS SEMANAL
  // ==========================================
  calcularDatosSemanal(asistencias: Asistencia[], desde: Date, hasta: Date): void {
    // Reiniciar contadores
    this.datosSemanal = {
      lunes: 0,
      martes: 0,
      miercoles: 0,
      jueves: 0,
      viernes: 0
    };

    // Si el rango es muy amplio (más de 7 días), usar la última semana del rango
    const diferenciaDias = Math.floor((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24));
    
    let inicioSemana: Date;
    
    if (diferenciaDias > 7) {
      // Usar la última semana del rango
      inicioSemana = new Date(hasta);
      const diaSemana = inicioSemana.getDay();
      const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1;
      inicioSemana.setDate(inicioSemana.getDate() - diasDesdeInicio);
      inicioSemana.setHours(0, 0, 0, 0);
    } else {
      // Usar el inicio del rango
      inicioSemana = new Date(desde);
    }

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    // Filtrar asistencias de esta semana
    const asistenciasSemana = asistencias.filter(a => {
      const fecha = new Date(a.fecha);
      return fecha >= inicioSemana && 
             fecha <= finSemana && 
             (a.estado === 'presente' || a.estado === 'tardanza');
    });

    console.log('📅 Rango semanal:', inicioSemana, 'a', finSemana);
    console.log('📊 Asistencias semana:', asistenciasSemana.length);

    // Contar por día
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    dias.forEach((dia, index) => {
      const cantidad = asistenciasSemana.filter(a => {
        const fecha = new Date(a.fecha);
        const diaFecha = fecha.getDay();
        // Convertir: lunes=1, martes=2, etc.
        return diaFecha === (index + 1);
      }).length;

      (this.datosSemanal as any)[dia] = cantidad;
    });

    // Calcular porcentajes para las barras (máximo = 100%)
    const maxAsistencias = Math.max(...Object.values(this.datosSemanal), 1);
    
    dias.forEach(dia => {
      (this.porcentajesSemanal as any)[dia] = 
        ((this.datosSemanal as any)[dia] / maxAsistencias) * 100;
    });
  }

  // ==========================================
  // CALCULAR DATOS MENSUAL
  // ==========================================
  calcularDatosMensual(asistencias: Asistencia[], desde: Date, hasta: Date): void {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    this.datosMensual = [];

    // Calcular cuántos meses hay en el rango
    const mesInicio = desde.getMonth();
    const anioInicio = desde.getFullYear();
    const mesFin = hasta.getMonth();
    const anioFin = hasta.getFullYear();

    const totalMeses = (anioFin - anioInicio) * 12 + (mesFin - mesInicio) + 1;

    // Limitar a máximo 12 meses
    const mesesAMostrar = Math.min(totalMeses, 12);
    
    // Calcular desde qué mes empezar (si hay más de 12 meses, mostrar los últimos 12)
    const mesInicioCalculo = totalMeses > 12 
      ? new Date(hasta.getFullYear(), hasta.getMonth() - 11, 1)
      : new Date(anioInicio, mesInicio, 1);

    // Generar datos para cada mes
    for (let i = 0; i < mesesAMostrar; i++) {
      const fechaMes = new Date(mesInicioCalculo);
      fechaMes.setMonth(mesInicioCalculo.getMonth() + i);
      
      const mes = meses[fechaMes.getMonth()];
      const mesNumero = fechaMes.getMonth();
      const anio = fechaMes.getFullYear();

      // Contar asistencias de ese mes
      const cantidad = asistencias.filter(a => {
        const fechaAsistencia = new Date(a.fecha);
        return fechaAsistencia.getMonth() === mesNumero && 
               fechaAsistencia.getFullYear() === anio &&
               (a.estado === 'presente' || a.estado === 'tardanza');
      }).length;

      this.datosMensual.push({ 
        mes: mesesAMostrar > 6 ? mes : `${mes} ${anio}`, 
        cantidad 
      });
    }

    // Si hay menos de 6 meses, asegurar que haya al menos 6 puntos para el gráfico
    while (this.datosMensual.length < 6) {
      this.datosMensual.unshift({ mes: '-', cantidad: 0 });
    }
  }

  // ==========================================
  // OBTENER PUNTOS PARA EL SVG (GRÁFICO DE LÍNEA)
  // ==========================================
  obtenerPuntosSVG(): string {
    if (this.datosMensual.length === 0) return '0,150';

    const maxCantidad = Math.max(...this.datosMensual.map(d => d.cantidad), 1);
    const anchoTotal = 400;
    const alturaTotal = 200;
    const espaciado = anchoTotal / (this.datosMensual.length - 1 || 1);

    const puntos = this.datosMensual.map((dato, index) => {
      const x = index * espaciado;
      const y = alturaTotal - ((dato.cantidad / maxCantidad) * (alturaTotal - 30));
      return `${x},${y}`;
    });

    return puntos.join(' ');
  }

  // ==========================================
  // OBTENER CÍRCULOS PARA EL SVG
  // ==========================================
  obtenerCirculosSVG(): { cx: number; cy: number }[] {
    if (this.datosMensual.length === 0) return [];

    const maxCantidad = Math.max(...this.datosMensual.map(d => d.cantidad), 1);
    const anchoTotal = 400;
    const alturaTotal = 200;
    const espaciado = anchoTotal / (this.datosMensual.length - 1 || 1);

    return this.datosMensual.map((dato, index) => {
      const cx = index * espaciado;
      const cy = alturaTotal - ((dato.cantidad / maxCantidad) * (alturaTotal - 30));
      return { cx, cy };
    });
  }

  // ==========================================
  // OBTENER ETIQUETAS DE MESES
  // ==========================================
  obtenerEtiquetasMeses(): string[] {
    return this.datosMensual.map(d => d.mes);
  }
}