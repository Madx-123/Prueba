# ContentAI PYMES · Frontend estático modular

Proyecto reconstruido a partir de `Prueba(4).zip` para mantener una SPA ligera, organizada y funcional sin framework de UI ni backend.

## Ejecutar

1. Descomprime el ZIP.
2. Abre la carpeta `ContentAI_PYMES_Refactor` en Visual Studio Code.
3. Ejecuta `index.html` con la extensión **Live Server**. **No abras el archivo con `file://`**: los módulos ES necesitan HTTP local.
4. Para explorar los datos ficticios, pulsa **Explorar la demo** en la landing, o inicia sesión con `demo@contentai.pe` y cualquier contraseña no vacía.
5. Para probar un usuario nuevo, crea cuenta con otro correo. Te llevará al asistente empresarial en cuatro etapas.

## Contenido del prototipo

- Landing Page responsive.
- Inicio de sesión y registro **simulados**, con datos por cuenta demo local. No se almacenan contraseñas ni se verifican credenciales realmente.
- Onboarding en cuatro etapas con validación, progresión y guardado de empresa.
- Dashboard con menú lateral plegable mediante clic y expansión por hover en escritorio; cajón y fondo móvil.
- Panel de inicio con métricas y publicaciones recientes.
- Generador de texto **por plantillas**, sin IA real; editor, formato, variaciones y copia.
- Previsualizaciones que simulan Facebook, Instagram, TikTok, WhatsApp y Email. No publican en ninguna plataforma.
- Biblioteca con búsqueda, filtros, ordenamiento, editar, duplicar y eliminar.
- Perfil empresarial editable.
- Exportar datos demo a JSON y restablecer las pruebas.

## Estructura

```
index.html                 Entrada HTML única; sin vistas duplicadas
css/
  tokens.css               Identidad visual única
  base.css                 Estilos generales
  components.css           Botones, cards, inputs, notificaciones
  layout.css               Layouts de landing, acceso, onboarding y dashboard
  previews.css             Maquetas de cinco redes/plataformas
  responsive.css           Reglas adaptativas
js/
  app.js                   Controlador central y eventos delegados
  core/state.js            Estado temporal de UI
  core/utils.js            Funciones puras y escape HTML
  data/seed.js             Datos de prueba, catálogos y ejemplos
  features/copyGenerator.js Motor local de plantillas comerciales
  services/repository.js   Lectura/escritura de localStorage y sesión
  services/api.js          Contrato asíncrono de operaciones demo
  ui/icons.js              Iconos SVG sin librerías externas
  ui/toast.js              Notificaciones no bloqueantes
  views/public.js          Landing, login, registro
  views/onboarding.js      Asistente empresarial
  views/dashboard.js       Páginas y componentes del dashboard
  views/previews.js        Maquetas visuales puras
assets/favicon.svg          Ícono del producto
```

## Responsabilidades y futura integración

- Las **vistas** reciben datos y retornan HTML. No utilizan localStorage ni llamadas HTTP.
- El **controlador** (`js/app.js`) se encarga del estado de la UI y de los eventos. No escribe directamente en localStorage.
- El **servicio** (`js/services/api.js`) expone operaciones asíncronas (`login`, `register`, `saveCompany`, `posts`, `savePost`, etc.). En esta versión invoca un repositorio local, no un servidor.
- El **repositorio** (`js/services/repository.js`) administra la persistencia con una clave versionada. Cuando llegue Laravel, se sustituirá la implementación demo por peticiones al backend sin rehacer las vistas.
- `js/data/seed.js` agrupa toda la información ficticia. Las cuentas nuevas no heredan la empresa de demostración.
- `js/features/copyGenerator.js` encapsula las plantillas de textos. No representa una IA real.

## Avisos

**Las contraseñas no se verifican.** No uses cuentas reales ni información privada. Los datos de localStorage no sustituyen una base de datos. El botón exportar descargará todo el conjunto demo guardado en ese navegador. Las publicaciones y vistas previas son ilustrativas.

Si ya utilizaste la versión antigua, sus claves `contentai_pyme_*` no se modifican ni se migran automáticamente: esta refactorización usa `contentai.v3.demo.*` para no corromper datos anteriores.

## Verificación estática

Ejecuta `npm run check` (sintaxis) y `npm test` (28 comprobaciones funcionales de servicios, componentes y maquetas) si tienes Node.js instalado. No hay dependencias npm obligatorias.

## Pruebas de integración y responsive

Se probó una carga en Chromium con los módulos incrustados y almacenamiento local simulado (el entorno impide navegar a servidores locales); se recorrieron la entrada demo, creación y edición, cambio de canal, guardado, búsqueda, duplicación, perfil, cierre de sesión, alta de cuenta nueva, asistente de cuatro etapas y menú móvil. El resultado no reemplaza las pruebas en Live Server de tu equipo.
