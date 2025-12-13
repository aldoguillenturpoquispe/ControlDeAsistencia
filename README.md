# 📋 Sistema de Control de Asistencias

Sistema web desarrollado en Angular para la gestión y control de asistencias de empleados, con autenticación mediante Firebase y almacenamiento en tiempo real.

## 📖 Descripción del Proyecto

Aplicación CRUD completa que permite administrar el registro de asistencias de empleados, consultar estadísticas, generar reportes y gestionar usuarios. El sistema cuenta con roles diferenciados (administrador y usuario) y proporciona visualizaciones en tiempo real de los datos almacenados en Firebase Firestore.

## 🚀 Tecnologías y Herramientas Utilizadas

- **Framework:** Angular 18 (Standalone Components)
- **Lenguaje:** TypeScript 5.x
- **Autenticación:** Firebase Authentication
- **Base de Datos:** Firebase Firestore
- **Estilos:** CSS3 personalizado
- **Hosting:** Firebase Hosting
- **Control de versiones:** Git & GitHub


## 📋 Requisitos para Instalar y Ejecutar

### Prerequisitos

- Node.js v18 o superior
- npm v9 o superior
- Angular CLI v18 (`npm install -g @angular/cli`)
- Cuenta de Firebase

### Instalación

1. **Clonar el repositorio:**

  ```bash
  git clone https://github.com/tu-usuario/control-asistencias.git
  cd control-asistencias
  ```

1. **Instalar dependencias:**

  ```bash
  npm install
  ```

1. **Configurar Firebase:**

Crear archivo `src/environments/environment.ts`:

  ```typescript
  export const environment = {
    production: false,
    firebase: {
     apiKey: "TU_API_KEY",
     authDomain: "TU_AUTH_DOMAIN",
     projectId: "TU_PROJECT_ID",
     storageBucket: "TU_STORAGE_BUCKET",
     messagingSenderId: "TU_MESSAGING_SENDER_ID",
     appId: "TU_APP_ID"
    }
  };
  ```

1. **Ejecutar en modo desarrollo:**

  ```bash
  ng serve
  ```

Navegar a `http://localhost:4200/`

1. **Compilar para producción:**

  ```bash
  ng build --configuration production
  ```

## 🏗️ Arquitectura del Proyecto

### Estructura de Componentes Principales

```text
src/app/
├── components/
│   ├── auth/              # Autenticación (login, register, forgot-password)
│   ├── home/              # Dashboard principal
│   ├── asistencias/       # Gestión de asistencias (CRUD completo)
│   ├── estadisticas/      # Visualización de estadísticas
│   ├── reportes/          # Generación de reportes
│   ├── header/            # Barra de navegación
│   └── footer/            # Pie de página
├── services/
│   ├── auth.service.ts           # Manejo de autenticación
│   ├── asistencia.service.ts     # CRUD de asistencias
│   └── usuario.service.ts        # CRUD de usuarios
├── guards/
│   └── admin.guard.ts            # Protección de rutas administrativas
├── models/
│   ├── asistencia.model.ts       # Interfaz de Asistencia
│   └── usuario.model.ts          # Interfaz de Usuario
└── pipes/
    ├── fecha-formato.pipe.ts     # Formateo de fechas
    ├── horas-trabajadas.pipe.ts  # Cálculo de horas
    └── estado-texto.pipe.ts      # Formato de estados
```

### Servicios Principales

#### **AuthService**

- Gestiona autenticación con Firebase (Email/Password y Google)
- Manejo de sesiones y roles de usuario
- Métodos: `loginConEmail()`, `registrarConEmail()`, `loginWithGoogle()`, `logout()`

#### **AsistenciaService**

- CRUD completo de asistencias en Firestore
- Consultas filtradas y estadísticas
- Métodos: `crearAsistencia()`, `obtenerAsistencias()`, `editarAsistencia()`, `eliminarAsistencia()`

#### **UsuarioService**

- Gestión de usuarios en Firestore
- Consultas por rol y estado
- Métodos: `crearUsuario()`, `obtenerUsuarios()`, `actualizarUsuario()`, `eliminarUsuario()`

### Guards

#### **AdminGuard**

- Protege rutas que requieren rol de administrador
- Redirige a usuarios sin permisos
- Implementa `CanActivate`

## 🌐 Deploy

### URL de la Aplicación

**Firebase Hosting:** [https://control-de-asistencia-41bb2.web.app/](https://control-de-asistencia-41bb2.web.app/)

### Video de Demostración

- URL: [Ver video](https://youtu.be/h4BmAY2wxc8?si=jEVEeixPO3wED5Au)

### Comandos para Deploy

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login en Firebase
firebase login

# Inicializar proyecto
firebase init hosting

# Build y Deploy
ng build --configuration production
firebase deploy --only hosting
```

## 📱 Manual de Usuario

### 1. Registro e Inicio de Sesión

**Registro de nuevo usuario:**

1. Acceder a la aplicación
2. Hacer clic en "Registrarse"
3. Completar formulario con nombre completo, email y contraseña
4. Hacer clic en "Crear cuenta"
5. Automáticamente redirige al dashboard

**Inicio de sesión:**

- **Con email:** Ingresar credenciales y hacer clic en "Iniciar Sesión"
- **Con Google:** Hacer clic en "Continuar con Google" y seleccionar cuenta

### 2. Dashboard Principal

Al iniciar sesión, se muestra:

- **Tarjetas de resumen:** Total empleados, presentes hoy, ausentes hoy, % asistencia
- **Accesos rápidos:** Enlaces directos a secciones principales
- **Últimas asistencias:** Lista de los 5 registros más recientes

### 3. Gestión de Asistencias

**Registrar nueva asistencia (Admin):**

1. Ir a sección "Asistencias"
2. Clic en "➕ Nueva Asistencia"
3. Seleccionar usuario del dropdown
4. Ingresar fecha y hora de entrada
5. (Opcional) Ingresar hora de salida
6. Seleccionar estado: Presente, Ausente, Tardanza o Permiso
7. (Opcional) Agregar observaciones
8. Clic en "💾 Guardar"

**Filtrar asistencias:**

- **Por fecha:** Seleccionar fecha en el filtro
- **Por usuario:** Escribir nombre en el campo de búsqueda
- **Por estado:** Seleccionar estado del dropdown
- Clic en "🔍 Filtrar" o "🔄 Limpiar" para resetear

**Ver detalle de asistencia:**

1. Localizar registro en la tabla
2. Clic en botón "👁️ Ver Detalle"
3. Se muestra modal con información completa

**Editar asistencia (Solo Admin):**

1. Clic en botón "✏️" en la fila deseada
2. Modificar campos necesarios
3. Clic en "💾 Actualizar"

**Eliminar asistencia (Solo Admin):**

1. Clic en botón "🗑️" en la fila deseada
2. Confirmar eliminación en el modal
3. Clic en "🗑️ Eliminar"

**Navegación por páginas:**

- Usar botones "« Anterior" y "Siguiente »"
- Visualizar página actual de total de páginas

### 4. Estadísticas

**Ver estadísticas generales:**

1. Ir a sección "Estadísticas"
2. Se muestran automáticamente:
   - Total de usuarios y asistencias
   - Presentes, ausentes, tardanzas y permisos
   - Promedio de horas trabajadas
   - Porcentaje de asistencia

**Filtrar por período:**

- Seleccionar período: Hoy, Semana, Mes o Personalizado
- Para personalizado: ingresar fechas de inicio y fin
- Clic en "Aplicar Filtros"

**Exportar estadísticas:**

- Clic en "Descargar CSV" para exportar datos
- Clic en "Imprimir" para generar versión imprimible

### 5. Reportes

**Generar reporte:**

1. Ir a sección "Reportes"
2. Configurar filtros:
   - Rango de fechas (inicio - fin)
   - Usuario específico (opcional)
   - Estado (opcional)
3. Clic en "🔍 Filtrar"
4. Se muestra tabla con resultados y resumen estadístico

**Resumen del reporte incluye:**

- Total de registros
- Cantidad de presentes
- Cantidad de ausentes
- Cantidad de tardanzas
- Promedio de asistencia (%)

### 6. Perfil de Usuario

**Ver información del perfil:**

- Clic en avatar/iniciales en esquina superior derecha
- Se despliega menú con:
  - Nombre completo
  - Email
  - Opción de cerrar sesión

**Cerrar sesión:**

1. Clic en avatar
2. Clic en "Cerrar Sesión"
3. Redirige automáticamente al login

### 7. Roles y Permisos

**Usuario Normal:**

- ✅ Ver dashboard
- ✅ Ver listado de asistencias
- ✅ Ver detalle de asistencias
- ✅ Ver estadísticas
- ✅ Ver reportes
- ❌ Crear/editar/eliminar asistencias

**Administrador:**

- ✅ Todas las funciones de usuario normal
- ✅ Crear nuevas asistencias
- ✅ Editar asistencias existentes
- ✅ Eliminar asistencias
- ✅ Acceso completo al sistema

### 8. Características Adicionales

**Validaciones de formularios:**

- Todos los campos obligatorios están marcados con *
- Mensajes de error específicos para cada campo
- Validación en tiempo real al escribir

**Mensajes del sistema:**

- ✅ Confirmaciones de acciones exitosas
- ❌ Alertas de errores con descripción
- ⏳ Indicadores de carga durante procesos

**Diseño responsivo:**

- Compatible con dispositivos móviles
- Adaptación automática a diferentes tamaños de pantalla
