export interface Usuario {
  uid: string;
  nombreCompleto: string;
  email: string;
  photoURL: string | null;
  rol: 'admin' | 'usuario';
  activo: boolean;
  fechaRegistro: Date;
  fechaUltimaActualizacion: Date;
  proveedorAuth: 'google' | 'email';
}