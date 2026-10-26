USE contentai_pyme;
-- Conserva las fotos que el frontend transforma en data URLs.
-- Ejecutar una vez antes de usar la versión conectada; puede repetirse.
ALTER TABLE usuarios MODIFY foto_perfil MEDIUMTEXT DEFAULT NULL;
ALTER TABLE contenidos_generados MODIFY imagen_generada_url MEDIUMTEXT DEFAULT NULL;
-- Las tres tablas del formulario deben admitir transacciones.
ALTER TABLE usuarios ENGINE=InnoDB;
ALTER TABLE empresas ENGINE=InnoDB;
ALTER TABLE identidades_marca ENGINE=InnoDB;
ALTER TABLE publicos_objetivo ENGINE=InnoDB;

-- Acentos y emojis incluso si la base anterior se creó con latin1.
ALTER DATABASE contentai_pyme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuarios CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE empresas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE identidades_marca CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE publicos_objetivo CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE productos CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE servicios CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE campanas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE contenidos_generados CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
