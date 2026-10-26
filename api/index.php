<?php
require __DIR__ . '/bootstrap.php';
try {
    $action = $_GET['action'] ?? '';
    $reads = ['session', 'company', 'posts', 'export'];
    $writes = ['register', 'login', 'logout', 'saveCompany', 'savePost', 'deletePost', 'saveAvatar'];
    if (!in_array($action, array_merge($reads, $writes), true)) fail('Operación desconocida.', 404);
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method !== (in_array($action, $reads, true) ? 'GET' : 'POST')) fail('Método no permitido.', 405);
    $data = [];
    if ($method === 'POST') {
        if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) fail('La sesión cambió. Recarga la página.', 403);
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) fail('Solicitud JSON inválida.');
    }
    if ($action === 'session') respond(['user'=>currentUser(), 'csrf'=>$_SESSION['csrf']]);
    if ($action === 'register' || $action === 'login') {
        $email = strtolower(textField($data, 'email', 150, true));
        $password = $data['password'] ?? '';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !is_string($password) || $password === '' || strlen($password) > 72 || strpos($password, "\0") !== false) fail('Introduce un correo y una contraseña válidos (máximo 72 bytes).');
        if ($action === 'register') {
            $name = textField($data, 'name', 100, true);
            if (strlen($password) < 6) fail('La contraseña debe tener al menos 6 caracteres.');
            try {
                query('INSERT INTO usuarios (nombre, correo, password_hash) VALUES (?, ?, ?)', [$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
            } catch (PDOException $e) {
                if (($e->errorInfo[1] ?? 0) === 1062) fail('Este correo ya está registrado.', 409);
                throw $e;
            }
            $id = (int)db()->lastInsertId();
        } else {
            $u = query('SELECT id_usuario, password_hash FROM usuarios WHERE correo = ?', [$email])->fetch();
            if (!$u || !password_verify($password, $u['password_hash'])) fail('Correo o contraseña incorrectos.', 401);
            $id = (int)$u['id_usuario'];
        }
        session_regenerate_id(true);
        $_SESSION['id_usuario'] = $id;
        respond(currentUser());
    }
    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        respond(true);
    }
    $user = currentUser();
    if (!$user) fail('Inicia sesión para continuar.', 401);
    $uid = $user['id'];
    if ($action === 'saveAvatar') {
        $value = imageValue($data['value'] ?? '');
        query('UPDATE usuarios SET foto_perfil = ? WHERE id_usuario = ?', [$value, $uid]);
        respond(currentUser());
    }
    if ($action === 'saveCompany') {
        $name = textField($data, 'name', 150, true);
        $sector = textField($data, 'sector', 150, true);
        $city = textField($data, 'city', 200);
        $offer = textField($data, 'offer', 1500, true);
        $audience = textField($data, 'audience', 1500, true);
        $value = textField($data, 'differentiator', 1500);
        $tone = textField($data, 'tone', 100, true);
        $goal = textField($data, 'goal', 150);
        $channels = $data['channels'] ?? [];
        $allowed = ['Facebook', 'Instagram', 'TikTok', 'WhatsApp', 'Email'];
        if (!is_array($channels) || !$channels) fail('Selecciona al menos un canal.');
        foreach ($channels as $channel) if (!in_array($channel, $allowed, true)) fail('Canal inválido.');
        $channels = implode(', ', array_unique($channels));
        $pdo = db();
        $pdo->beginTransaction();
        try {
            // Serializa los guardados de una misma cuenta, incluidos dobles clics.
            query('SELECT id_usuario FROM usuarios WHERE id_usuario = ? FOR UPDATE', [$uid]);
            $existing = query('SELECT id_empresa FROM empresas WHERE id_usuario = ?', [$uid])->fetch();
            if ($existing) {
                $eid = (int)$existing['id_empresa'];
                query('UPDATE empresas SET nombre_comercial=?, actividad_economica=?, descripcion=?, ubicacion=? WHERE id_empresa=?', [$name,$sector,$offer,$city,$eid]);
            } else {
                query('INSERT INTO empresas (id_usuario,nombre_comercial,actividad_economica,descripcion,ubicacion) VALUES (?,?,?,?,?)', [$uid,$name,$sector,$offer,$city]);
                $eid = (int)$pdo->lastInsertId();
            }
            query('INSERT INTO identidades_marca (id_empresa,tono_comunicacion,propuesta_valor,objetivo_principal,canales_preferidos) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE tono_comunicacion=?,propuesta_valor=?,objetivo_principal=?,canales_preferidos=?', [$eid,$tone,$value,$goal,$channels,$tone,$value,$goal,$channels]);
            $public = query("SELECT id_publico FROM publicos_objetivo WHERE id_empresa=? AND nombre_segmento='General' ORDER BY id_publico LIMIT 1", [$eid])->fetch();
            if ($public) query('UPDATE publicos_objetivo SET descripcion_perfil=? WHERE id_publico=?', [$audience,$public['id_publico']]);
            else query("INSERT INTO publicos_objetivo (id_empresa,nombre_segmento,descripcion_perfil) VALUES (?,'General',?)", [$eid,$audience]);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }
        respond(company($uid));
    }
    $company = company($uid);
    if ($action === 'company') respond($company);
    if ($action === 'posts') respond($company ? posts($company['id']) : []);
    if ($action === 'export') respond(['user'=>$user,'company'=>$company,'posts'=>$company ? posts($company['id']) : []]);
    if (!$company) fail('Completa primero el formulario de empresa.');
    $eid = $company['id'];
    if ($action === 'deletePost') {
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
        if (!$id) fail('Identificador inválido.');
        $s = query('DELETE FROM contenidos_generados WHERE id_contenido=? AND id_empresa=?', [$id,$eid]);
        if (!$s->rowCount()) fail('Publicación no encontrada.', 404);
        respond(true);
    }
    if ($action === 'savePost') {
        $text = textField($data,'text',20000,true);
        $channel = textField($data,'channel',50,true);
        if (!in_array($channel, ['Facebook','Instagram','TikTok','WhatsApp','Email'], true)) fail('Canal inválido.');
        $context = json_encode(['topic'=>textField($data,'topic',600),'objective'=>textField($data,'objective',160),'updatedAt'=>gmdate('c')], JSON_UNESCAPED_UNICODE);
        $status = $data['status'] ?? 'draft';
        if (!in_array($status, ['draft','approved'], true)) fail('Estado inválido.');
        $status = $status === 'approved' ? 'Aprobado' : 'Borrador';
        $id = $data['id'] ?? null;
        $old = null;
        if ($id !== null) {
            $id = filter_var($id, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
            if (!$id) fail('Identificador inválido.');
            $old = query('SELECT imagen_generada_url FROM contenidos_generados WHERE id_contenido=? AND id_empresa=?', [$id,$eid])->fetch();
            if (!$old) fail('Publicación no encontrada.', 404);
        }
        $image = array_key_exists('image',$data) ? imageValue($data['image']) : ($old['imagen_generada_url'] ?? '');
        if ($id) query('UPDATE contenidos_generados SET canal_referencia=?,contexto_prompt=?,texto_generado=?,imagen_generada_url=?,estado=? WHERE id_contenido=? AND id_empresa=?', [$channel,$context,$text,$image,$status,$id,$eid]);
        else {
            query("INSERT INTO contenidos_generados (id_empresa,canal_referencia,tipo_contenido,contexto_prompt,texto_generado,imagen_generada_url,estado) VALUES (?,?,'Publicación',?,?,?,?)", [$eid,$channel,$context,$text,$image,$status]);
            $id = (int)db()->lastInsertId();
        }
        foreach (posts($eid) as $post) if ($post['id'] === $id) respond($post);
    }
} catch (Throwable $e) {
    error_log('ContentAI: ' . $e->getMessage());
    fail('No se pudo completar la operación en MySQL. Revisa la conexión, importa el esquema y ejecuta database/upgrade.sql. Consulta el registro de PHP para más detalles.', 500);
}
