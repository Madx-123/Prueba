<?php
class Database {
    public static function conectar(): PDO {
        // Valores de desarrollo para XAMPP. En producción configura variables DB_*.
        $host = getenv('DB_HOST') !== false ? getenv('DB_HOST') : '127.0.0.1';
        $db   = getenv('DB_NAME') !== false ? getenv('DB_NAME') : 'contentai_pyme';
        $user = getenv('DB_USER') !== false ? getenv('DB_USER') : 'root';
        $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
        $port = getenv('DB_PORT') !== false ? getenv('DB_PORT') : '3306';

        try {
            return new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            error_log('Error de conexión MySQL: ' . $e->getMessage());
            throw new RuntimeException('No se pudo conectar a MySQL. Comprueba XAMPP, la base de datos y las credenciales.');
        }
    }
}
