# Arquitectura frontend de ContentAI PYMES

## Principios

1. **Una única entrada HTML** (`index.html`) que monta la SPA en `#app`. No hay pantallas duplicadas.
2. **Vistas puras** (`js/views/`): construyen únicamente las estructuras HTML de la pantalla a partir de los datos recibidos. Escapan los textos proporcionados por el usuario.
3. **Un controlador de eventos** (`js/app.js`) que atiende eventos delegados (`data-action`, `data-editor-field`, `data-company-field`) y coordina las operaciones sin escribir directamente en la base simulada.
4. **Estado temporal explícito** (`js/core/state.js`) para filtros, vista actual, editor, barra lateral y paso del asistente. No se confunde con la persistencia.
5. **Servicio estable** (`js/services/api.js`), cuyos métodos devuelven promesas y representan las operaciones del sistema.
6. **Almacenamiento aislado** (`js/services/repository.js`), que aplica las lecturas y escrituras de demostración sobre `localStorage`. Los datos ficticios nacen en `js/data/seed.js`.
7. **Generación sin IA real** (`js/features/copyGenerator.js`). Las plantillas están encapsuladas y no mezcladas con la UI.
8. **Estilos por responsabilidad**: tokens, base, componentes, estructuras, maquetas y responsive.

## Flujo de un nuevo usuario

```
Landing → Crear cuenta demo → Onboarding (4 etapas) → Inicio
                                                         ├── Crear contenido
                                                         ├── Biblioteca
                                                         ├── Mi empresa
                                                         └── Configuración
```

Las cuentas se almacenan en localStorage; la sesión actual se conserva solo en sessionStorage (sesión de pestaña). Esta solución se usa únicamente para una demo, no para seguridad.

## Canal de publicación nuevo

1. Añadir el canal a `CHANNELS` en `js/data/seed.js`.
2. Añadir una nueva rama en `js/features/copyGenerator.js`.
3. Crear el render visual correspondiente en `js/views/previews.js`.
4. Definir los estilos exclusivos del mockup en `css/previews.css`.
5. Verificar responsive y pruebas de interfaz.

## Integración futura con backend

Cuando el curso requiera usar un backend, el primer módulo a reemplazar es `js/services/api.js` (respetando sus entradas y respuestas); el repositorio demo podría quedar disponible solo para prototipos. Las vistas, los elementos de navegación y los estilos son independientes del método de persistencia. **Este proyecto no contiene código PHP ni conexión a Laravel, MySQL o modelos IA.**

## Pruebas

- `npm run check`: comprobación de sintaxis JavaScript.
- `npm test`: pruebas autocontenidas en Node.js para el servicio, persistencia demo, plantillas, vistas y aislamiento de usuarios.
- Pruebas manuales: completar el recorrido en Chrome/Edge, resoluciones 390, 768 y 1440 píxeles, teclado y responsive.
