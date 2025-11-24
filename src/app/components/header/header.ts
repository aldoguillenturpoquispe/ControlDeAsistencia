import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  showUserMenu = false;

  constructor(private router: Router) {}

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  configuracion() {
    console.log('Ir a configuración');
    this.showUserMenu = false;
    // this.router.navigate(['/configuracion']);
  }

  cerrarSesion() {
    console.log('Cerrando sesión...');
    this.showUserMenu = false;
    alert('Sesión cerrada');
    this.router.navigate(['/login']);
  }
}