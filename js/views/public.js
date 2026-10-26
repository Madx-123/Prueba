import { socialIcon, DEMO_IMAGE } from '../ui/media.js';
import { CHANNELS } from '../data/seed.js';
import { icon } from '../ui/icons.js';
import { escapeHtml } from '../core/utils.js';
const brand = `<span class="brand-mark">${icon('sparkles',22)}</span><span class="brand-name">content<span>ai</span><small>PYMES</small></span>`;
export function brandLogo() { return brand; }

export function landingView() {
  return `<div class="public-shell" id="main-content">
    <header class="public-header container">
      <button class="logo-button" data-action="go" data-view="landing" aria-label="ContentAI inicio">${brand}</button>
      <nav class="public-nav" aria-label="Secciones"><a href="#funciones">Funcionalidades</a><a href="#canales">Canales</a><a href="#proceso">Cómo funciona</a><a href="#vista">Vista previa</a></nav>
      <div class="public-actions"><button class="btn btn-ghost" data-action="go" data-view="login">Iniciar sesión</button><button class="btn btn-primary" data-action="go" data-view="register">Comenzar gratis ${icon('arrow',17)}</button></div>
    </header>
    <main>
      <section class="hero container">
        <div class="hero-copy entrance"><span class="eyebrow">${icon('sparkles',15)} CREATIVIDAD PARA NEGOCIOS REALES</span>
        <h1>Tu próxima gran publicación <em>empieza aquí.</em></h1>
        <p>Planifica, redacta y visualiza contenido comercial para tu PYME desde un espacio de trabajo simple, organizado y agradable.</p>
        <div class="hero-cta"><button class="btn btn-primary btn-xl" data-action="go" data-view="register">Crear mi espacio ${icon('arrow',19)}</button><button class="btn btn-outline btn-xl" data-action="demo-login">Explorar la demo ${icon('eye',19)}</button></div>
        <div class="hero-proof"><span class="proof-dot">${icon('check',13)}</span> Registro guiado <span class="proof-sep"></span><span class="proof-dot">${icon('check',13)}</span> Vista previa por canal <span class="proof-sep"></span><span class="proof-dot">${icon('check',13)}</span> Sin instalación</div>
        </div>
        <div class="hero-visual entrance delay-1" aria-label="Ejemplo visual del generador ContentAI">
          <div class="hero-app-window"><div class="hero-app-top"><span class="brand-mark mini">${icon('sparkles',13)}</span><b>Espacio creativo</b><span class="hero-dots"><i></i><i></i><i></i></span></div>
            <div class="hero-app-body"><div class="hero-mock-side"><span class="mock-nav active">${icon('home',16)}</span><span class="mock-nav">${icon('wand',16)}</span><span class="mock-nav">${icon('library',16)}</span></div>
            <div class="hero-mock-center"><span class="eyebrow small">NUEVA CAMPAÑA</span><h3>Diseña mensajes que conecten.</h3><div class="mock-field"><span>¿Qué quieres comunicar?</span><strong>Conoce nuestro nuevo producto artesanal…</strong></div><div class="mock-platforms"><span>${icon('facebook',14)} Facebook</span><span>${icon('instagram',14)} Instagram</span></div><div class="mock-generate">${icon('sparkles',16)} Generar una propuesta</div></div>
            <div class="hero-mock-preview"><div class="mini-social-head"><span class="mini-avatar">LC</span><div><b>Café La Cumbre</b><small>Contenido de demostración</small></div></div><div class="mini-social-lines"><strong>☕ Una idea para compartir</strong><span>Productos hechos con cariño, cerca de ti.</span><span>Descubre el sabor de nuestra comunidad.</span></div><div class="mini-social-image">${icon('store',50)}<b>Tu marca, en primer plano.</b></div><div class="mini-social-actions">♡ Me gusta　 ◻ Comentar　 ↗ Compartir</div></div></div>
          </div><div class="floating-note">${icon('check',17)} Vista previa al instante</div>
        </div>
      </section>
      <section class="features-section" id="funciones"><div class="container"><div class="section-heading"><span class="eyebrow">UN ESPACIO, TODO TU CONTENIDO</span><h2>Menos complicaciones. <span>Más claridad.</span></h2><p>Las herramientas esenciales para preparar y organizar publicaciones en cada canal.</p></div>
        <div class="feature-grid"><article class="feature-card"><div class="feature-icon lavender">${icon('wand',24)}</div><h3>Generador de demostración</h3><p>Construye borradores a partir del objetivo, el canal y la descripción de tu campaña.</p></article>
        <article class="feature-card"><div class="feature-icon blue">${icon('smartphone',24)}</div><h3>Previsualización realista</h3><p>Descubre cómo se verá tu texto en maquetas de cinco plataformas diferentes.</p></article>
        <article class="feature-card"><div class="feature-icon mint">${icon('library',24)}</div><h3>Biblioteca organizada</h3><p>Guarda borradores, aprueba ideas, busca contenido y retoma publicaciones anteriores.</p></article></div></div></section>
      <section class="channel-showcase container" id="canales"><div class="showcase-intro"><span class="eyebrow">UNA IDEA. MUCHAS FORMAS DE CONECTAR.</span><h2>Tu contenido, en el idioma<br>de cada comunidad.</h2><p>Transforma lo que hace especial a tu negocio en publicaciones, guiones y mensajes para Facebook, Instagram, TikTok, WhatsApp y Email. Crea una propuesta, hazla tuya y visualízala antes de compartirla.</p><button class="btn btn-primary" data-action="go" data-view="register">Encontrar mi próxima idea ${icon('arrow',18)}</button></div><div class="channel-showcase-grid">${CHANNELS.map((c,i)=>`<article class="showcase-card showcase-card--${c.id.toLowerCase()}"><div class="showcase-card-head">${socialIcon(c.id)}<div><strong>${c.label}</strong><small>${['Publicación','Post visual','Guion de video','Mensaje comercial','Campaña de correo'][i]}</small></div></div><div class="showcase-art"><img src="${DEMO_IMAGE}" alt="${'Café y croissant artesanal: ejemplo de contenido para '+c.label}" loading="lazy">${`<div class="showcase-caption"><small>CAFÉ LA CUMBRE</small><strong>${['El sabor de estar cerca.','Tus mañanas merecen esto.','Una historia en cada taza.','Una pausa, un buen café.','Una pausa para inspirarte.'][i]}</strong></div>`}${i===2?'<span class="showcase-play" aria-hidden="true">▶</span>':''}</div><div class="showcase-bottom">${i===4?'<span class="sample-email-cta">Descubre nuestras novedades</span>':i===3?'<span>Un mensaje que se siente cercano. ♡</span>':`${icon('heart',16)} ${icon('messagecircle',16)} <span>Hecho para tu comunidad</span>`}</div></article>`).join('')}</div><p class="showcase-note">Ejemplos visuales de contenido · Tú revisas y decides qué compartir.</p></section>
      <section class="steps-section container" id="proceso"><div class="section-heading left"><span class="eyebrow">EN POCOS PASOS</span><h2>De tu negocio a una publicación.</h2></div><div class="steps-grid"><div class="step-card"><span>01</span><h3>Crea tu perfil</h3><p>Cuéntanos qué ofrece tu empresa, a quién se dirige y cómo comunica.</p></div><div class="step-card"><span>02</span><h3>Describe tu idea</h3><p>Selecciona el objetivo comercial, el canal y el tema de tu campaña.</p></div><div class="step-card"><span>03</span><h3>Revisa y organiza</h3><p>Edita el texto, observa la vista previa y guárdalo en tu biblioteca.</p></div></div></section>
      <section class="final-cta container" id="vista"><div><span class="eyebrow">TODO LISTO PARA CREAR</span><h2>Tu marca tiene mucho que contar.</h2><p>Empieza con una cuenta de demostración y organiza tus primeras ideas.</p></div><button class="btn btn-light btn-xl" data-action="go" data-view="register">Empezar ahora ${icon('arrow',18)}</button></section>
    </main><footer class="public-footer container"><span class="brand-name">content<span>ai</span> <small>PYMES</small></span><span>Prototipo frontend · Datos de demostración · 2026</span><span>Diseñado para aprender, crear y evolucionar.</span></footer></div>`;
}

export function authView(mode='login') {
  const registering = mode === 'register';
  return `<div class="auth-shell" id="main-content"><div class="auth-aside">
    <button class="logo-button auth-logo" data-action="go" data-view="landing">${brand}</button>
    <div class="auth-aside-content"><span class="eyebrow light">${icon('sparkles',15)} TU ESPACIO PARA CREAR</span><h2>Las buenas ideas merecen <em>ser compartidas.</em></h2><p>Construye una identidad comercial coherente y revisa cada publicación antes de compartirla con el mundo.</p><div class="auth-quote"><span class="quote-stars">✦ ✦ ✦</span><p>Una plataforma para que el contenido de tu negocio se sienta como tu propia marca.</p><small>CONTENTAI PYMES · DEMOSTRACIÓN</small></div></div>
    <div class="auth-aside-bottom">© 2026 ContentAI PYMES <span>Frontend interactivo</span></div>
  </div><main class="auth-main"><div class="auth-mobile-logo">${brand}</div><div class="auth-box entrance">
    <button class="text-back" data-action="go" data-view="landing">${icon('back',16)} Volver al inicio</button>
    <span class="auth-kicker">${registering ? 'EMPECEMOS' : 'BIENVENIDO DE NUEVO'}</span><h1>${registering ? 'Crea tu espacio.' : 'Qué bueno verte.'}</h1><p class="auth-description">${registering ? 'En unos pasos podrás configurar tu empresa y comenzar a crear.' : 'Accede a tu espacio creativo y continúa donde lo dejaste.'}</p>
    <div class="auth-switch" role="group" aria-label="Acceso"><button class="${registering?'':'selected'}" data-action="go" data-view="login">Iniciar sesión</button><button class="${registering?'selected':''}" data-action="go" data-view="register">Crear cuenta</button></div>
    <form id="auth-form" data-form="${registering?'register':'login'}" novalidate>
${registering ? `<label class="field-label" for="auth-name">Nombre completo</label><div class="input-wrap">${icon('user',18)}<input id="auth-name" name="nombre" autocomplete="name" placeholder="Tu nombre" maxlength="100" required></div>`:''}
      <label class="field-label" for="auth-email">Correo electrónico</label><div class="input-wrap">${icon('mail',18)}<input id="auth-email" type="email" name="correo" autocomplete="email" placeholder="nombre@empresa.com" required></div>
      <label class="field-label" for="auth-password">Contraseña ${registering?'<span class="muted">· mínimo 6 caracteres</span>':''}</label><div class="input-wrap">${icon('shield',18)}<input id="auth-password" type="password" name="password" autocomplete="${registering?'new-password':'current-password'}" placeholder="••••••••" ${registering?'minlength="6"':''} required><button class="reveal-pass" type="button" data-action="toggle-password" aria-label="Mostrar contraseña">${icon('eye',18)}</button></div>
      <button class="btn btn-primary btn-full btn-lg" type="submit">${registering ? 'Crear cuenta y continuar' : 'Entrar a mi espacio'} ${icon('arrow',18)}</button>
    </form><div class="demo-notice">${icon('info',18)} <div><strong>Modo demostración</strong><p>El registro y el inicio de sesión utilizan PHP y MySQL. La cuenta de prueba funciona por separado en este navegador.</p></div></div>
    ${!registering ? `<button class="demo-access" data-action="demo-login">${icon('zap',17)} Entrar con la cuenta de prueba <span>demo@contentai.pe</span></button>` : '<p class="auth-footnote">Después del registro te guiaremos para configurar tu empresa.</p>'}
  </div></main></div>`;
}

export function dashboardView() {
  return `<div class="dashboard-shell" style="padding: 50px 20px; text-align: center; min-height: 100vh; background: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <span style="font-size: 40px;">🚀</span>
      <h1 style="color: #4f46e5; margin: 20px 0;">¡Bienvenido a tu espacio!</h1>
      <p style="color: #666; font-size: 18px; margin-bottom: 30px;">Tu sesión ha iniciado correctamente. Aquí construiremos el panel de ContentAI.</p>
      <button class="btn btn-outline" data-action="go" data-view="landing">Cerrar sesión (Volver al inicio)</button>
    </div>
  </div>`;
}