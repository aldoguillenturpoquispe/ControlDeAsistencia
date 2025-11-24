import { Component, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  // Inyectar el servicio Router en el constructor
  constructor(private router: Router) {} 

  // Función de login simple: navega a /inicio inmediatamente (Home en tu caso)
  login() {
    // Aquí NO hay validación. Solo navega.
    console.log('Inicio de sesión simulado. Navegando a /inicio...');
    this.router.navigate(['/inicio']);
  }

  ngAfterViewInit() {
    // Lógica para alternar la visibilidad de la contraseña
    const toggleBtn = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('#password') as HTMLInputElement;
    
    // Usamos el operador de encadenamiento opcional (?) para evitar errores
    toggleBtn?.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      
      const icon = toggleBtn.querySelector('i');
      icon?.classList.toggle('fa-eye');
      icon?.classList.toggle('fa-eye-slash');
    });
  }

  loginWithGoogle() {
    
  }
}