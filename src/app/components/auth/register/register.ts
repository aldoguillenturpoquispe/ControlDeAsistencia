import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    // Inicializar el formulario con validaciones
    this.registerForm = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      aceptarTerminos: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordsMatchValidator // Validador personalizado
    });
  }

  // ==========================================
  // VALIDADOR PERSONALIZADO: Contraseñas coinciden
  // ==========================================
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    // Limpiar el error si las contraseñas coinciden
    const confirmPasswordControl = control.get('confirmPassword');
    if (confirmPasswordControl?.hasError('passwordMismatch')) {
      confirmPasswordControl.setErrors(null);
    }
    
    return null;
  }

  // ==========================================
  // ALTERNAR VISIBILIDAD DE CONTRASEÑA
  // ==========================================
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ==========================================
  // REGISTRO CON EMAIL Y CONTRASEÑA
  // ==========================================
  async register(): Promise<void> {
    // Validar formulario
    if (this.registerForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { nombreCompleto, email, password } = this.registerForm.value;

    try {
      console.log('📝 Registrando usuario...');
      await this.authService.registrarConEmail(nombreCompleto, email, password);
      
      this.successMessage = '¡Cuenta creada exitosamente! Redirigiendo...';
      console.log('✅ Registro exitoso');
      
      // El servicio ya redirige a /inicio, pero por si acaso:
      setTimeout(() => {
        this.router.navigate(['/inicio']);
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Error en el registro:', error);
      
      // Mostrar mensaje de error al usuario
      if (error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Error al crear la cuenta. Por favor, intenta nuevamente.';
      }
      
      this.loading = false;
    }
  }

  // ==========================================
  // REGISTRO CON GOOGLE
  // ==========================================
  async registerWithGoogle(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      console.log('📝 Registrando con Google...');
      await this.authService.loginWithGoogle();
      
      this.successMessage = '¡Registro exitoso con Google!';
      console.log('✅ Registro con Google exitoso');
      
    } catch (error: any) {
      console.error('❌ Error en el registro con Google:', error);
      
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        this.errorMessage = 'Error al registrarse con Google. Por favor, intenta nuevamente.';
      }
      
      this.loading = false;
    }
  }

  // ==========================================
  // HELPERS PARA OBTENER ERRORES DE VALIDACIÓN
  // ==========================================
  get nombreCompletoInvalid(): boolean {
    const control = this.registerForm.get('nombreCompleto');
    return !!(control?.invalid && control?.touched);
  }

  get emailInvalid(): boolean {
    const control = this.registerForm.get('email');
    return !!(control?.invalid && control?.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.registerForm.get('password');
    return !!(control?.invalid && control?.touched);
  }

  get confirmPasswordInvalid(): boolean {
    const control = this.registerForm.get('confirmPassword');
    return !!(control?.invalid && control?.touched);
  }

  get passwordMismatch(): boolean {
    const control = this.registerForm.get('confirmPassword');
    return !!(control?.hasError('passwordMismatch') && control?.touched);
  }
}