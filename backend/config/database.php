<?php
class Database {
    public static function conectar() {
        $host = '127.0.0.1';
        $db   = 'contentai_pyme';
        $user = 'contentai_app';
        $pass = 'ADMIN123';

        try {
            $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
            return $pdo;
        } catch (PDOException $e) {
            throw new Exception("Error de conexión a la base de datos.");
        }
    }
}