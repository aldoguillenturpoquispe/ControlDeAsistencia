import { Component } from '@angular/core';
import { AsistenciaFormModal } from './asistencia-form-modal/asistencia-form-modal';
import { AsistenciaTabla } from './asistencia-tabla/asistencia-tabla';

@Component({
  selector: 'app-asistencias',
  imports: [AsistenciaFormModal, AsistenciaTabla],
  templateUrl: './asistencias.html',
  styleUrl: './asistencias.css',
})
export class Asistencias {

}
