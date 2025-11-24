import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  constructor(private router: Router) {}

  register() {
    console.log('Registrando usuario...');
    // Simular registro exitoso
    alert('Cuenta creada exitosamente');
    this.router.navigate(['/login']);
  }

  registerWithGoogle() {
    console.log('Registrando con Google...');
    // Simular registro con Google
    alert('Registro con Google exitoso');
    this.router.navigate(['/inicio']);
  }

  ngAfterViewInit() {
    // Toggle para mostrar/ocultar contraseñas
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach((toggleBtn) => {
      toggleBtn.addEventListener('click', () => {
        const passwordInput = toggleBtn.parentElement?.querySelector('input') as HTMLInputElement;
        
        if (passwordInput) {
          const type = passwordInput.type === 'password' ? 'text' : 'password';
          passwordInput.type = type;
          
          const icon = toggleBtn.querySelector('i');
          icon?.classList.toggle('fa-eye');
          icon?.classList.toggle('fa-eye-slash');
        }
      });
    });
  }
}