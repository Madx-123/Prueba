# Flujo de persistencia

La interfaz usa `api` de `js/services/api.js`. Cada operación va a `api/index.php` mediante HTTP del mismo origen. PHP valida el token CSRF, la sesión y los campos, y ejecuta sentencias preparadas con PDO.

El registro inserta el usuario con `password_hash`, regenera la sesión y devuelve sus datos públicos. El login usa `password_verify`; las rutas privadas obtienen el id de la sesión, nunca de un id_usuario enviado por el navegador. Cerrar sesión destruye la sesión PHP.

Guardar empresa bloquea la fila del usuario dentro de una transacción InnoDB. Inserta o actualiza empresas, identidades_marca y el segmento General de publicos_objetivo. Ante un error revierte los tres cambios. La respuesta de éxito sale después del COMMIT. Editar conserva el id_empresa.

Recargar consulta la sesión, la empresa y las publicaciones en MySQL. No hay escritura ni recuperación automática desde localStorage. El antiguo repository.js queda como referencia del prototipo, sin uso en el flujo activo.

Las publicaciones y fotos también persisten en MySQL. Se verifica la propiedad de las publicaciones antes de editarlas o eliminarlas. La exportación incluye solamente la cuenta actual. No existe la acción de restablecer la demo en la interfaz conectada.

La generación de contenido continúa siendo local por plantillas. Los archivos de vista y CSS conservan su separación. Para servir la aplicación se requiere PHP, no un servidor estático.

Consulta README.md para instalación, mapa campo/tabla y límites; database/verificar.sql para demostrar la persistencia mediante SELECT.
