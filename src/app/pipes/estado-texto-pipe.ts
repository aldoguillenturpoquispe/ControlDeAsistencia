import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personalizado para convertir códigos de estado a texto legible
 * 
 * Uso:
 * {{ 'presente' | estadoTexto }}      // "Presente"
 * {{ 'ausente' | estadoTexto }}       // "Ausente"
 * {{ asistencia.estado | estadoTexto }}
 */
@Pipe({
  name: 'estadoTexto',
  standalone: true
})
export class EstadoTextoPipe implements PipeTransform {

  private readonly estados: { [key: string]: string } = {
    'presente': 'Presente',
    'ausente': 'Ausente',
    'tardanza': 'Tardanza',
    'permiso': 'Permiso'
  };

  transform(value: string | undefined): string {
    if (!value) {
      return 'Desconocido';
    }

    return this.estados[value.toLowerCase()] || value;
  }
}