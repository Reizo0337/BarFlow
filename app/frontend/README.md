# BarFlow - Frontend

Este es el directorio del frontend del proyecto BarFlow, desarrollado con **Vue.js 3** (Composition API), **Vite**, y **TailwindCSS**.

## 🏗️ Arquitectura y Estructura

El frontend está diseñado de forma reactiva, priorizando la fluidez, usabilidad y velocidad para el entorno de un bar/restaurante. Todo el código fuente reside en el directorio `src/`:

- **`/views`**: Contiene las pantallas principales de la aplicación (Páginas).
  - `VentasView.vue`: Interfaz del TPV (Terminal Punto de Venta).
  - `AdminView.vue`, `InventoryView.vue`, `InvoicesView.vue`: Pantallas de administración.
  - `DailyClosingView.vue`: Pantalla para realizar el cierre de caja.
  - `StatisticsView.vue`, `ReportsView.vue`: Visualización de gráficas y reportes.
- **`/components`**: Componentes visuales reutilizables (Botones, Modales, Tarjetas).
- **`/stores`**: Gestión del estado global utilizando **Pinia**. Aquí se manejan los estados compartidos, como la sesión del usuario autenticado o el carrito del TPV.
- **`/services`**: Archivos de integración con la API del backend utilizando **Axios**. Encapsulan las llamadas HTTP (e.g., `auth.service.ts`, `inventory.service.ts`).
- **`/router`**: Configuración de las rutas de la aplicación utilizando **Vue Router**. Aquí se definen los accesos y guardias de navegación (navigation guards) para asegurar que solo los usuarios autenticados o con permisos puedan acceder a ciertas pantallas.
- **`/assets`**: Imágenes estáticas, iconos y hojas de estilo globales.
- **`/utils`**: Funciones auxiliares genéricas y utilidades.

## 🛠️ Tecnologías Principales
- **Vue 3 (Composition API)**: Paradigma reactivo moderno para lógica más ordenada.
- **Vite**: Construcción ultrarrápida y recarga en caliente instantánea.
- **TailwindCSS (v4)**: Estilización a través de clases de utilidad para interfaces consistentes y responsivas.
- **Pinia**: Manejo de estado escalable y con soporte a TypeScript.
- **Axios**: Cliente HTTP para consumir el backend de forma elegante.
- **Chart.js / vue-chartjs**: Renderizado de gráficos interactivos para estadísticas.
- **jsPDF**: Creación nativa de PDFs en el cliente (facturas, tickets, resúmenes).

## 🚀 Instalación y Ejecución

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Esto levantará el servidor de Vite, típicamente accesible en `http://localhost:5173`.

3. **Construcción para Producción**:
   ```bash
   npm run build
   ```
   Genera los archivos estáticos listos para desplegar en el directorio `dist/`.

## 🧪 Comandos Útiles Adicionales
- `npm run type-check`: Verifica los tipos de TypeScript en el proyecto.
- `npm run lint`: Ejecuta ESLint y Oxlint para asegurar la calidad del código.
- `npm run format`: Formatea el código fuente utilizando Prettier.

Para conocer más sobre la justificación tecnológica global y el funcionamiento de la API, consulta el documento [DOCUMENTATION.md](../../DOCUMENTATION.md) en la raíz del proyecto.
