import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  forgotForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  emailEnviado = false;

  ngOnInit(): void {
    // Inicializar el formulario con validaciones
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

   // ENVIAR EMAIL DE RECUPERACIÓN
   async enviarRecuperacion(): Promise<void> {
    // Validar formulario
    if (this.forgotForm.invalid) {
      this.forgotForm.get('email')?.markAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email } = this.forgotForm.value;

    try {
      console.log('📧 Enviando email de recuperación a:', email);
      await this.authService.enviarRecuperacionPassword(email);
      
      this.successMessage = '¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.';
      this.emailEnviado = true;
      console.log('✅ Email de recuperación enviado exitosamente');
      
      // Opcional: Limpiar el formulario
      this.forgotForm.reset();
      
    } catch (error: any) {
      console.error('❌ Error al enviar email de recuperación:', error);
      
      // Mostrar mensaje de error al usuario
      if (error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Error al enviar el correo. Por favor, intenta nuevamente.';
      }
      
      this.loading = false;
    } finally {
      this.loading = false;
    }
  }

   // VOLVER AL LOGIN
   volverAlLogin(): void {
    this.router.navigate(['/login']);
  }

   // HELPER PARA VALIDACIÓN DE EMAIL
   get emailInvalid(): boolean {
    const control = this.forgotForm.get('email');
    return !!(control?.invalid && control?.touched);
  }
}