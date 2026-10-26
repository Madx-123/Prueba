# ContentAI PYMES · PHP + MySQL

Registro, inicio/cierre de sesión, formulario de empresa, publicaciones y foto de perfil con persistencia en MySQL. La generación de textos sigue siendo por plantillas y no publica en redes sociales.

## Instalación en Windows / XAMPP

1. Coloca el proyecto en `C:\xampp\htdocs\Prueba`.
2. Inicia Apache. Usa el MISMO servidor MySQL y puerto que verificaste en Workbench. Si ya tienes MySQL instalado como servicio, no necesitas iniciar otro servidor en XAMPP.
3. Si todavía no tienes las tablas, abre `database/schema.sql` en Workbench y ejecútalo. Si ya creaste la base con tu `content_ai.sql`, conserva los datos y pasa al siguiente punto. El esquema no borra tablas y `IF NOT EXISTS` no corrige tablas antiguas.
4. Ejecuta `database/upgrade.sql`. Amplía las columnas de imágenes, habilita utf8mb4 para emojis y asegura InnoDB para la transacción del formulario; conserva los registros. Haz una copia de seguridad si la base contiene información importante.
5. Copia `api/config.example.php` como `api/config.local.php`. Ajusta host, puerto, base, usuario y contraseña a TU servidor. La clave no viene incluida. No subas ese archivo a GitHub.
6. Abre `http://localhost/Prueba/` (si Apache usa otro puerto, inclúyelo). **No uses Live Server, GitHub Pages ni abras index.html con doble clic:** se necesita PHP.

Requisitos: PHP 7.4 o superior con PDO MySQL y un servidor MySQL 8.0.16+ (o MariaDB compatible). `getimagesizefromstring` valida las fotos. Para la aplicación local basta PHP/Apache y MySQL; no hay dependencias npm obligatorias.

## Demostración ante el docente

1. Crea una cuenta desde la web con un correo nuevo y contraseña de 6 a 72 bytes. Las cuentas antiguas del navegador no se migran automáticamente.
2. Completa los cuatro pasos del formulario. Pulsa **Finalizar configuración** una sola vez y espera el mensaje de éxito.
3. En Workbench abre `database/verificar.sql`, cambia `@correo` por tu correo registrado y ejecuta las consultas. El JOIN muestra todos los campos del formulario.
4. Edita la empresa desde la web y vuelve a ejecutar el SELECT. Verás los valores nuevos y la misma empresa, sin duplicarla.
5. Cierra sesión, vuelve a entrar con la misma cuenta o abre otro navegador. Los datos se recuperan desde MySQL.
6. Guarda una publicación y ejecuta la consulta de `contenidos_generados`.

No hay INSERT de ejemplo en verificar.sql: la evidencia debe provenir del formulario.

## Dónde se guarda cada dato

| Campo | Tabla y columna |
|---|---|
| Nombre, correo, contraseña protegida | usuarios.nombre / correo / password_hash |
| Foto de perfil | usuarios.foto_perfil (data URL) |
| Nombre comercial, sector, ciudad | empresas.nombre_comercial / actividad_economica / ubicacion |
| Texto libre de productos y servicios | empresas.descripcion |
| Cliente ideal | publicos_objetivo.descripcion_perfil (segmento General) |
| Diferenciador, tono, objetivo, canales | identidades_marca.propuesta_valor / tono_comunicacion / objetivo_principal / canales_preferidos |
| Texto, canal, estado e imagen de publicación | contenidos_generados |

El formulario tiene UNA descripción conjunta de productos y servicios. No se inventan productos individuales ni se separa automáticamente ese texto en las tablas `productos` y `servicios`. Esas tablas y `campanas` quedan disponibles para futuros formularios específicos. Los canales se guardan separados por comas en la columna existente. La información de tema/objetivo de una publicación se guarda en JSON en `contexto_prompt`.

Empresas antiguas que guardaron JSON en descripcion se leen de manera compatible. Al guardar de nuevo el formulario, sus datos pasan a las tablas indicadas. Las imágenes se guardan como data URL con límite de 1.5 MB; por eso es necesario ejecutar upgrade.sql.

## Estructura

- `index.html`, `css/`, `assets/`: interfaz y estilos existentes.
- `js/views/`: vistas sin acceso directo a la base.
- `js/app.js`: un único flujo de eventos para cada formulario.
- `js/services/api.js`: peticiones HTTP relativas a la carpeta del proyecto, sin fallback a localStorage.
- `api/index.php`: operaciones de cuenta, empresa y contenidos; exige sesión y token CSRF para escrituras.
- `api/bootstrap.php`: PDO, sesión, validación y transformación de registros.
- `api/config.example.php`: plantilla de conexión; tu configuración privada va en config.local.php.
- `api/registro.php`, `login.php`, `guardar_empresa.php`: alias de las operaciones JSON; no son formularios independientes.
- `database/`: esquema, actualización y SELECT de evidencia.
- `js/services/repository.js`: módulo demo antiguo conservado, ya no importado por la aplicación.

## Verificación

- `npm run check`: sintaxis JavaScript.
- `npm test`: vistas y contrato HTTP con respuestas simuladas; no prueba una base real.
- `php -l api/index.php` y `php -l api/bootstrap.php`: sintaxis PHP.
- `CONTENTAI_TEST_URL=http://127.0.0.1:8000/api/index.php python3 scripts/integration.py`: prueba HTTP real; necesita servidor PHP, configuración y esquema ya instalados en una **base de pruebas**. Crea dos cuentas con correos únicos y sus datos; no elimina información existente. Verifica sesión, contraseña, CSRF, empresa, edición, aislamiento y publicaciones.

Si aparece un error de MySQL, revisa `api/config.local.php`, el puerto y las tablas; consulta el registro de errores de PHP/Apache. La aplicación no muestra éxito cuando el servidor rechaza el guardado.

### Validación de esta corrección

Se ejecutaron la sintaxis de los seis archivos PHP, la sintaxis de 14 módulos JavaScript y 28 verificaciones de vistas/contrato HTTP. La integración real pasó con PHP 8.3 y MariaDB 10.11, usando primero el `content_ai.sql` original y después upgrade.sql: registro, contraseña, sesión, CSRF, formulario completo, edición sin duplicado, aislamiento entre cuentas, publicaciones, imágenes y recuperación tras login. Un SELECT directo confirmó empresa, identidad y público. La prueba visual automatizada no se ejecutó porque el entorno no tenía Chromium; queda por comprobar en tu navegador y en tu servidor MySQL de Windows.
