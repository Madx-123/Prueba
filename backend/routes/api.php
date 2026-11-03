<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/EmpresaController.php';
require_once __DIR__ . '/../controllers/PostController.php';

$route = $_GET['route'] ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$routes = [
    '/login' => ['POST', AuthController::class, 'login'],
    '/registro' => ['POST', AuthController::class, 'registro'],
    '/session' => ['GET', AuthController::class, 'checkSession'],
    '/logout' => ['POST', AuthController::class, 'logout'],
    '/empresa' => ['GET' => [EmpresaController::class, 'obtenerEmpresa'], 'POST' => [EmpresaController::class, 'guardarEmpresa']],
    '/posts' => ['GET' => [PostController::class, 'obtenerPosts'], 'POST' => [PostController::class, 'guardarPost']]
];

if (!isset($routes[$route])) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Ruta no encontrada']);
    return;
}

$definition = $routes[$route];
if (isset($definition[0])) {
    $allowedMethods = [$definition[0]];
    $action = $method === $definition[0] ? [$definition[1], $definition[2]] : null;
} else {
    $allowedMethods = array_keys($definition);
    $action = $definition[$method] ?? null;
}

if (!$action) {
    http_response_code(405);
    header('Allow: ' . implode(', ', $allowedMethods));
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
    return;
}

[$className, $methodName] = $action;
(new $className())->$methodName();
