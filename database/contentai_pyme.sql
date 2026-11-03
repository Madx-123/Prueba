-- Ejecutar una sola vez en phpMyAdmin > SQL (MySQL/MariaDB).
-- No elimina tablas ni datos existentes.
CREATE DATABASE IF NOT EXISTS contentai_pyme
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE contentai_pyme;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS empresas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario INT UNSIGNED NOT NULL,
  nombre_comercial VARCHAR(180) NOT NULL,
  actividad_economica VARCHAR(120) NOT NULL,
  descripcion TEXT NULL,
  ubicacion VARCHAR(180) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_empresas_usuario (id_usuario),
  CONSTRAINT fk_empresas_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_empresa INT UNSIGNED NOT NULL,
  canal VARCHAR(50) NOT NULL,
  objetivo VARCHAR(150) NOT NULL DEFAULT '',
  tema VARCHAR(500) NOT NULL DEFAULT '',
  texto TEXT NOT NULL,
  imagen_url TEXT NULL,
  prompt_imagen TEXT NULL,
  estado ENUM('draft', 'approved') NOT NULL DEFAULT 'draft',
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_posts_empresa_fecha (id_empresa, actualizado_en),
  CONSTRAINT fk_posts_empresa FOREIGN KEY (id_empresa)
    REFERENCES empresas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
