import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Subscription } from 'rxjs';

// IMPORTANTE → Importar tu test service
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

  headerVisible = signal<boolean>(true);
  footerVisible = signal<boolean>(true);
  
  private routerSubscription: Subscription | undefined; 

  // Inyectamos aquí tu TestService sin tocar la lógica existente
  private testService = inject(TestService);

  constructor(private router: Router) {}

  // Función auxiliar para verificar si la ruta actual debe estar oculta
  private checkVisibility(url: string): boolean {
    const rutasOcultas = ['/', '/login', '/register', '/forgot-password'];
    const urlCheck = url.split('?')[0].split('#')[0];
    return !rutasOcultas.some(path => urlCheck === path);
  }

  async ngOnInit(): Promise<void> {

    // 👉 Probar Firebase APENAS INICIA LA APP
    try {
      const ok = await this.testService.testConnection();
      console.log("Resultado de conexión Firebase →", ok);
    } catch (e) {
      console.error("Error probando Firebase:", e);
    }

    // Mantengo todo lo tuyo igual
    const initialUrl = this.router.url;
    const isVisible = this.checkVisibility(initialUrl);
    this.headerVisible.set(isVisible);
    this.footerVisible.set(isVisible);

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
