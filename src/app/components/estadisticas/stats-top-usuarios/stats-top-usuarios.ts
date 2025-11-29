import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenciaService } from '../../../services/asistencia.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Asistencia } from '../../../models/asistencia.model';
import { Usuario } from '../../../models/usuario.model';

interface EstadisticaUsuario {
  usuario: string;
  asistencias: number;
  tardanzas: number;
  faltas: number;
  porcentaje: number;
}

@Component({
  selector: 'app-stats-top-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-top-usuarios.html',
  styleUrl: './stats-top-usuarios.css',
})
export class StatsTopUsuarios implements OnInit {
  private asistenciaService = inject(AsistenciaService);
  private usuarioService = inject(UsuarioService);

  // Recibir fechas desde el componente padre
  @Input() fechaDesde: string = '';
  @Input() fechaHasta: string = '';

  topUsuarios: EstadisticaUsuario[] = [];
  isLoading = true;

  async ngOnInit(): Promise<void> {
    await this.cargarTopUsuarios();
  }

  // ==========================================
  // DETECTAR CAMBIOS EN LOS INPUTS
  // ==========================================
  async ngOnChanges(): Promise<void> {
    if (this.fechaDesde && this.fechaHasta) {
      await this.cargarTopUsuarios();
    }
  }

  // ==========================================
  // CARGAR TOP USUARIOS
  // ==========================================
  async cargarTopUsuarios(): Promise<void> {
    try {
      this.isLoading = true;

      // Obtener usuarios y asistencias
      const [usuarios, todasAsistencias] = await Promise.all([
        this.usuarioService.obtenerUsuarios(),
        this.asistenciaService.obtenerAsistencias()
      ]);

      // Filtrar por rango de fechas
      const desde = new Date(this.fechaDesde || new Date());
      const hasta = new Date(this.fechaHasta || new Date());
      desde.setHours(0, 0, 0, 0);
      hasta.setHours(23, 59, 59, 999);

      const asistenciasFiltradas = todasAsistencias.filter(a => {
        const fechaAsistencia = new Date(a.fecha);
        return fechaAsistencia >= desde && fechaAsistencia <= hasta;
      });

      console.log('🏆 Top Usuarios - Asistencias filtradas:', asistenciasFiltradas.length);
      console.log('📅 Rango:', desde, 'a', hasta);

      // Calcular días laborables del período
      const diasLaborables = this.calcularDiasLaborables(desde, hasta);
      console.log('📆 Días laborables del período:', diasLaborables);

      // Calcular estadísticas por usuario
      const estadisticas: EstadisticaUsuario[] = usuarios.map(usuario => {
        const asistenciasUsuario = asistenciasFiltradas.filter(a => a.usuarioId === usuario.uid);
        
        const presentes = asistenciasUsuario.filter(a => a.estado === 'presente').length;
        const tardanzas = asistenciasUsuario.filter(a => a.estado === 'tardanza').length;
        const faltas = asistenciasUsuario.filter(a => a.estado === 'ausente').length;
        
        // Porcentaje de asistencia = (presentes + tardanzas) / días laborables * 100
        const porcentaje = diasLaborables > 0 
          ? ((presentes + tardanzas) / diasLaborables) * 100 
          : 0;

        return {
          usuario: usuario.nombreCompleto,
          asistencias: presentes,
          tardanzas: tardanzas,
          faltas: faltas,
          porcentaje: parseFloat(Math.min(porcentaje, 100).toFixed(1))
        };
      });

      // Ordenar por porcentaje de asistencia (mayor a menor)
      estadisticas.sort((a, b) => b.porcentaje - a.porcentaje);

      // Tomar solo los top 10
      this.topUsuarios = estadisticas.slice(0, 10);

      console.log('✅ Top usuarios cargados:', this.topUsuarios);

    } catch (error) {
      console.error('❌ Error al cargar top usuarios:', error);
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
  // OBTENER CLASE DE BADGE SEGÚN PORCENTAJE
  // ==========================================
  obtenerClaseBadge(porcentaje: number): string {
    if (porcentaje >= 95) return 'success';
    if (porcentaje >= 85) return 'warning';
    return 'danger';
  }
}