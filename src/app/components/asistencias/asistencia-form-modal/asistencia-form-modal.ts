import { Component, EventEmitter, Output, Input, OnInit, inject } from '@angular/core';
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

  // 🔥 NUEVO: Recibir asistencia para editar
  @Input() asistenciaParaEditar: Asistencia | null = null;
  
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

  // 🔥 NUEVO: Modo edición
  get modoEdicion(): boolean {
    return this.asistenciaParaEditar !== null;
  }

  async ngOnInit(): Promise<void> {
    await this.cargarUsuarios();
    
    // 🔥 Si hay asistencia para editar, cargar sus datos
    if (this.asistenciaParaEditar) {
      this.cargarDatosAsistencia();
    } else {
      this.establecerFechaActual();
    }
  }

  // ==========================================
  // 🔥 NUEVO: CARGAR DATOS DE ASISTENCIA PARA EDITAR
  // ==========================================
  cargarDatosAsistencia(): void {
    if (!this.asistenciaParaEditar) return;

    console.log('📝 Cargando datos para editar:', this.asistenciaParaEditar);

    // Cargar usuario
    this.usuarioId = this.asistenciaParaEditar.usuarioId || '';

    // Cargar fecha
    if (this.asistenciaParaEditar.fecha) {
      const fecha = this.asistenciaParaEditar.fecha instanceof Date 
        ? this.asistenciaParaEditar.fecha 
        : new Date(this.asistenciaParaEditar.fecha);
      
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      this.fecha = `${year}-${month}-${day}`;
    }

    // Cargar horas
    this.horaEntrada = this.asistenciaParaEditar.horaEntrada || '';
    this.horaSalida = this.asistenciaParaEditar.horaSalida || '';

    // Cargar estado
    this.estado = this.asistenciaParaEditar.estado || 'presente';

    // Cargar observaciones
    this.observaciones = this.asistenciaParaEditar.observaciones || '';

    console.log('✅ Datos cargados:', {
      usuarioId: this.usuarioId,
      fecha: this.fecha,
      horaEntrada: this.horaEntrada,
      estado: this.estado
    });
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
  // 🔥 MODIFICADO: GUARDAR O ACTUALIZAR ASISTENCIA
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
      const fechaLocal = new Date(year, month - 1, day, 12, 0, 0);

      // Crear objeto de asistencia
      const datosAsistencia: Asistencia = {
        usuarioId: this.usuarioId,
        nombreCompleto: usuario.nombreCompleto,
        fecha: fechaLocal,
        horaEntrada: this.horaEntrada,
        horaSalida: this.horaSalida || undefined,
        estado: this.estado,
        observaciones: this.observaciones || undefined
      };

      // 🔥 Modo edición o creación
      if (this.modoEdicion && this.asistenciaParaEditar?.id) {
        // ACTUALIZAR asistencia existente
        datosAsistencia.id = this.asistenciaParaEditar.id;
        await this.asistenciaService.editarAsistencia(
          this.asistenciaParaEditar.id, 
          datosAsistencia
        );
        console.log('✅ Asistencia actualizada');
        alert('✅ Asistencia actualizada correctamente');
      } else {
        // CREAR nueva asistencia
        const id = await this.asistenciaService.crearAsistencia(datosAsistencia);
        console.log('✅ Asistencia creada con ID:', id);
        alert('✅ Asistencia registrada correctamente');
      }
      
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