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
  User
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

  constructor() {}

  // ==========================================
  // REGISTRO CON EMAIL Y CONTRASEÑA
  // ==========================================
  async registrarConEmail(nombreCompleto: string, email: string, password: string) {
    try {
      // 1. Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Usuario creado en Authentication:', user.uid);
      
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
      
      console.log('✅ Registro completo exitoso');
      
      // 3. Navegar a inicio
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

  // ==========================================
  // LOGIN CON EMAIL Y CONTRASEÑA
  // ==========================================
  async loginConEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Login exitoso:', userCredential.user.uid);
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

  // ==========================================
  // LOGIN CON GOOGLE
  // ==========================================
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      
      console.log('✅ Usuario autenticado con Google:', user.uid);
      
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
      
      this.router.navigate(['/inicio']);
      return result;
    } catch (error: any) {
      console.error('❌ Error al iniciar sesión con Google:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('El usuario cerró la ventana de inicio de sesión');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Se canceló la solicitud de popup');
      }
      
      throw error;
    }
  }

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================
  async logout() {
    try {
      await signOut(this.auth);
      console.log('✅ Sesión cerrada correctamente');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  }

  // ==========================================
  // OBTENER USUARIO ACTUAL
  // ==========================================
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // ==========================================
  // VERIFICAR SI HAY USUARIO AUTENTICADO
  // ==========================================
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  // ==========================================
  // AGREGAR ESTE MÉTODO EN AuthService
  // ==========================================
  async enviarRecuperacionPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('✅ Email de recuperación enviado a:', email);
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