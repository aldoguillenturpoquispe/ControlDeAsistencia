import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../../../services/asistencia.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario.model';
import { Asistencia } from '../../../models/asistencia.model';

@Component({
  selector: 'app-asistencia-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia-form-modal.html',
  styleUrl: './asistencia-form-modal.css',
})
export class AsistenciaFormModal implements OnInit {
  private asistenciaService = inject(AsistenciaService);
  private usuarioService = inject(UsuarioService);

  @Output() cerrar = new EventEmitter<boolean>();

  // Datos del formulario
  usuarioId: string = '';
  fecha: string = '';
  horaEntrada: string = '';
  horaSalida: string = '';
  estado: 'presente' | 'ausente' | 'tardanza' | 'permiso' = 'presente';
  observaciones: string = '';

  // Lista de usuarios
  usuarios: Usuario[] = [];
  isLoading = false;
  isSaving = false;

  // Errores
  errores = {
    usuarioId: '',
    fecha: '',
    horaEntrada: '',
    horaSalida: ''
  };

  async ngOnInit(): Promise<void> {
    await this.cargarUsuarios();
    this.establecerFechaActual();
  }

  // ==========================================
  // CARGAR LISTA DE USUARIOS
  // ==========================================
  async cargarUsuarios(): Promise<void> {
    try {
      this.isLoading = true;
      this.usuarios = await this.usuarioService.obtenerUsuarios();
      console.log('✅ Usuarios cargados:', this.usuarios.length);
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      alert('Error al cargar la lista de usuarios');
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // ESTABLECER FECHA ACTUAL
  // ==========================================
  establecerFechaActual(): void {
    const hoy = new Date();
    this.fecha = hoy.toISOString().split('T')[0];
  }

  // ==========================================
  // VALIDAR FORMULARIO
  // ==========================================
  validarFormulario(): boolean {
    let valido = true;
    
    // Limpiar errores previos
    this.errores = {
      usuarioId: '',
      fecha: '',
      horaEntrada: '',
      horaSalida: ''
    };

    // Validar usuario
    if (!this.usuarioId) {
      this.errores.usuarioId = 'Debe seleccionar un usuario';
      valido = false;
    }

    // Validar fecha
    if (!this.fecha) {
      this.errores.fecha = 'La fecha es obligatoria';
      valido = false;
    }

    // Validar hora de entrada
    if (!this.horaEntrada) {
      this.errores.horaEntrada = 'La hora de entrada es obligatoria';
      valido = false;
    }

    // Validar que hora de salida sea mayor que hora de entrada
    if (this.horaEntrada && this.horaSalida) {
      if (this.horaSalida <= this.horaEntrada) {
        this.errores.horaSalida = 'La hora de salida debe ser mayor que la de entrada';
        valido = false;
      }
    }

    return valido;
  }

  // ==========================================
  // GUARDAR ASISTENCIA
  // ==========================================
  async guardarAsistencia(): Promise<void> {
    // Validar formulario
    if (!this.validarFormulario()) {
      console.log('⚠️ Formulario inválido');
      return;
    }

    try {
      this.isSaving = true;

      // Buscar el usuario seleccionado
      const usuario = this.usuarios.find(u => u.uid === this.usuarioId);
      if (!usuario) {
        alert('Usuario no encontrado');
        return;
      }

      // Crear fecha local sin problemas de zona horaria
      const [year, month, day] = this.fecha.split('-').map(Number);
      const fechaLocal = new Date(year, month - 1, day, 12, 0, 0); // Usar mediodía para evitar problemas de zona horaria

      // Crear objeto de asistencia
      const nuevaAsistencia: Asistencia = {
        usuarioId: this.usuarioId,
        nombreCompleto: usuario.nombreCompleto,
        fecha: fechaLocal,
        horaEntrada: this.horaEntrada,
        horaSalida: this.horaSalida || undefined,
        estado: this.estado,
        observaciones: this.observaciones || undefined
      };

      console.log('📅 Fecha a guardar:', {
        fechaOriginal: this.fecha,
        fechaLocal: fechaLocal,
        fechaISO: fechaLocal.toISOString()
      });

      // Guardar en Firebase
      const id = await this.asistenciaService.crearAsistencia(nuevaAsistencia);
      
      console.log('✅ Asistencia guardada con ID:', id);
      alert('✅ Asistencia registrada correctamente');
      
      // Cerrar modal e indicar que se guardó
      this.cerrar.emit(true);

    } catch (error) {
      console.error('❌ Error al guardar asistencia:', error);
      alert('❌ Error al guardar la asistencia. Intenta nuevamente.');
    } finally {
      this.isSaving = false;
    }
  }

  // ==========================================
  // CERRAR MODAL
  // ==========================================
  cerrarModal(): void {
    this.cerrar.emit(false);
  }

  // ==========================================
  // OBTENER NOMBRE DEL USUARIO
  // ==========================================
  obtenerNombreUsuario(uid: string): string {
    const usuario = this.usuarios.find(u => u.uid === uid);
    return usuario ? usuario.nombreCompleto : 'Usuario desconocido';
  }
}