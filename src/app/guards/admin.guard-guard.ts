import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar si el usuario es admin (para rutas que lo requieran)
  // Si necesitas proteger rutas solo para admin, descomenta esto:
  /*
  if (route.data['requireAdmin'] && !authService.esAdmin()) {
    router.navigate(['/inicio']);
    return false;
  }
  */

  return true;
};