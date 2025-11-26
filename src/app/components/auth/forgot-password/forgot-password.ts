import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  
  enviarRecuperacion() {
    console.log('Enviando email de recuperación...');
    alert('Se ha enviado un correo con las instrucciones para recuperar tu contraseña');
  }
}