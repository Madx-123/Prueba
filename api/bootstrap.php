<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
ini_set('display_errors', '0');
ini_set('session.use_strict_mode', '1');
session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off']);
session_start();
if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));

function respond($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
function fail($message, $status = 422) { respond(['error' => $message], $status); }
function db() {
    static $pdo;
    if ($pdo) return $pdo;
    $file = __DIR__ . '/config.local.php';
    if (!is_file($file)) fail('Configura api/config.local.php con los datos de tu servidor MySQL.', 503);
    $c = require $file;
    $pdo = new PDO("mysql:host={$c['host']};port={$c['port']};dbname={$c['database']};charset=utf8mb4", $c['user'], $c['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    return $pdo;
}
function query($sql, $values = []) { $s = db()->prepare($sql); $s->execute($values); return $s; }
function currentUser() {
    if (empty($_SESSION['id_usuario'])) return null;
    $u = query('SELECT id_usuario, nombre, correo, foto_perfil, fecha_creacion FROM usuarios WHERE id_usuario = ?', [$_SESSION['id_usuario']])->fetch();
    return $u ? ['id'=>(int)$u['id_usuario'], 'name'=>$u['nombre'], 'email'=>$u['correo'], 'avatar'=>$u['foto_perfil'] ?? '', 'createdAt'=>$u['fecha_creacion']] : null;
}
function textField($data, $key, $max, $required = false) {
    $v = $data[$key] ?? '';
    if (!is_string($v)) fail('Campo inválido: ' . $key);
    $v = trim($v);
    $length = preg_match_all('/./us', $v);
    if ($length === false || $length > $max || ($required && $v === '')) fail('Revisa el campo ' . $key . ' (máximo ' . $max . ' caracteres).');
    return $v;
}
function imageValue($value) {
    if (!is_string($value) || strlen($value) > 1500000) fail('La imagen es demasiado grande.');
    if ($value === '') return '';
    if (!preg_match('~^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$~D', $value, $m)) fail('Formato de imagen inválido.');
    $raw = base64_decode($m[2], true);
    $info = $raw === false ? false : @getimagesizefromstring($raw);
    if (!$info || $info['mime'] !== 'image/' . $m[1]) fail('El archivo no es una imagen válida.');
    return $value;
}
function company($userId) {
    $e = query('SELECT * FROM empresas WHERE id_usuario = ?', [$userId])->fetch();
    if (!$e) return null;
    $i = query('SELECT * FROM identidades_marca WHERE id_empresa = ?', [$e['id_empresa']])->fetch() ?: [];
    $p = query("SELECT descripcion_perfil FROM publicos_objetivo WHERE id_empresa = ? AND nombre_segmento = 'General' ORDER BY id_publico LIMIT 1", [$e['id_empresa']])->fetch();
    // Compatibilidad de lectura con empresas guardadas por la versión anterior.
    $legacy = json_decode($e['descripcion'] ?? '', true);
    $legacy = is_array($legacy) && isset($legacy['productos']) ? $legacy : [];
    $channels = $i['canales_preferidos'] ?? ($legacy['canales'] ?? '');
    if (!is_array($channels)) $channels = array_values(array_filter(array_map('trim', explode(',', $channels))));
    return ['id'=>(int)$e['id_empresa'], 'userId'=>(int)$e['id_usuario'], 'name'=>$e['nombre_comercial'], 'sector'=>$e['actividad_economica'], 'city'=>$e['ubicacion'] ?? '', 'offer'=>$legacy['productos'] ?? ($e['descripcion'] ?? ''), 'audience'=>$p['descripcion_perfil'] ?? ($legacy['clientes'] ?? ''), 'differentiator'=>$i['propuesta_valor'] ?? ($legacy['diferencia'] ?? ''), 'tone'=>$i['tono_comunicacion'] ?? ($legacy['tono'] ?? ''), 'goal'=>$i['objetivo_principal'] ?? ($legacy['objetivo'] ?? ''), 'channels'=>$channels];
}
function posts($companyId) {
    $rows = query('SELECT * FROM contenidos_generados WHERE id_empresa = ? ORDER BY fecha_generacion DESC, id_contenido DESC', [$companyId])->fetchAll();
    return array_map(function ($r) {
        $context = json_decode($r['contexto_prompt'], true);
        if (!is_array($context)) $context = ['topic'=>$r['contexto_prompt']];
        return ['id'=>(int)$r['id_contenido'], 'companyId'=>(int)$r['id_empresa'], 'channel'=>$r['canal_referencia'], 'objective'=>$context['objective'] ?? '', 'topic'=>$context['topic'] ?? '', 'text'=>$r['texto_generado'], 'image'=>$r['imagen_generada_url'] ?? '', 'status'=>$r['estado'] === 'Aprobado' ? 'approved' : 'draft', 'createdAt'=>$r['fecha_generacion'], 'updatedAt'=>$context['updatedAt'] ?? $r['fecha_generacion']];
    }, $rows);
}
