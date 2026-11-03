<?php
require_once __DIR__ . '/../config/database.php';

class PostController {
    
    public function obtenerPosts(): void {
        $this->verificarSesion();
        $idUsuario = (int) $_SESSION['id_usuario'];

        try {
            $pdo = Database::conectar();
            $stmtEmp = $pdo->prepare('SELECT id FROM empresas WHERE id_usuario = ? LIMIT 1');
            $stmtEmp->execute([$idUsuario]);
            $empresa = $stmtEmp->fetch();

            if (!$empresa) {
                echo json_encode(['status' => 'success', 'posts' => []]);
                return;
            }

            $stmt = $pdo->prepare('SELECT * FROM posts WHERE id_empresa = ? ORDER BY actualizado_en DESC');
            $stmt->execute([$empresa['id']]);
            $posts = $stmt->fetchAll();

            $postsFormateados = array_map(function($p) {
                return [
                    'id' => (int) $p['id'],
                    'channel' => $p['canal'],
                    'objective' => $p['objetivo'],
                    'topic' => $p['tema'],
                    'text' => $p['texto'],
                    'image' => $p['imagen_url'] ?? '',
                    'imagePrompt' => $p['prompt_imagen'] ?? '',
                    'status' => $p['estado'],
                    'updatedAt' => $p['actualizado_en']
                ];
            }, $posts);

            echo json_encode(['status' => 'success', 'posts' => $postsFormateados]);
        } catch (Exception $e) {
            $this->responderError('Error al cargar publicaciones.', 500);
        }
    }

    public function guardarPost(): void {
        $this->verificarSesion();
        $idUsuario = (int) $_SESSION['id_usuario'];

        $canal = trim($_POST['channel'] ?? '');
        $objetivo = trim($_POST['objective'] ?? '');
        $tema = trim($_POST['topic'] ?? '');
        $texto = trim($_POST['text'] ?? '');
        $imagenUrl = trim($_POST['image'] ?? '');
        $promptImagen = trim($_POST['imagePrompt'] ?? '');
        $estado = trim($_POST['status'] ?? 'draft');
        
        if (!in_array($estado, ['draft', 'approved'], true)) {
            $this->responderError('Estado de publicación inválido.', 422);
        }
        if (empty($texto) || empty($canal)) {
            $this->responderError('El texto y el canal son obligatorios.', 422);
        }

        try {
            $pdo = Database::conectar();
            $stmtEmp = $pdo->prepare('SELECT id FROM empresas WHERE id_usuario = ? LIMIT 1');
            $stmtEmp->execute([$idUsuario]);
            $empresa = $stmtEmp->fetch();

            if (!$empresa) {
                $this->responderError('Debes configurar tu empresa primero.', 403);
            }

            $sql = 'INSERT INTO posts (id_empresa, canal, objetivo, tema, texto, imagen_url, prompt_imagen, estado, actualizado_en)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())';
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $empresa['id'], 
                $canal, 
                $objetivo, 
                $tema, 
                $texto, 
                $imagenUrl !== '' ? $imagenUrl : null,
                $promptImagen !== '' ? $promptImagen : null,
                $estado
            ]);

            echo json_encode([
                'status' => 'success', 
                'message' => 'Publicación guardada correctamente.',
                'postId' => (int) $pdo->lastInsertId()
            ]);
        } catch (Exception $e) {
            $this->responderError('No se pudo guardar la publicación.', 500);
        }
    }

    private function verificarSesion(): void {
        if (!isset($_SESSION['id_usuario'])) {
            $this->responderError('Sesión expirada.', 401);
        }
    }

    private function responderError(string $mensaje, int $codigo): void {
        http_response_code($codigo);
        echo json_encode(['status' => 'error', 'message' => $mensaje]);
        exit;
    }
}