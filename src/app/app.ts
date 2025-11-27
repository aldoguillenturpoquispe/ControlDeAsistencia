import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Subscription } from 'rxjs';
import { TestService } from './services/test';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('ControlDeAsistencia');

  headerVisible = signal<boolean>(false); // ← Cambiar a false por defecto
  footerVisible = signal<boolean>(false); // ← Cambiar a false por defecto
  
  private routerSubscription: Subscription | undefined; 
  private testService = inject(TestService);

  constructor(private router: Router) {}

  // Función auxiliar mejorada
  private checkVisibility(url: string): boolean {
    // Limpiar la URL de parámetros y fragmentos
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // Rutas donde NO se debe mostrar header/footer
    const rutasOcultas = ['', '/', '/login', '/register', '/forgot-password'];
    
    // Si la URL está en las rutas ocultas, retornar false (no visible)
    return !rutasOcultas.includes(cleanUrl);
  }

  async ngOnInit(): Promise<void> {
    // Probar conexión a Firebase
    try {
      const ok = await this.testService.testConnection();
      if (ok) {
        console.log("✅ Firebase conectado correctamente");
      }
    } catch (e) {
      console.error("❌ Error al conectar con Firebase:", e);
    }

    // Verificar visibilidad en la ruta inicial
    const initialUrl = this.router.url;
    const isVisible = this.checkVisibility(initialUrl);
    this.headerVisible.set(isVisible);
    this.footerVisible.set(isVisible);

    // Suscribirse a cambios de ruta
    this.routerSubscription = this.router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          const isVisible = this.checkVisibility(event.urlAfterRedirects);
          this.headerVisible.set(isVisible);
          this.footerVisible.set(isVisible);
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}