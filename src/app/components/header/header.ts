import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  showUserMenu = false;
  usuario: Usuario | null = null;
  nombreUsuario: string = 'Usuario';
  emailUsuario: string = 'usuario@example.com';
  photoURL: string | null = null;

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

   // CARGAR DATOS DEL USUARIO AUTENTICADO
   async cargarDatosUsuario(): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      
      if (currentUser) {
        // Obtener datos del usuario desde Firestore
        this.usuario = await this.usuarioService.obtenerUsuario(currentUser.uid);
        
        if (this.usuario) {
          this.nombreUsuario = this.usuario.nombreCompleto;
          this.emailUsuario = this.usuario.email;
          this.photoURL = this.usuario.photoURL;
        } else {
          // Si no hay datos en Firestore, usar los de Firebase Auth
          this.nombreUsuario = currentUser.displayName || 'Usuario';
          this.emailUsuario = currentUser.email || 'usuario@example.com';
          this.photoURL = currentUser.photoURL;
        }
 }
    } catch (error) {
      console.error('❌ Error al cargar datos del usuario:', error);
    }
  }

   // TOGGLE DEL MENÚ DE USUARIO
   toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }
  
   // CERRAR SESIÓN
   async cerrarSesion(): Promise<void> {
    try {
 this.showUserMenu = false;
      await this.authService.logout();
 } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  }

   // OBTENER INICIALES DEL NOMBRE (para avatar)
   getIniciales(): string {
    if (!this.nombreUsuario) return 'U';
    
    const nombres = this.nombreUsuario.trim().split(' ');
    if (nombres.length >= 2) {
      return (nombres[0][0] + nombres[1][0]).toUpperCase();
    }
    return nombres[0][0].toUpperCase();
  }
}