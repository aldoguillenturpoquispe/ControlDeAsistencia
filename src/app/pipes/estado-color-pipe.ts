import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoColor'
})
export class EstadoColorPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
