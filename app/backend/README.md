# BarFlow - Backend

Este es el directorio del backend del proyecto BarFlow, desarrollado con **NestJS**, **TypeScript** y **TypeORM**.

## 🏗️ Arquitectura y Estructura

El backend está construido bajo el patrón de diseño modular de NestJS. Todo el código fuente se encuentra en el directorio `src/`:

- **`/ai`**: Módulo para la integración de funcionalidades de Inteligencia Artificial (asistencia, comandos).
- **`/audit-logs`**: Módulo encargado de registrar la trazabilidad y las acciones de los usuarios en el sistema.
- **`/auth`**: Lógica de autenticación, generación y validación de tokens JWT (JSON Web Tokens).
- **`/clients`**: Gestión de la base de datos de clientes del local (fidelización, datos).
- **`/companies`**: Configuraciones globales del restaurante (nombre, CIF, impuestos por defecto).
- **`/fiscal`**: Lógica específica para normativas fiscales (preparado para VeriFactu).
- **`/inventory`**: Control de stock, productos, categorías y carga de imágenes.
- **`/invoices`**: Lógica de facturación, generación de tickets y proceso de cierre de caja diario.
- **`/shifts`**: Gestión de turnos de empleados (fichaje, cálculo de horas).
- **`/tables`**: Gestión de las mesas físicas del local y su estado.
- **`/users`**: Gestión de empleados, roles y accesos al sistema.

Cada directorio contiene típicamente:
- `*.module.ts`: Definición del módulo.
- `*.controller.ts`: Rutas HTTP y validación de entradas.
- `*.service.ts`: Lógica de negocio.
- `entities/`: Modelos de base de datos definidos con TypeORM.
- `dto/`: Objetos de transferencia de datos para la validación (usando `class-validator`).

## 🛠️ Tecnologías Principales
- **NestJS (v11)**: Framework principal para la escalabilidad.
- **TypeORM**: Mapeo de la base de datos (PostgreSQL/MySQL).
- **Passport/JWT**: Sistema seguro de autenticación.
- **Swagger**: Documentación automática de la API.
- **Sharp**: Optimización y manejo de imágenes.

## 🚀 Instalación y Ejecución

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar el entorno**:
   Crea un archivo `.env` basado en el entorno necesario. (Consulta la base de datos configurada en `docker-compose`).
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=3306 # o 5432 para postgres
   DATABASE_USER=...
   DATABASE_PASSWORD=...
   DATABASE_NAME=barflow_db
   DATABASE_SYNC=true
   ```

3. **Ejecutar el servidor**:
   ```bash
   # Desarrollo (con recarga automática)
   npm run start:dev

   # Producción
   npm run build
   npm run start:prod
   ```

## 📄 Documentación API
Con la aplicación corriendo, puedes acceder a la interfaz de Swagger para probar los endpoints y ver sus descripciones en:
👉 `http://localhost:3000/api`

Para un detalle exhaustivo de la API y el por qué de cada tecnología, dirígete al archivo [DOCUMENTATION.md](../../DOCUMENTATION.md) en la raíz del proyecto.
