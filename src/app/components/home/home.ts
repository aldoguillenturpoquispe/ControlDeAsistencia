import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AsistenciaService } from '../../services/asistencia.service';
import { UsuarioService } from '../../services/usuario.service';
import { Asistencia } from '../../models/asistencia.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private asistenciaService = inject(AsistenciaService);
  private usuarioService = inject(UsuarioService);

  // Estadísticas
  totalEmpleados: number = 0;
  presentesHoy: number = 0;
  ausentesHoy: number = 0;
  porcentajeAsistencia: number = 0;

  // Últimas asistencias
  ultimasAsistencias: Asistencia[] = [];
  
  // Estado de carga
  isLoading: boolean = true;

  async ngOnInit(): Promise<void> {
    await this.cargarDatos();
  }

   // CARGAR TODOS LOS DATOS
   async cargarDatos(): Promise<void> {
    try {
      this.isLoading = true;

      // Cargar datos en paralelo
      const [usuarios, estadisticas, ultimas] = await Promise.all([
        this.usuarioService.obtenerTodosLosUsuarios(),
        this.asistenciaService.contarPorEstadoHoy(),
        this.asistenciaService.obtenerUltimasAsistencias(5)
      ]);

      // Actualizar estadísticas
      this.totalEmpleados = usuarios.length;
      this.presentesHoy = estadisticas.presentes;
      this.ausentesHoy = estadisticas.ausentes;
      
      // Calcular porcentaje de asistencia
      if (this.totalEmpleados > 0) {
        this.porcentajeAsistencia = Math.round(
          (this.presentesHoy / this.totalEmpleados) * 100
        );
      }

      // Actualizar últimas asistencias
      this.ultimasAsistencias = ultimas;
 console.log('Total empleados:', this.totalEmpleados);
 console.log('Últimas asistencias:', this.ultimasAsistencias);

    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
    } finally {
      this.isLoading = false;
    }
  }

   // FORMATEAR FECHA Y HORA
   formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearHora(hora: string): string {
    return hora || 'Sin registro';
  }

   // OBTENER CLASE CSS SEGÚN ESTADO
   obtenerClaseEstado(estado: string): string {
    const clases: { [key: string]: string } = {
      'presente': 'present',
      'ausente': 'absent',
      'tardanza': 'late',
      'permiso': 'permission'
    };
    return clases[estado] || '';
  }

   // OBTENER TEXTO DEL ESTADO
   obtenerTextoEstado(estado: string): string {
    const textos: { [key: string]: string } = {
      'presente': 'Presente',
      'ausente': 'Ausente',
      'tardanza': 'Tardanza',
      'permiso': 'Permiso'
    };
    return textos[estado] || estado;
  }
}