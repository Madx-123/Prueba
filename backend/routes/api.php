<?php
$route = $_GET['route'] ?? '/';
$method = $_SERVER['REQUEST_METHOD'];

// Cargar controladores globalmente
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/EmpresaController.php';
require_once __DIR__ . '/../controllers/PostController.php';

// Diccionario único de rutas
switch ($route) {
    case '/login':
        if ($method === 'POST') {
            $controller = new AuthController();
            $controller->login();
        }
        break;

    case '/registro':
        if ($method === 'POST') {
            $controller = new AuthController();
            $controller->registro();
        }
        break;

    case '/session':
        if ($method === 'GET') {
            $controller = new AuthController();
            $controller->checkSession();
        }
        break;

    case '/empresa':
        $controller = new EmpresaController();
        if ($method === 'GET') {
            $controller->obtenerEmpresa();
        } elseif ($method === 'POST') {
            $controller->guardarEmpresa();
        }
        break;

    case '/posts':
        $controller = new PostController();
        if ($method === 'GET') {
            $controller->obtenerPosts();
        } elseif ($method === 'POST') {
            $controller->guardarPost();
        }
        break;

    case '/logout':
        if ($method === 'POST') {
            $controller = new AuthController();
            $controller->logout();
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Ruta no encontrada']);
        break;
}