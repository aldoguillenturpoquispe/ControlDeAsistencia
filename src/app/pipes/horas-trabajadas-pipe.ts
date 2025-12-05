import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personalizado para calcular horas trabajadas entre entrada y salida
 * 
 * Uso:
 * {{ '08:00' | horasTrabajadas:'17:00' }}       // "9h 0m"
 * {{ '09:30' | horasTrabajadas:'18:45' }}       // "9h 15m"
 * {{ entrada | horasTrabajadas:salida }}        // dinámico
 */
@Pipe({
  name: 'horasTrabajadas',
  standalone: true
})
export class HorasTrabajadasPipe implements PipeTransform {

  transform(horaEntrada: string | undefined, horaSalida: string | undefined): string {
    // Validar que ambas horas existan
    if (!horaEntrada || !horaSalida) {
      return '--';
    }

    try {
      // Extraer horas y minutos
      const [horaE, minE] = horaEntrada.split(':').map(Number);
      const [horaS, minS] = horaSalida.split(':').map(Number);

      // Validar formato
      if (isNaN(horaE) || isNaN(minE) || isNaN(horaS) || isNaN(minS)) {
        return '--';
      }

      // Calcular diferencia en minutos
      let totalMinutos = (horaS * 60 + minS) - (horaE * 60 + minE);
      
      // Si es negativo, significa que cruzó medianoche
      if (totalMinutos < 0) {
        totalMinutos += 24 * 60;
      }

      // Convertir a horas y minutos
      const horas = Math.floor(totalMinutos / 60);
      const minutos = totalMinutos % 60;

      return `${horas}h ${minutos}m`;
    } catch (error) {
      console.error('Error al calcular horas trabajadas:', error);
      return '--';
    }
  }
}