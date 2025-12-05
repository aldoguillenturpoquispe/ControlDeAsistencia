import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personalizado para formatear fechas en español
 * 
 * Uso:
 * {{ fecha | fechaFormato }}                    // 05/12/2025
 * {{ fecha | fechaFormato:'corto' }}            // 05/12/25
 * {{ fecha | fechaFormato:'largo' }}            // viernes, 5 de diciembre de 2025
 * {{ fecha | fechaFormato:'mediano' }}          // 5 de dic. de 2025
 */
@Pipe({
  name: 'fechaFormato',
  standalone: true
})
export class FechaFormatoPipe implements PipeTransform {

  transform(value: Date | string | undefined, formato: 'corto' | 'mediano' | 'largo' = 'corto'): string {
    // Validar si el valor existe
    if (!value) {
      return '--';
    }

    // Convertir a Date si es string
    const fecha = typeof value === 'string' ? new Date(value) : value;

    // Validar que sea una fecha válida
    if (isNaN(fecha.getTime())) {
      return '--';
    }

    // Formatear según el tipo solicitado
    switch (formato) {
      case 'corto':
        // Formato: 05/12/2025
        return fecha.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

      case 'mediano':
        // Formato: 5 de dic. de 2025
        return fecha.toLocaleDateString('es-PE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

      case 'largo':
        // Formato: viernes, 5 de diciembre de 2025
        return fecha.toLocaleDateString('es-PE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

      default:
        return fecha.toLocaleDateString('es-PE');
    }
  }
}