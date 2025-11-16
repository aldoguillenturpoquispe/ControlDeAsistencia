import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection(),
  ]

    // Inicializa Firebase con tu configuración
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyBIKPcp_KnlDW8HLH11QNTg7LqPphsQFzc",
      authDomain: "control-de-asistencia-7304f.firebaseapp.com",
      projectId: "control-de-asistencia-7304f",
      storageBucket: "control-de-asistencia-7304f.appspot.com",
      messagingSenderId: "400313593190",
      appId: "1:400313593190:web:91237f0f9215e14cbf2ca7"
    })),


    provideFirestore(() => getFirestore()),

};
