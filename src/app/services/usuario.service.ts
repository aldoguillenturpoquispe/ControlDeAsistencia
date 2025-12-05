import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp 
} from '@angular/fire/firestore';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private firestore = inject(Firestore);
  private usuariosCollection = collection(this.firestore, 'usuarios');

  constructor() {}

   // CREAR UN NUEVO USUARIO EN FIRESTORE
   async crearUsuario(usuario: Usuario): Promise<void> {
    try {
      const usuarioDoc = doc(this.usuariosCollection, usuario.uid);
      
      // Convertir las fechas a Timestamp de Firestore
      const usuarioData = {
        ...usuario,
        fechaRegistro: Timestamp.fromDate(usuario.fechaRegistro),
        fechaUltimaActualizacion: Timestamp.fromDate(usuario.fechaUltimaActualizacion)
      };
      
      await setDoc(usuarioDoc, usuarioData);
      console.log('✅ Usuario guardado en Firestore:', usuario.uid);
    } catch (error) {
      console.error('❌ Error al crear usuario en Firestore:', error);
      throw error;
    }
  }

   // OBTENER UN USUARIO POR SU UID
   async obtenerUsuario(uid: string): Promise<Usuario | null> {
    try {
      const usuarioDoc = doc(this.usuariosCollection, uid);
      const docSnap = await getDoc(usuarioDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          uid: data['uid'],
          nombreCompleto: data['nombreCompleto'],
          email: data['email'],
          photoURL: data['photoURL'],
          rol: data['rol'],
          activo: data['activo'],
          fechaRegistro: data['fechaRegistro'].toDate(),
          fechaUltimaActualizacion: data['fechaUltimaActualizacion'].toDate(),
          proveedorAuth: data['proveedorAuth']
        } as Usuario;
      }
      
      console.log('⚠️ Usuario no encontrado:', uid);
      return null;
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      throw error;
    }
  }

   // OBTENER TODOS LOS USUARIOS
   async obtenerTodosLosUsuarios(): Promise<Usuario[]> {
    try {
      const querySnapshot = await getDocs(this.usuariosCollection);
      const usuarios: Usuario[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usuarios.push({
          uid: data['uid'],
          nombreCompleto: data['nombreCompleto'],
          email: data['email'],
          photoURL: data['photoURL'],
          rol: data['rol'],
          activo: data['activo'],
          fechaRegistro: data['fechaRegistro'].toDate(),
          fechaUltimaActualizacion: data['fechaUltimaActualizacion'].toDate(),
          proveedorAuth: data['proveedorAuth']
        } as Usuario);
      });
      
      console.log('✅ Usuarios obtenidos:', usuarios.length);
      return usuarios;
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      throw error;
    }
  }

   // OBTENER USUARIOS POR ROL
   async obtenerUsuariosPorRol(rol: 'admin' | 'usuario'): Promise<Usuario[]> {
    try {
      const q = query(this.usuariosCollection, where('rol', '==', rol));
      const querySnapshot = await getDocs(q);
      const usuarios: Usuario[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usuarios.push({
          uid: data['uid'],
          nombreCompleto: data['nombreCompleto'],
          email: data['email'],
          photoURL: data['photoURL'],
          rol: data['rol'],
          activo: data['activo'],
          fechaRegistro: data['fechaRegistro'].toDate(),
          fechaUltimaActualizacion: data['fechaUltimaActualizacion'].toDate(),
          proveedorAuth: data['proveedorAuth']
        } as Usuario);
      });
      
      console.log(`✅ Usuarios con rol "${rol}":`, usuarios.length);
      return usuarios;
    } catch (error) {
      console.error('❌ Error al obtener usuarios por rol:', error);
      throw error;
    }
  }

   // ACTUALIZAR UN USUARIO
   async actualizarUsuario(uid: string, datos: Partial<Usuario>): Promise<void> {
    try {
      const usuarioDoc = doc(this.usuariosCollection, uid);
      
      // Crear objeto con los datos a actualizar
      const datosActualizados: any = {
        ...datos,
        fechaUltimaActualizacion: Timestamp.now()
      };
      
      // Si se están actualizando fechas, convertirlas a Timestamp
      if (datos.fechaRegistro) {
        datosActualizados.fechaRegistro = Timestamp.fromDate(datos.fechaRegistro);
      }
      
      await updateDoc(usuarioDoc, datosActualizados);
      console.log('✅ Usuario actualizado:', uid);
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      throw error;
    }
  }

   // ELIMINAR UN USUARIO
   async eliminarUsuario(uid: string): Promise<void> {
    try {
      const usuarioDoc = doc(this.usuariosCollection, uid);
      await deleteDoc(usuarioDoc);
      console.log('✅ Usuario eliminado:', uid);
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      throw error;
    }
  }

   // ACTIVAR/DESACTIVAR USUARIO
   async cambiarEstadoUsuario(uid: string, activo: boolean): Promise<void> {
    try {
      await this.actualizarUsuario(uid, { activo });
      console.log(`✅ Usuario ${activo ? 'activado' : 'desactivado'}:`, uid);
    } catch (error) {
      console.error('❌ Error al cambiar estado del usuario:', error);
      throw error;
    }
  }

   // CAMBIAR ROL DE USUARIO
   async cambiarRolUsuario(uid: string, nuevoRol: 'admin' | 'usuario'): Promise<void> {
    try {
      await this.actualizarUsuario(uid, { rol: nuevoRol });
      console.log(`✅ Rol del usuario actualizado a "${nuevoRol}":`, uid);
    } catch (error) {
      console.error('❌ Error al cambiar rol del usuario:', error);
      throw error;
    }
  }
 // ALIAS PARA OBTENER TODOS LOS USUARIOS
// ==========================================
async obtenerUsuarios(): Promise<Usuario[]> {
  return this.obtenerTodosLosUsuarios();
}
}