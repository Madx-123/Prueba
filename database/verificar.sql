USE contentai_pyme;

-- 1. Reemplaza este correo por el que registraste DESDE LA WEB.
SET @correo = 'maddox.prueba@example.com';

-- 2. Registro de usuario (no mostramos el hash de la contraseña).
SELECT id_usuario, nombre, correo, fecha_creacion
FROM usuarios WHERE correo = @correo;

-- 3. Todos los campos del formulario, guardados en sus tablas.
SELECT u.correo, e.id_empresa, e.nombre_comercial,
       e.actividad_economica AS sector, e.ubicacion AS ciudad,
       e.descripcion AS productos_y_servicios,
       p.descripcion_perfil AS cliente_ideal,
       i.propuesta_valor AS diferenciador,
       i.tono_comunicacion AS tono, i.objetivo_principal AS objetivo,
       i.canales_preferidos AS canales
FROM usuarios u
JOIN empresas e ON e.id_usuario = u.id_usuario
LEFT JOIN identidades_marca i ON i.id_empresa = e.id_empresa
LEFT JOIN publicos_objetivo p ON p.id_empresa = e.id_empresa
    AND p.nombre_segmento = 'General'
WHERE u.correo = @correo;

-- 4. Evidencia por tabla.
SELECT e.* FROM empresas e JOIN usuarios u ON u.id_usuario=e.id_usuario WHERE u.correo=@correo;
SELECT i.* FROM identidades_marca i JOIN empresas e ON e.id_empresa=i.id_empresa JOIN usuarios u ON u.id_usuario=e.id_usuario WHERE u.correo=@correo;
SELECT p.* FROM publicos_objetivo p JOIN empresas e ON e.id_empresa=p.id_empresa JOIN usuarios u ON u.id_usuario=e.id_usuario WHERE u.correo=@correo;

-- 5. Publicaciones guardadas desde la biblioteca/generador.
SELECT c.id_contenido, c.canal_referencia, c.contexto_prompt,
       c.texto_generado, c.estado, c.fecha_generacion
FROM contenidos_generados c
JOIN empresas e ON e.id_empresa=c.id_empresa
JOIN usuarios u ON u.id_usuario=e.id_usuario
WHERE u.correo=@correo;

-- 6. Después de editar, debe seguir habiendo una empresa por usuario.
SELECT u.correo, COUNT(e.id_empresa) AS empresas_registradas
FROM usuarios u LEFT JOIN empresas e ON e.id_usuario=u.id_usuario
WHERE u.correo=@correo GROUP BY u.id_usuario,u.correo;
