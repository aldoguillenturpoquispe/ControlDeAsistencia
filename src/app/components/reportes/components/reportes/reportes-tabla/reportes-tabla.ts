import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportes-tabla',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-tabla.html',
  styleUrl: './reportes-tabla.css',
})
export class ReportesTabla {
  reportes = [
    {
      id: '#001',
      usuario: 'Ana Pérez',
      fecha: '18/11/2025',
      entrada: '08:05',
      salida: '17:00',
      horasTrabajadas: '8h 55m',
      estado: 'presente'
    },
    {
      id: '#002',
      usuario: 'Carlos Gómez',
      fecha: '18/11/2025',
      entrada: '--',
      salida: '--',
      horasTrabajadas: '0h',
      estado: 'ausente'
    },
    {
      id: '#003',
      usuario: 'María López',
      fecha: '18/11/2025',
      entrada: '08:35',
      salida: '17:10',
      horasTrabajadas: '8h 35m',
      estado: 'tardanza'
    },
    {
      id: '#004',
      usuario: 'Juan Martínez',
      fecha: '17/11/2025',
      entrada: '07:58',
      salida: '17:05',
      horasTrabajadas: '9h 7m',
      estado: 'presente'
    },
    {
      id: '#005',
      usuario: 'Laura Sánchez',
      fecha: '17/11/2025',
      entrada: '08:00',
      salida: '17:00',
      horasTrabajadas: '9h',
      estado: 'presente'
    }
  ];
}