import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCopy } from '../frontend/js/modules/creator/engine.js';
import { previewView } from '../frontend/js/modules/creator/previews.js';
import { escapeHtml } from '../frontend/js/core/utils.js';
import { ApiClient } from '../frontend/js/core/ApiClient.js';

const company = { name: 'Café Santa', sector: 'Cafetería', tone: 'Cercano y amigable' };

test('motor genera contenido contextual por plataforma', () => {
  const data = { channel: 'Facebook', objective: 'Aumentar las ventas', topic: 'Café de hoy' };
  const a = buildCopy(data, company, 0);
  const b = buildCopy(data, company, 1);
  assert.match(a, /Café de hoy/);
  assert.match(a, /Café Santa/);
  assert.notEqual(a, b);
});

test('vista previa escapa entrada HTML de usuario', () => {
  const html = previewView('Facebook', '<script>alert(1)</script>', company);
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.equal(escapeHtml('<b>hola</b>'), '&lt;b&gt;hola&lt;/b&gt;');
});

test('cliente API construye ruta relativa y envía datos', async () => {
  const previousFetch = globalThis.fetch;
  let address = '';
  let requested = null;
  try {
    globalThis.fetch = async (url, options) => {
      address = url;
      requested = options;
      return { ok: true, status: 200, text: async () => '{"status":"success"}' };
    };
    const result = await ApiClient.register('Ana', 'ana@example.com', 'pass123');
    assert.equal(result.status, 'success');
    assert.match(address, /\/backend\/index\.php\?route=%2Fregistro$/);
    assert.equal(requested.credentials, 'same-origin');
    assert.equal(requested.body.get('correo'), 'ana@example.com');
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('cliente API reporta fallo HTTP con JSON del backend', async () => {
  const previousFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 401, text: async () => '{"status":"error","message":"Sesión expirada"}' });
    await assert.rejects(() => ApiClient.getCompany(), /Sesión expirada/);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
