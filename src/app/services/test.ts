import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private firestore = inject(Firestore);

  async testConnection() {
    try {
      const testCollection = collection(this.firestore, 'test');
      await addDoc(testCollection, { mensaje: 'Conexión exitosa', fecha: new Date() });
      console.log('✅ Firebase conectado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al conectar con Firebase:', error);
      return false;
    }
  }
}