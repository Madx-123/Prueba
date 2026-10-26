CREATE DATABASE IF NOT EXISTS contentai_pyme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE contentai_pyme;

-- 1. Tabla Usuarios 
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    foto_perfil MEDIUMTEXT DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla Empresas
CREATE TABLE IF NOT EXISTS empresas (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL,
    nombre_comercial VARCHAR(150) NOT NULL,
    actividad_economica VARCHAR(150) NOT NULL,
    descripcion TEXT, 
    ubicacion VARCHAR(200),
    logo VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla Identidad de Marca 
CREATE TABLE IF NOT EXISTS identidades_marca (
    id_identidad INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT UNIQUE NOT NULL,
    tono_comunicacion VARCHAR(100) NOT NULL,
    propuesta_valor TEXT, 
    objetivo_principal VARCHAR(150), 
    canales_preferidos VARCHAR(255), 
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla Públicos objetivo
CREATE TABLE IF NOT EXISTS publicos_objetivo (
    id_publico INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    nombre_segmento VARCHAR(100) NOT NULL DEFAULT 'General', 
    descripcion_perfil TEXT NOT NULL, 
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla Productos
CREATE TABLE IF NOT EXISTS productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    caracteristicas TEXT,
    beneficios TEXT,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla Servicios
CREATE TABLE IF NOT EXISTS servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    beneficios TEXT,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabla Campañas
CREATE TABLE IF NOT EXISTS campanas (
    id_campana INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    objetivo TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabla Contenidos Generados
CREATE TABLE IF NOT EXISTS contenidos_generados (
    id_contenido INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    id_producto INT DEFAULT NULL,
    id_servicio INT DEFAULT NULL,
    id_campana INT DEFAULT NULL,
    canal_referencia VARCHAR(50), 
    tipo_contenido VARCHAR(50),   
    contexto_prompt TEXT NOT NULL,
    texto_generado TEXT,
    imagen_generada_url MEDIUMTEXT DEFAULT NULL,
    estado VARCHAR(20) DEFAULT 'Borrador' CHECK (estado IN ('Borrador', 'Aprobado', 'Descartado')),
    valoracion_interna INT DEFAULT NULL CHECK (valoracion_interna BETWEEN 1 AND 5),
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE SET NULL,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE SET NULL,
    FOREIGN KEY (id_campana) REFERENCES campanas(id_campana) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;