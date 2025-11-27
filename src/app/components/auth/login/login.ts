import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  loginForm!: FormGroup;
  showPassword = false;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    // Inicializar el formulario con validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      recordarme: [false]
    });
  }

  // Alternar visibilidad de la contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Login con email y contraseña
  async login(): Promise<void> {
    if (this.loginForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    try {
      console.log('🔄 Iniciando sesión con email...');
      await this.authService.loginConEmail(email, password);
      console.log('✅ Login exitoso');
    } catch (error: any) {
      console.error('❌ Error en el login:', error);
      
      // Mostrar mensaje de error al usuario
      if (error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Error al iniciar sesión. Por favor, intenta nuevamente.';
      }
      
      this.loading = false;
    }
  }

  // Login con Google
  async loginWithGoogle(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      console.log('🔄 Iniciando sesión con Google...');
      await this.authService.loginWithGoogle();
      console.log('✅ Login exitoso con Google');
    } catch (error: any) {
      console.error('❌ Error en el login con Google:', error);
      
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        this.errorMessage = 'Error al iniciar sesión con Google. Por favor, intenta nuevamente.';
      }
      
      this.loading = false;
    }
  }
}