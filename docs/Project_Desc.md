# BarFlow

**BarFlow** es un sistema TPV (Terminal Punto de Venta) open source diseñado para bares, cafeterías y restaurantes.

El objetivo del proyecto es crear un TPV moderno, rápido y sencillo que funcione en tablets, ordenadores táctiles y navegadores web, con soporte para hardware típico de hostelería como impresoras de tickets y cajones de efectivo.

BarFlow está pensado especialmente para pequeños y medianos negocios que necesitan una solución flexible, económica y que puedan controlar sin depender de software propietario.

---

# Objetivos del proyecto

- Crear un TPV open source moderno para hostelería
- Facilitar la gestión de mesas, pedidos y cobros
- Funcionar tanto online como offline
- Ser fácil de instalar y mantener
- Permitir personalización y extensiones
- Cumplir con la normativa fiscal aplicable en España

---

# Características principales

## Gestión de mesas
- Vista visual de mesas
- Apertura y cierre de mesas
- Cambio de mesa
- Estado de mesa (libre / ocupada)

## Pedidos
- Añadir productos rápidamente
- Modificar cantidades
- Eliminar productos
- Comentarios de cocina

## Productos
- Categorías de productos
- Gestión de precios
- Activar / desactivar productos

## Tickets
- Generación automática de tickets
- Impresión de tickets
- Métodos de pago (efectivo, tarjeta, mixto)

## Caja
- Apertura de caja
- Cierre de caja
- Resumen de ventas

---

# Arquitectura del sistema

BarFlow sigue una arquitectura moderna basada en una aplicación web.

Cliente (Tablet / PC / Navegador)
│
Frontend
(React PWA)
│
API
Backend
(Node.js)
│
PostgreSQL


Esto permite:

- uso en tablets
- funcionamiento en navegador
- posibilidad de modo offline
- despliegue en servidor local o en la nube

---

# Hardware compatible

El sistema está diseñado para funcionar con hardware típico de hostelería:

- Tablets Android
- Ordenadores táctiles
- Impresoras de tickets (ESC/POS)
- Cajones portamonedas
- Impresoras de cocina

---

# Estructura del repositorio
BarFlow/

apps/
frontend/
backend/

packages/
ui/
printer/
shared/

docker/
docs/


---

# Estado del proyecto

🚧 En desarrollo inicial.

Las primeras versiones se centrarán en construir un **MVP funcional** que permita gestionar:

- productos
- mesas
- pedidos
- tickets
- caja

---

# Roadmap

## Fase 1
- arquitectura base
- base de datos
- API inicial

## Fase 2
- interfaz de mesas
- gestión de pedidos
- sistema de tickets

## Fase 3
- integración con impresoras
- control de caja

## Fase 4
- pruebas en bares reales
- mejoras de rendimiento
- modo offline

---

# Licencia

Este proyecto será distribuido bajo licencia open source.

Licencia recomendada:

AGPL-3.0

---

# Contribuciones

Las contribuciones son bienvenidas.

Puedes contribuir mediante:

- desarrollo de código
- reportes de bugs
- mejoras de documentación
- sugerencias de funcionalidades

---

# Visión

BarFlow busca convertirse en una alternativa open source moderna para el sector de la hostelería, ofreciendo una solución transparente, extensible y accesible para negocios de todo tipo.