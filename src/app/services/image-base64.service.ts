import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageBase64Service {

  constructor() { }

  /**
   * Convierte un archivo de imagen a base64
   * @param file - Archivo de imagen
   * @returns Promise con la cadena base64
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        reject(new Error('El archivo debe ser una imagen'));
        return;
      }

      // Validar tamaño (máximo 5 MB)
      const maxSizeMB = 5;
      if (file.size > maxSizeMB * 1024 * 1024) {
        reject(new Error(`La imagen supera ${maxSizeMB} MB`));
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };

      reader.onerror = (error) => {
        reject(new Error('Error al leer el archivo: ' + error));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Redimensiona una imagen base64 a un tamaño máximo
   * @param base64String - String en formato base64 con data URI
   * @param maxWidth - Ancho máximo en píxeles
   * @param maxHeight - Alto máximo en píxeles
   * @returns Promise con la imagen redimensionada en base64
   */
  resizeImage(base64String: string, maxWidth: number = 500, maxHeight: number = 500): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(resizedBase64);
        } else {
          reject(new Error('No se pudo obtener el contexto del canvas'));
        }
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = base64String;
    });
  }

  /**
   * Obtiene solo la parte base64 sin el prefijo data:image
   * @param base64String - String en formato base64 con data URI
   * @returns Solo la parte base64
   */
  getBase64WithoutPrefix(base64String: string): string {
    const parts = base64String.split(',');
    return parts.length > 1 ? parts[1] : base64String;
  }

  /**
   * Obtiene el MIME type de una cadena base64 con data URI
   * @param base64String - String en formato base64 con data URI
   * @returns MIME type (ej: image/jpeg)
   */
  getMimeType(base64String: string): string {
    const match = base64String.match(/data:([^;]+)/);
    return match ? match[1] : 'image/jpeg';
  }
}
