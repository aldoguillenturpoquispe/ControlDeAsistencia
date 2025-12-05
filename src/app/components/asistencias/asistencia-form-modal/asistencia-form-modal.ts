import { Component, EventEmitter, Output, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AsistenciaService } from '../../../services/asistencia.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario.model';
import { Asistencia } from '../../../models/asistencia.model';

@Component({
  selector: 'app-asistencia-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // 🔥 Cambio: ReactiveFormsModule en lugar de FormsModule
  templateUrl: './asistencia-form-modal.html',
  styleUrl: './asistencia-form-modal.css',
})
export class AsistenciaFormModal implements OnInit {
  private asistenciaService = inject(AsistenciaService);
  private usuarioService = inject(UsuarioService);
  private fb = inject(FormBuilder); // 🔥 Inyectar FormBuilder

  @Input() asistenciaParaEditar: Asistencia | null = null;
  @Output() cerrar = new EventEmitter<boolean>();

  // 🔥 NUEVO: FormGroup Reactivo
  asistenciaForm!: FormGroup;

  // Lista de usuarios
  usuarios: Usuario[] = [];
  isLoading = false;
  isSaving = false;

  // 🔥 Modo edición
  get modoEdicion(): boolean {
    return this.asistenciaParaEditar !== null;
  }

  ngOnInit(): void {
    this.inicializarFormulario(); // 🔥 Inicializar formulario reactivo
    this.cargarUsuarios();
  }

   // 🔥 NUEVO: INICIALIZAR FORMULARIO REACTIVO
   inicializarFormulario(): void {
    this.asistenciaForm = this.fb.group({
      usuarioId: ['', [Validators.required]], // Campo 1: obligatorio
      fecha: ['', [Validators.required]], // Campo 2: obligatorio
      horaEntrada: ['', [
        Validators.required, // Campo 3: obligatorio
        Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) // Formato HH:mm
      ]],
      horaSalida: ['', [
        Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) // Campo 4: opcional pero con formato
      ]],
      estado: ['presente', [Validators.required]], // Campo 5: obligatorio con valor por defecto
      observaciones: ['', [Validators.maxLength(500)]] // Campo 6: opcional con max length
    }, {
      validators: this.validadorHoraSalida // 🔥 Validador personalizado a nivel de formulario
    });

    // Si hay asistencia para editar, cargar sus datos
    if (this.asistenciaParaEditar) {
      this.cargarDatosAsistencia();
    } else {
      this.establecerFechaActual();
    }
  }

   // 🔥 VALIDADOR PERSONALIZADO: Hora de salida > hora de entrada
   validadorHoraSalida(form: FormGroup): { [key: string]: boolean } | null {
    const horaEntrada = form.get('horaEntrada')?.value;
    const horaSalida = form.get('horaSalida')?.value;

    if (horaEntrada && horaSalida && horaSalida <= horaEntrada) {
      return { horaSalidaInvalida: true };
    }

    return null;
  }

   // CARGAR DATOS DE ASISTENCIA PARA EDITAR
   cargarDatosAsistencia(): void {
    if (!this.asistenciaParaEditar) return;

    console.log('📝 Cargando datos para editar:', this.asistenciaParaEditar);

    // Formatear fecha
    let fechaFormateada = '';
    if (this.asistenciaParaEditar.fecha) {
      const fecha = this.asistenciaParaEditar.fecha instanceof Date 
        ? this.asistenciaParaEditar.fecha 
        : new Date(this.asistenciaParaEditar.fecha);
      
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      fechaFormateada = `${year}-${month}-${day}`;
    }

    // 🔥 Usar patchValue para cargar datos en el FormGroup
    this.asistenciaForm.patchValue({
      usuarioId: this.asistenciaParaEditar.usuarioId || '',
      fecha: fechaFormateada,
      horaEntrada: this.asistenciaParaEditar.horaEntrada || '',
      horaSalida: this.asistenciaParaEditar.horaSalida || '',
      estado: this.asistenciaParaEditar.estado || 'presente',
      observaciones: this.asistenciaParaEditar.observaciones || ''
    });

    console.log('✅ Datos cargados en formulario reactivo');
  }

   // CARGAR LISTA DE USUARIOS
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

   // ESTABLECER FECHA ACTUAL
   establecerFechaActual(): void {
    const hoy = new Date();
    const fechaStr = hoy.toISOString().split('T')[0];
    this.asistenciaForm.patchValue({ fecha: fechaStr });
  }

   // 🔥 GETTERS PARA ACCEDER A LOS CONTROLES
   get usuarioIdControl() {
    return this.asistenciaForm.get('usuarioId');
  }

  get fechaControl() {
    return this.asistenciaForm.get('fecha');
  }

  get horaEntradaControl() {
    return this.asistenciaForm.get('horaEntrada');
  }

  get horaSalidaControl() {
    return this.asistenciaForm.get('horaSalida');
  }

  get estadoControl() {
    return this.asistenciaForm.get('estado');
  }

  get observacionesControl() {
    return this.asistenciaForm.get('observaciones');
  }

   // 🔥 MÉTODOS PARA VERIFICAR ERRORES
   mostrarErrorUsuario(): boolean {
    const control = this.usuarioIdControl;
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  mostrarErrorFecha(): boolean {
    const control = this.fechaControl;
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  mostrarErrorHoraEntrada(): boolean {
    const control = this.horaEntradaControl;
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  mostrarErrorHoraSalida(): boolean {
    const control = this.horaSalidaControl;
    return !!(control && control.invalid && (control.dirty || control.touched)) || 
           !!(this.asistenciaForm.errors?.['horaSalidaInvalida'] && control?.touched);
  }

  mostrarErrorObservaciones(): boolean {
    const control = this.observacionesControl;
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

   // 🔥 OBTENER MENSAJES DE ERROR PERSONALIZADOS
   obtenerErrorUsuario(): string {
    const control = this.usuarioIdControl;
    if (control?.hasError('required')) {
      return 'Debe seleccionar un usuario';
    }
    return '';
  }

  obtenerErrorFecha(): string {
    const control = this.fechaControl;
    if (control?.hasError('required')) {
      return 'La fecha es obligatoria';
    }
    return '';
  }

  obtenerErrorHoraEntrada(): string {
    const control = this.horaEntradaControl;
    if (control?.hasError('required')) {
      return 'La hora de entrada es obligatoria';
    }
    if (control?.hasError('pattern')) {
      return 'Formato de hora inválido (HH:mm)';
    }
    return '';
  }

  obtenerErrorHoraSalida(): string {
    const control = this.horaSalidaControl;
    if (control?.hasError('pattern')) {
      return 'Formato de hora inválido (HH:mm)';
    }
    if (this.asistenciaForm.errors?.['horaSalidaInvalida']) {
      return 'La hora de salida debe ser mayor que la de entrada';
    }
    return '';
  }

  obtenerErrorObservaciones(): string {
    const control = this.observacionesControl;
    if (control?.hasError('maxLength')) {
      return 'Máximo 500 caracteres';
    }
    return '';
  }

   // 🔥 GUARDAR O ACTUALIZAR ASISTENCIA
   async guardarAsistencia(): Promise<void> {
    // Marcar todos los campos como tocados para mostrar errores
    this.asistenciaForm.markAllAsTouched();

    // Validar formulario
    if (this.asistenciaForm.invalid) {
      console.log('⚠️ Formulario inválido');
      return;
    }

    try {
      this.isSaving = true;

      // Obtener valores del formulario
      const formValues = this.asistenciaForm.value;

      // Buscar el usuario seleccionado
      const usuario = this.usuarios.find(u => u.uid === formValues.usuarioId);
      if (!usuario) {
        alert('Usuario no encontrado');
        return;
      }

      // Crear fecha local sin problemas de zona horaria
      const [year, month, day] = formValues.fecha.split('-').map(Number);
      const fechaLocal = new Date(year, month - 1, day, 12, 0, 0);

      // Crear objeto de asistencia
      const datosAsistencia: Asistencia = {
        usuarioId: formValues.usuarioId,
        nombreCompleto: usuario.nombreCompleto,
        fecha: fechaLocal,
        horaEntrada: formValues.horaEntrada,
        horaSalida: formValues.horaSalida || undefined,
        estado: formValues.estado,
        observaciones: formValues.observaciones || undefined
      };

      // Modo edición o creación
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

   // CERRAR MODAL
   cerrarModal(): void {
    this.cerrar.emit(false);
  }
}