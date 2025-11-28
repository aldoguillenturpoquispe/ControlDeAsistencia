export interface Asistencia {
  id?: string;
  usuarioId: string;
  nombreCompleto: string;
  fecha: Date;
  horaEntrada: string;
  horaSalida?: string;
  estado: 'presente' | 'ausente' | 'tardanza' | 'permiso';
  observaciones?: string;
  createdAt?: Date;
  updatedAt?: Date;
}