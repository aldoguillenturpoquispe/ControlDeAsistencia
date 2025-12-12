import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  user,
  User,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);

  // Observable del usuario actual
  user$: Observable<User | null> = user(this.auth);

  constructor() {
    // Inicializar listener de sesión persistente
    this.inicializarSesionPersistente();
  }

  // VERIFICAR Y RESTAURAR SESIÓN AL INICIAR
  private inicializarSesionPersistente(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        // Usuario autenticado, cargar su rol
        await this.cargarRolUsuario(user.uid);

        // Si está en login/register, redirigir a inicio
        const currentUrl = this.router.url;
        if (currentUrl === '/login' || currentUrl === '/register' || currentUrl === '/' || currentUrl === '') {
          this.router.navigate(['/inicio']);
        }
      } else {
        // No hay usuario, limpiar localStorage
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
      }
    });
  }

  // REGISTRO CON EMAIL Y CONTRASEÑA
  async registrarConEmail(nombreCompleto: string, email: string, password: string) {
    try {
      // 1. Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // 2. Crear documento en Firestore
      const nuevoUsuario: Usuario = {
        uid: user.uid,
        nombreCompleto: nombreCompleto,
        email: user.email || email,
        photoURL: null,
        rol: 'usuario',
        activo: true,
        fechaRegistro: new Date(),
        fechaUltimaActualizacion: new Date(),
        proveedorAuth: 'email'
      };

      await this.usuarioService.crearUsuario(nuevoUsuario);

      // 3. Cargar rol y navegar
      await this.cargarRolUsuario(user.uid);
      this.router.navigate(['/inicio']);

      return userCredential;
    } catch (error: any) {
      console.error('❌ Error en el registro:', error);

      // Manejo de errores específicos
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este correo ya está registrado');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('El correo electrónico no es válido');
      }

      throw error;
    }
  }

  // LOGIN CON EMAIL Y CONTRASEÑA
  async loginConEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);

      // Obtener y guardar el rol del usuario
      await this.cargarRolUsuario(userCredential.user.uid);

      this.router.navigate(['/inicio']);
      return userCredential;
    } catch (error: any) {
      console.error('❌ Error al iniciar sesión:', error);

      if (error.code === 'auth/user-not-found') {
        throw new Error('Usuario no encontrado');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Contraseña incorrecta');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Correo electrónico inválido');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Credenciales inválidas');
      }

      throw error;
    }
  }

  // LOGIN CON GOOGLE
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      // Verificar si el usuario ya existe en Firestore
      const usuarioExistente = await this.usuarioService.obtenerUsuario(user.uid);

      if (!usuarioExistente) {
        // Si es la primera vez, crear el documento en Firestore
        const nuevoUsuario: Usuario = {
          uid: user.uid,
          nombreCompleto: user.displayName || 'Usuario de Google',
          email: user.email || '',
          photoURL: user.photoURL,
          rol: 'usuario',
          activo: true,
          fechaRegistro: new Date(),
          fechaUltimaActualizacion: new Date(),
          proveedorAuth: 'google'
        };

        await this.usuarioService.crearUsuario(nuevoUsuario);
      }

      // Cargar rol del usuario
      await this.cargarRolUsuario(user.uid);

      this.router.navigate(['/inicio']);
      return result;
    } catch (error: any) {
      console.error('❌ Error al iniciar sesión con Google:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        // Usuario cerró el popup
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Popup cancelado
      }

      throw error;
    }
  }

  // CARGAR ROL DEL USUARIO DESDE FIRESTORE
  async cargarRolUsuario(uid: string): Promise<void> {
    try {
      const usuario = await this.usuarioService.obtenerUsuario(uid);

      if (usuario) {
        // Guardar rol en localStorage
        localStorage.setItem('userRole', usuario.rol);
        localStorage.setItem('userName', usuario.nombreCompleto);
      } else {
        console.warn('⚠️ Usuario no encontrado en Firestore');
        localStorage.setItem('userRole', 'usuario'); // Por defecto
      }
    } catch (error) {
      console.error('❌ Error al cargar rol:', error);
      localStorage.setItem('userRole', 'usuario'); // Por defecto en caso de error
    }
  }

  // VERIFICAR SI EL USUARIO ES ADMIN
  esAdmin(): boolean {
    return localStorage.getItem('userRole') === 'admin';
  }

  // OBTENER ROL ACTUAL
  getRolActual(): 'admin' | 'usuario' {
    const rol = localStorage.getItem('userRole');
    return rol === 'admin' ? 'admin' : 'usuario';
  }

  // CERRAR SESIÓN
  async logout() {
    try {
      await signOut(this.auth);

      // Limpiar localStorage
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');

      this.router.navigate(['/login']);
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  }

  // OBTENER USUARIO ACTUAL
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // VERIFICAR SI HAY USUARIO AUTENTICADO
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  // ENVIAR RECUPERACIÓN DE PASSWORD
  async enviarRecuperacionPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      console.error('❌ Error al enviar email de recuperación:', error);

      // Manejo de errores específicos
      if (error.code === 'auth/user-not-found') {
        throw new Error('No existe una cuenta con este correo electrónico');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('El correo electrónico no es válido');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos. Por favor, intenta más tarde');
      }

      throw error;
    }
  }
}
