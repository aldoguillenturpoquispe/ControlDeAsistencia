import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  // **NOTA:** Aquí no incluimos CommonModule porque usamos el @if nativo.
  imports: [RouterOutlet, Header, Footer], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('ControlDeAsistencia');

  headerVisible = signal<boolean>(true);
  footerVisible = signal<boolean>(true);
  
  private routerSubscription: Subscription | undefined; 

  constructor(private router: Router) {}

  // Función auxiliar para verificar si la ruta actual debe estar oculta
  private checkVisibility(url: string): boolean {
    // CORRECCIÓN: La ruta raíz ('/') DEBE estar incluida explícitamente.
    const rutasOcultas = ['/', '/login', '/register', '/forgot-password']; 
    
    // Obtenemos solo la ruta base, sin query params ni fragmentos.
    const urlCheck = url.split('?')[0].split('#')[0];
    
    // Retorna FALSE si la URL actual coincide con una ruta a ocultar (Login, Register, Raíz).
    return !rutasOcultas.some(path => urlCheck === path);
  }

  ngOnInit(): void {
    // 1. Inicializar el estado al cargar (esto oculta Header/Footer inmediatamente si la URL es '/')
    const initialUrl = this.router.url;
    const isVisible = this.checkVisibility(initialUrl);
    this.headerVisible.set(isVisible);
    this.footerVisible.set(isVisible);

    // 2. Suscribirse a los eventos del router para cambiar la visibilidad al navegar.
    this.routerSubscription = this.router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          // Usamos 'urlAfterRedirects' para la ruta final (e.g., de '' a /inicio)
          const isVisible = this.checkVisibility(event.urlAfterRedirects);
          this.headerVisible.set(isVisible);
          this.footerVisible.set(isVisible);
        }
      });
  }

  ngOnDestroy(): void {
    // Evitar fugas de memoria al destruir el componente
    this.routerSubscription?.unsubscribe();
  }
}