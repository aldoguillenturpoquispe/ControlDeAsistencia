import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from '@angular/fire/firestore';
import { Asistencia } from '../models/asistencia.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private asistenciasCollection = collection(this.firestore, 'asistencias');

  // ==========================================
  // CREAR ASISTENCIA
  // ==========================================
  async crearAsistencia(asistencia: Asistencia): Promise<string> {
    try {
      const docRef = await addDoc(this.asistenciasCollection, {
        ...asistencia,
        fecha: Timestamp.fromDate(asistencia.fecha),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Asistencia creada con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error al crear asistencia:', error);
      throw error;
    }
  }

  // ==========================================
  // 🔥 NUEVO: EDITAR ASISTENCIA (SOLO ADMIN)
  // ==========================================
  async editarAsistencia(id: string, asistenciaActualizada: Partial<Asistencia>): Promise<void> {
    try {
      // Verificar si es admin
      if (!this.authService.esAdmin()) {
        throw new Error('❌ No tienes permisos para editar asistencias');
      }

      const asistenciaRef = doc(this.firestore, 'asistencias', id);
      
      // Preparar datos para actualizar
      const dataToUpdate: any = { ...asistenciaActualizada };
      
      // Convertir fecha a Timestamp si existe
      if (dataToUpdate.fecha) {
        dataToUpdate.fecha = Timestamp.fromDate(
          dataToUpdate.fecha instanceof Date 
            ? dataToUpdate.fecha 
            : new Date(dataToUpdate.fecha)
        );
      }

      // Agregar fecha de actualización
      dataToUpdate.updatedAt = Timestamp.now();

      await updateDoc(asistenciaRef, dataToUpdate);
      console.log('✅ Asistencia editada correctamente:', id);
    } catch (error) {
      console.error('❌ Error al editar asistencia:', error);
      throw error;
    }
  }

  // ==========================================
  // 🔥 NUEVO: ELIMINAR ASISTENCIA (SOLO ADMIN)
  // ==========================================
  async eliminarAsistencia(id: string): Promise<void> {
    try {
      // Verificar si es admin
      if (!this.authService.esAdmin()) {
        throw new Error('❌ No tienes permisos para eliminar asistencias');
      }

      const asistenciaRef = doc(this.firestore, 'asistencias', id);
      await deleteDoc(asistenciaRef);
      console.log('✅ Asistencia eliminada correctamente:', id);
    } catch (error) {
      console.error('❌ Error al eliminar asistencia:', error);
      throw error;
    }
  }

  // ==========================================
  // OBTENER TODAS LAS ASISTENCIAS
  // ==========================================
  async obtenerAsistencias(): Promise<Asistencia[]> {
    try {
      const q = query(this.asistenciasCollection, orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const asistencias: Asistencia[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        asistencias.push({
          id: doc.id,
          ...data,
          fecha: data['fecha'].toDate(),
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate()
        } as Asistencia);
      });
      
      return asistencias;
    } catch (error) {
      console.error('❌ Error al obtener asistencias:', error);
      throw error;
    }
  }

  // ==========================================
  // OBTENER ASISTENCIAS DE HOY
  // ==========================================
  async obtenerAsistenciasHoy(): Promise<Asistencia[]> {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      const q = query(
        this.asistenciasCollection,
        where('fecha', '>=', Timestamp.fromDate(hoy)),
        where('fecha', '<', Timestamp.fromDate(manana)),
        orderBy('fecha', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const asistencias: Asistencia[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        asistencias.push({
          id: doc.id,
          ...data,
          fecha: data['fecha'].toDate(),
        } as Asistencia);
      });

      return asistencias;
    } catch (error) {
      console.error('❌ Error al obtener asistencias de hoy:', error);
      throw error;
    }
  }

  // ==========================================
  // OBTENER ÚLTIMAS N ASISTENCIAS
  // ==========================================
  async obtenerUltimasAsistencias(limite: number = 5): Promise<Asistencia[]> {
    try {
      const q = query(
        this.asistenciasCollection,
        orderBy('createdAt', 'desc'),
        limit(limite)
      );

      const querySnapshot = await getDocs(q);
      const asistencias: Asistencia[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        asistencias.push({
          id: doc.id,
          ...data,
          fecha: data['fecha'].toDate(),
          createdAt: data['createdAt']?.toDate(),
        } as Asistencia);
      });

      return asistencias;
    } catch (error) {
      console.error('❌ Error al obtener últimas asistencias:', error);
      throw error;
    }
  }

  // ==========================================
  // CONTAR ASISTENCIAS POR ESTADO HOY
  // ==========================================
  async contarPorEstadoHoy(): Promise<{
    presentes: number;
    ausentes: number;
    tardanzas: number;
    total: number;
  }> {
    try {
      const asistenciasHoy = await this.obtenerAsistenciasHoy();
      
      const presentes = asistenciasHoy.filter(a => a.estado === 'presente').length;
      const ausentes = asistenciasHoy.filter(a => a.estado === 'ausente').length;
      const tardanzas = asistenciasHoy.filter(a => a.estado === 'tardanza').length;

      return {
        presentes,
        ausentes,
        tardanzas,
        total: asistenciasHoy.length
      };
    } catch (error) {
      console.error('❌ Error al contar asistencias:', error);
      throw error;
    }
  }
}