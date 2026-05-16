# Documentación Técnica de BarFlow

Esta documentación ofrece un análisis profundo sobre la arquitectura del proyecto, la API del backend, las tecnologías utilizadas, y la justificación de las decisiones técnicas.

---

## 1. Tecnologías Utilizadas

### Backend
- **NestJS (Node.js)**: Framework progresivo para Node.js.
- **TypeScript**: Superset de JavaScript que añade tipado estático.
- **TypeORM**: ORM (Object-Relational Mapper) que soporta múltiples bases de datos.
- **PostgreSQL / MySQL**: Sistema de gestión de bases de datos relacional.
- **Passport.js y JWT**: Para la autenticación y autorización segura.
- **Swagger**: Para la documentación interactiva de la API.

### Frontend
- **Vue.js 3**: Framework progresivo para la construcción de interfaces de usuario, utilizando la Composition API.
- **Vite**: Herramienta de construcción y servidor de desarrollo ultrarrápido.
- **TailwindCSS**: Framework de utilidades CSS para un diseño ágil y responsive.
- **Pinia**: Gestor de estado oficial de Vue, intuitivo y con soporte TypeScript completo.
- **Axios**: Cliente HTTP basado en promesas.
- **Chart.js y Vue-Chartjs**: Para la visualización de datos y estadísticas.
- **jsPDF**: Generación de documentos PDF (facturas, tickets) directamente en el navegador.

---

## 2. ¿Por qué se han usado estas tecnologías? (Justificación)

- **NestJS + TypeScript**: Elegimos NestJS porque impone una arquitectura altamente modular (similar a Angular), lo cual es ideal para proyectos escalables. Facilita la inyección de dependencias y el uso de decoradores, lo que da como resultado un código mucho más limpio y testeable. TypeScript asegura la detección de errores en tiempo de desarrollo.
- **Vue 3 + Vite**: Vue 3 con la Composition API permite crear componentes altamente reutilizables y un código mucho más ordenado. Vite sustituye a Webpack reduciendo drásticamente los tiempos de compilación (HMR instantáneo), lo que mejora radicalmente la experiencia del desarrollador (DX).
- **TailwindCSS**: Permite desarrollar la interfaz de manera rápida sin salir del HTML/Vue, estandarizando el diseño y reduciendo el peso final del CSS mediante la purga de clases no utilizadas.
- **TypeORM**: Abstrae las consultas SQL, lo que permite interactuar con la base de datos usando objetos (POJOs) y realizar migraciones seguras. Además, facilita el cambio de motor de base de datos si fuera necesario en el futuro.
- **Pinia**: A diferencia de Vuex, Pinia es mucho más ligero, no requiere mutaciones y tiene un soporte nativo perfecto para TypeScript.

---

## 3. Explicación de Código y Estructura

### Estructura General
El proyecto sigue una arquitectura Cliente-Servidor (Frontend y Backend desacoplados).
- `/app/backend`: Contiene la lógica de negocio, reglas, seguridad y conexión a BD.
- `/app/frontend`: Contiene toda la lógica de presentación y experiencia de usuario.

### Estructura del Backend (Módulos)
Cada entidad del negocio está aislada en su propio **módulo** (Module, Controller, Service).
- **Controllers** (`*.controller.ts`): Reciben las peticiones HTTP (Routing), validan los datos de entrada a través de DTOs (Data Transfer Objects) y retornan las respuestas.
- **Services** (`*.service.ts`): Contienen la lógica de negocio real. Realizan operaciones en la base de datos a través de los repositorios de TypeORM y aplican las reglas del negocio.
- **Guards**: Interceptan las peticiones para verificar si el usuario está autenticado (`JwtAuthGuard`) o si tiene los permisos necesarios (roles) para ejecutar cierta acción.

---

## 4. Documentación de la API (Endpoints)

La API está protegida por JWT (excepto el endpoint de login). A continuación, se explican los endpoints expuestos por cada controlador:

### Autenticación (`/auth`)
- `POST /auth/login-saas`: Recibe credenciales y devuelve un token JWT para la sesión del usuario.

### Usuarios (`/users`)
- `GET /users`: Obtiene la lista de todos los usuarios/empleados.
- `GET /users/:id`: Obtiene un usuario específico por su ID.
- `POST /users`: Crea un nuevo usuario.
- `PATCH /users/:id`: Actualiza datos de un usuario existente.
- `DELETE /users/:id`: Elimina un usuario del sistema.

### Mesas (`/tables`)
- `GET /tables`: Obtiene el listado de mesas y su estado actual (libre, ocupada).
- `POST /tables`: Añade una nueva mesa al sistema.
- `DELETE /tables/:tableNumber`: Elimina una mesa específica.

### Turnos (`/shifts`)
- `POST /shifts/start`: Inicia un turno para el usuario autenticado (fichaje de entrada).
- `POST /shifts/end`: Finaliza el turno actual (fichaje de salida).
- `GET /shifts/current`: Obtiene la información del turno activo del usuario.
- `GET /shifts/company`: Lista los turnos de todos los empleados de la compañía.
- `GET /shifts/daily-hours`: Obtiene el cálculo de horas trabajadas en el día.
- `PATCH /shifts/:id`: Modifica la información de un turno.

### Inventario (`/inventory`)
- `GET /inventory`: Obtiene todos los productos del inventario.
- `POST /inventory`: Añade un nuevo producto.
- `GET /inventory/:id`: Obtiene el detalle de un producto.
- `PATCH /inventory/:id`: Actualiza los datos de un producto.
- `DELETE /inventory/:id`: Elimina un producto.
- `PATCH /inventory/:id/stock`: Modifica (incrementa o decrementa) el stock disponible de un producto.
- `GET /inventory/categories`: Obtiene todas las categorías de productos.
- `POST /inventory/categories`: Crea una nueva categoría.
- `PATCH /inventory/categories/:id`: Modifica una categoría.
- `DELETE /inventory/categories/:id`: Elimina una categoría.
- `POST /inventory/upload-image`: Sube una imagen para un producto.
- `POST /inventory/apply-template`: Aplica una plantilla por defecto al inventario.

### Facturas y Cierres (`/invoices`)
- `GET /invoices`: Lista el histórico de facturas.
- `POST /invoices`: Genera una nueva factura/ticket a partir de una venta.
- `GET /invoices/:id`: Obtiene el detalle completo de una factura.
- `PATCH /invoices/:id`: Actualiza el estado de una factura.
- `DELETE /invoices/:id`: Elimina/Anula una factura.
- `GET /invoices/:id/verifactu`: Genera o consulta los datos para la integración con sistemas fiscales (VeriFactu).
- `POST /invoices/daily-closing`: Ejecuta el proceso de cierre de caja diario.
- `GET /invoices/daily-closing/stats`: Obtiene estadísticas de ventas previas a realizar un cierre.
- `GET /invoices/daily-closing/history`: Obtiene el histórico de cierres de caja anteriores.

### Clientes (`/clients`)
- `GET /clients`, `GET /clients/:id`, `POST /clients`, `PATCH /clients/:id`, `DELETE /clients/:id`: CRUD estándar para la gestión de la base de datos de clientes del local.

### Compañía y Configuraciones (`/companies`)
- `GET /companies/settings`: Obtiene las configuraciones globales del restaurante (nombre, CIF, impuestos por defecto).
- `PATCH /companies/settings`: Actualiza dichas configuraciones.

### Logs de Auditoría (`/audit-logs`)
- `GET /audit-logs`: Obtiene el registro de acciones realizadas en el sistema (trazabilidad).
- `POST /audit-logs`: Inserta un nuevo registro de auditoría (normalmente usado internamente por el sistema).

### Inteligencia Artificial (`/ai`)
- `POST /ai/command`: Procesa un comando de lenguaje natural enviado por el usuario para ejecutar acciones en el sistema.
- `POST /ai/analyze-stats`: Genera un reporte inteligente basado en las estadísticas de venta utilizando un LLM.

*Nota: Para ver y probar estos endpoints de forma interactiva, el entorno de desarrollo ofrece una interfaz Swagger accesible en `http://localhost:3000/api` al levantar el backend.*
