# ContentAI PYMES — versión de estabilización

App web con frontend modular (HTML/CSS/JavaScript), API PHP y persistencia MySQL.
El generador de textos es **de demostración y determinista**: no llama a un modelo de IA externo.

## Instalación desde cero en Windows con XAMPP

1. Extrae la carpeta `ContentAI_PYMES_Funcional` dentro de `C:\xampp\htdocs\`.
2. Abre XAMPP e inicia **Apache** y **MySQL**.
3. Entra a `http://localhost/phpmyadmin`, abre la pestaña **Importar** y elige `database/contentai_pyme.sql` (o pega su contenido en SQL). Este script no elimina registros previos.
4. Por defecto, `backend/config/database.php` usa el usuario `root` sin contraseña, puerto `3306`, como instalación local estándar de XAMPP. Si tu MySQL usa otras credenciales, define `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASS` en la configuración del servidor. **No publiques contraseñas en GitHub.**
5. Abre **`http://localhost/ContentAI_PYMES_Funcional/frontend/`**. No uses Live Server ni abras `index.html` directamente con `file://`.
6. Registra un usuario, configura la empresa (4 pasos), genera un texto demo, guárdalo y verifica que se muestre en Biblioteca y Dashboard.

## Verificación rápida de la API

- `http://localhost/ContentAI_PYMES_Funcional/backend/index.php?route=/session` debe devolver un JSON con `status: none` si no has iniciado sesión.
- Si ves un error de conexión al registrar una cuenta, verifica que MySQL esté iniciado, que hayas importado la base y que PHP tenga habilitada la extensión **pdo_mysql**.

## Comprobación con MySQL

Desde phpMyAdmin, ejecutar:

```sql
USE contentai_pyme;
SELECT id_usuario, nombre, correo, creado_en FROM usuarios;
SELECT id, id_usuario, nombre_comercial, actividad_economica FROM empresas;
SELECT id, id_empresa, canal, objetivo, tema, estado, actualizado_en FROM posts;
```

Nunca mostrar contraseñas: `usuarios.password_hash` contiene un hash irreversible, no la clave original.

## Pruebas de código

Con Node.js instalado y ubicado en la carpeta principal:

```bash
npm run check
npm test
```

Estas pruebas validan sintaxis y componentes sin MySQL. Para verificar persistencia real se requiere ejecutar Apache/PHP + MySQL desde XAMPP.

## Estructura

- `frontend/`: vistas, estilos, controlador de navegación y módulo de publicación.
- `backend/`: API, autenticación por sesión, empresas y posts con PDO.
- `database/`: esquema de instalación MySQL.
- `scripts/`: comprobaciones rápidas con Node.js.

## Cambios incluidos

- URL de API relativa al repositorio para funcionar con subcarpetas en `htdocs`.
- Sesión PHP única y respuestas JSON correctas.
- Control de sesión centralizado en la navegación privada.
- Validación por pasos del onboarding (antes fallaba por controles obligatorios ocultos).
- Precarga de datos al editar una empresa y guardado hacia su perfil.
- Copiar texto en el creador; corrección de destino si falta empresa.
- HTML escapado para evitar inyección en tarjetas y perfil.
- Rutas API con errores 404/405 definidos y credenciales MySQL configurables.
- Creación de esquema y pruebas de código ejecutables.

**El código original del repositorio GitHub no se ha modificado.**
