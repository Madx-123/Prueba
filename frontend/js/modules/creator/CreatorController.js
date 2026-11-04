import { appRouter } from '../../app.js';
import { ApiClient } from '../../core/ApiClient.js';
import { escapeHtml as h, toHandle } from '../../core/utils.js';
import { notify } from '../../ui/toast.js';
import { buildCopy } from './engine.js';
import { previewView } from './previews.js';

export default class CreatorController {
  constructor(container) {
    this.container = container;
    this.companyData = null;
    this.currentChannel = 'Facebook';
    this.variantCount = 0;
    this.currentImage = '';
    this.currentImagePrompt = '';
    this.currentImageStyle = 'dark';

    this.init();
  }

  async init() {
    try {
      const response = await ApiClient.request('/empresa', 'GET');
      if (!response.company) {
        notify('Primero debes configurar los datos de tu empresa.', 'info');
        appRouter.navigate('/onboarding');
        return;
      }

      this.companyData = response.company;
      this.container.querySelector('#display-tone').textContent = this.companyData.tone;

      this.bindEvents();
      this.updateCounters();
      this.renderVariantsComparison();
      this.updatePreview();
    } catch (error) {
      console.error('Error al cargar datos del estudio IA:', error);
    }
  }

  switchPanel(panelId) {
    this.container.querySelectorAll('.ws-tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panelTarget === panelId);
    });
    this.container.querySelectorAll('.ws-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === panelId);
    });
    if (panelId === 'panel-variants') {
      this.renderVariantsComparison();
    }
  }

  bindEvents() {
    // 1. Menú de navegación izquierdo del Estudio (4 módulos)
    this.container.querySelectorAll('.ws-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchPanel(btn.dataset.panelTarget));
    });

    // 2. Selector superior de plataforma
    this.container.querySelectorAll('#channel-picker .platform-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.container.querySelectorAll('#channel-picker .platform-button').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentChannel = e.currentTarget.dataset.channel;
        this.container.querySelector('#preview-active-channel').textContent = this.currentChannel;
        this.renderVariantsComparison();
        this.updatePreview();
      });
    });

    // 3. Plantillas rápidas de inspiración
    this.container.querySelectorAll('[data-idea]').forEach(chip => {
      chip.addEventListener('click', () => {
        this.container.querySelector('#input-topic').value = chip.dataset.idea;
        this.updateCounters();
        this.generateText();
      });
    });

    // 4. Generar copy principal y abrir comparador A/B/C
    this.container.querySelector('#btn-generate').addEventListener('click', () => {
      this.generateText();
      notify(`Copy generado para ${this.currentChannel}.`, 'success');
    });

    this.container.querySelector('#btn-quick-variants').addEventListener('click', () => {
      const topicInput = this.container.querySelector('#input-topic');
      if (!topicInput.value.trim()) {
        topicInput.value = `Conoce la propuesta de ${this.companyData.name}: ${this.companyData.offer}`;
        this.updateCounters();
      }
      this.switchPanel('panel-variants');
      notify('3 variantes generadas para comparar.', 'success');
    });

    this.container.querySelector('#btn-refresh-variants').addEventListener('click', () => {
      this.variantCount++;
      this.renderVariantsComparison();
      notify('Variantes actualizadas.', 'info');
    });

    // 5. Utilidades del editor en vivo
    const inputText = this.container.querySelector('#input-text');
    const inputTopic = this.container.querySelector('#input-topic');

    inputText.addEventListener('input', () => {
      this.updateCounters();
      this.updatePreview();
    });

    inputTopic.addEventListener('input', () => this.updateCounters());

    this.container.querySelector('#btn-variant').addEventListener('click', () => {
      this.variantCount++;
      this.generateText();
      notify('Se aplicó otra variante.', 'info');
    });

    this.container.querySelector('#btn-clear').addEventListener('click', () => {
      inputText.value = '';
      this.updateCounters();
      this.updatePreview();
    });

    this.container.querySelector('#btn-copy').addEventListener('click', async () => {
      const value = inputText.value;
      if (!value.trim()) {
        notify('No hay texto para copiar.', 'error');
        return;
      }
      try {
        await navigator.clipboard.writeText(value);
        notify('Texto copiado al portapapeles.', 'success');
      } catch {
        inputText.select();
        notify('Texto seleccionado; presiona Ctrl+C para copiar.', 'info');
      }
    });

    // 6. Botones de formato funcionales (Negrita, Hashtags, CTA)
    this.container.querySelector('#btn-insert-bold').addEventListener('click', () => {
      const start = inputText.selectionStart;
      const end = inputText.selectionEnd;
      const val = inputText.value;
      if (start !== end) {
        const selected = val.substring(start, end);
        inputText.value = val.substring(0, start) + `**${selected}**` + val.substring(end);
      } else {
        inputText.value = val + (val ? '\n' : '') + '**Texto destacado**';
      }
      this.updateCounters();
      this.updatePreview();
    });

    this.container.querySelector('#btn-insert-tags').addEventListener('click', () => {
      const handle = toHandle(this.companyData?.name || 'MiNegocio');
      const sectorTag = toHandle(this.companyData?.sector || 'PYMES');
      const tags = `\n\n#${handle} #${sectorTag} #Calidad #NegocioLocal`;
      if (!inputText.value.includes(`#${handle}`)) {
        inputText.value = inputText.value.trimEnd() + tags;
        this.updateCounters();
        this.updatePreview();
        notify('Hashtags de marca añadidos.', 'success');
      } else {
        notify('Los hashtags de tu marca ya están en el texto.', 'info');
      }
    });

    this.container.querySelector('#btn-insert-cta').addEventListener('click', () => {
      const cta = `\n\nEscríbenos por mensaje directo para brindarte atención personalizada.`;
      inputText.value = inputText.value.trimEnd() + cta;
      this.updateCounters();
      this.updatePreview();
      notify('Llamada a la acción insertada.', 'success');
    });

    // 7. Estudio de Imagen IA: Estilos, Generador SVG y Subida Local
    this.container.querySelectorAll('[data-img-style]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('[data-img-style]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentImageStyle = btn.dataset.imgStyle;
        if (this.currentImage.startsWith('data:image/svg+xml')) {
          const promptText = this.container.querySelector('#input-image-prompt').value.trim() || this.companyData.name;
          this.currentImage = this.buildAiVisualDataUri(promptText, this.currentImageStyle);
          this.updatePreview();
        }
      });
    });

    const promptInput = this.container.querySelector('#input-image-prompt');
    const removeImgBtn = this.container.querySelector('#btn-remove-image');

    this.container.querySelector('#btn-generate-image').addEventListener('click', () => {
      const promptText = promptInput.value.trim() || this.container.querySelector('#input-topic').value.trim() || this.companyData.offer || this.companyData.name;
      this.currentImagePrompt = promptText;
      this.currentImage = this.buildAiVisualDataUri(promptText, this.currentImageStyle);
      removeImgBtn.style.display = 'inline-flex';
      this.updatePreview();
      notify('Arte visual generado en el simulador.', 'success');
    });

    this.container.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset === 'editorial') {
          this.currentImage = './assets/images/cafe-editorial.jpg';
          this.currentImagePrompt = 'Fotografía editorial de producto';
        } else {
          this.currentImage = './assets/images/community.svg';
          this.currentImagePrompt = 'Arte gráfico de comunidad';
        }
        promptInput.value = this.currentImagePrompt;
        removeImgBtn.style.display = 'inline-flex';
        this.updatePreview();
        notify('Imagen aplicada al simulador.', 'success');
      });
    });

    this.container.querySelector('#input-upload-image').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.currentImage = String(ev.target?.result || '');
        this.currentImagePrompt = `Imagen subida: ${file.name}`;
        removeImgBtn.style.display = 'inline-flex';
        this.updatePreview();
        notify('Fotografía cargada en el simulador.', 'success');
      };
      reader.readAsDataURL(file);
    });

    removeImgBtn.addEventListener('click', () => {
      this.currentImage = '';
      this.currentImagePrompt = '';
      removeImgBtn.style.display = 'none';
      this.updatePreview();
      notify('Imagen removida de la publicación.', 'info');
    });

    // 8. Transformaciones rápidas en el Módulo 04 (Editor Avanzado)
    this.container.querySelectorAll('[data-transform]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.transform;
        const topic = this.container.querySelector('#input-topic').value.trim() || this.companyData.offer;
        const brand = this.companyData.name;
        const handle = toHandle(brand);

        if (mode === 'directo') {
          inputText.value = `**${topic}**\n\nEn ${brand} tenemos todo listo para atenderte con la calidad que buscas.\n\nEscríbenos hoy mismo.\n\n#${handle} #PYMES`;
        } else if (mode === 'storytelling') {
          inputText.value = `Cada detalle cuenta cuando pensamos en nuestros clientes.\n\n**${topic}**\n\nEn ${brand} trabajamos cada día para ofrecerte ${this.companyData.differentiator || 'una experiencia única'}. Cuéntanos en los comentarios qué te parece.\n\n#${handle} #Comunidad`;
        } else {
          inputText.value = `Disponibilidad limitada en ${brand}.\n\n**${topic}**\n\nReserva o solicita más información enviándonos un mensaje directo ahora.\n\n#${handle} #Promocion`;
        }
        this.updateCounters();
        this.updatePreview();
        this.switchPanel('panel-copy');
        notify('Estructura de texto aplicada.', 'success');
      });
    });

    // 9. Guardar en Base de Datos
    this.container.querySelector('#btn-save-draft').addEventListener('click', () => this.savePost('draft'));
    this.container.querySelector('#btn-save-approved').addEventListener('click', () => this.savePost('approved'));
  }

  renderVariantsComparison() {
    const container = this.container.querySelector('#variants-list-container');
    if (!container || !this.companyData) return;

    const topic = this.container.querySelector('#input-topic').value.trim() || `Conoce lo mejor de ${this.companyData.name}: ${this.companyData.offer}`;
    const objective = this.container.querySelector('#input-objective').value;

    const labels = [
      { badge: 'VARIANTE A · COMERCIAL', desc: 'Equilibrio entre presentación y llamada a la acción' },
      { badge: 'VARIANTE B · DINÁMICA', desc: 'Enfoque directo para captar la atención rápido' },
      { badge: 'VARIANTE C · CERCANA', desc: 'Centrada en la propuesta de valor de tu negocio' }
    ];

    const variants = [
      buildCopy({ channel: this.currentChannel, objective, topic }, this.companyData, this.variantCount),
      buildCopy({ channel: this.currentChannel, objective, topic }, this.companyData, this.variantCount + 1),
      `**${topic}**\n\nEn ${this.companyData.name} nos enfocamos en brindarte ${this.companyData.differentiator || this.companyData.offer}.\n\nContáctanos para asesorarte hoy mismo.\n\n#${toHandle(this.companyData.name)} #PYMES`
    ];

    container.innerHTML = variants.map((vText, idx) => `
      <article class="ws-variant-card">
        <div class="ws-variant-top">
          <span>${labels[idx].badge}</span>
          <small>${labels[idx].desc}</small>
        </div>
        <pre class="ws-variant-body">${h(vText)}</pre>
        <button type="button" class="ws-use-variant-btn" data-variant-index="${idx}">
          Usar esta propuesta en el editor →
        </button>
      </article>
    `).join('');

    container.querySelectorAll('.ws-use-variant-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.variantIndex);
        this.container.querySelector('#input-text').value = variants[idx];
        this.updateCounters();
        this.updatePreview();
        this.switchPanel('panel-copy');
        notify(`Variante ${['A', 'B', 'C'][idx]} enviada al editor.`, 'success');
      });
    });
  }

  buildAiVisualDataUri(promptText, style = 'dark') {
    const brand = (this.companyData?.name || 'ContentAI').replace(/[<>&"']/g, '');
    const sector = (this.companyData?.sector || 'PYMES').replace(/[<>&"']/g, '');
    const cleanPrompt = String(promptText).replace(/[<>&"']/g, '');
    const line1 = cleanPrompt.slice(0, 28);
    const line2 = cleanPrompt.slice(28, 56);

    const palettes = {
      dark: { bg1: '#111317', bg2: '#1f242d', accent: '#d7e86b', text: '#ffffff', sub: '#9ca3af', btnBg: '#ffffff', btnInk: '#111317' },
      editorial: { bg1: '#f5f6f1', bg2: '#e9f0dc', accent: '#3767ec', text: '#111317', sub: '#525866', btnBg: '#111317', btnInk: '#ffffff' },
      Cobalt: { bg1: '#1d4ed8', bg2: '#1e3a8a', accent: '#d7e86b', text: '#ffffff', sub: '#dbeafe', btnBg: '#d7e86b', btnInk: '#111317' }
    };
    const p = palettes[style] || palettes.dark;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${p.bg1}"/>
          <stop offset="100%" stop-color="${p.bg2}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#g)"/>
      <circle cx="690" cy="120" r="190" fill="${p.accent}" opacity="0.16"/>
      <rect x="64" y="64" width="672" height="672" rx="34" fill="none" stroke="${p.text}" stroke-opacity="0.14" stroke-width="2"/>
      <text x="105" y="145" fill="${p.accent}" font-family="Arial, sans-serif" font-size="21" font-weight="bold" letter-spacing="4">${brand.toUpperCase()}</text>
      <text x="105" y="370" fill="${p.text}" font-family="Georgia, serif" font-size="52">${line1}</text>
      <text x="105" y="435" fill="${p.text}" font-family="Georgia, serif" font-size="52">${line2}</text>
      <text x="105" y="510" fill="${p.sub}" font-family="Arial, sans-serif" font-size="22">${sector} · ${this.companyData?.city || 'Atención personalizada'}</text>
      <rect x="105" y="605" width="240" height="58" rx="29" fill="${p.btnBg}"/>
      <text x="225" y="641" text-anchor="middle" fill="${p.btnInk}" font-family="Arial, sans-serif" font-size="19" font-weight="bold">Conoce más →</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  updateCounters() {
    const topic = this.container.querySelector('#input-topic')?.value || '';
    const text = this.container.querySelector('#input-text')?.value || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    const topicCounter = this.container.querySelector('#topic-counter');
    if (topicCounter) topicCounter.textContent = `${topic.length} / 500`;

    const wordCounter = this.container.querySelector('#word-counter');
    if (wordCounter) wordCounter.textContent = `${words} palabras · ${text.length} caracteres`;
  }

  generateText() {
    const topicInput = this.container.querySelector('#input-topic');
    if (!topicInput.value.trim()) {
      topicInput.value = `Conoce la propuesta de ${this.companyData.name}: ${this.companyData.offer}`;
      this.updateCounters();
    }

    const topic = topicInput.value;
    const objective = this.container.querySelector('#input-objective').value;

    const generatedText = buildCopy(
      { channel: this.currentChannel, objective, topic },
      this.companyData,
      this.variantCount
    );

    this.container.querySelector('#input-text').value = generatedText;
    this.updateCounters();
    this.updatePreview();
  }

  updatePreview() {
    const text = this.container.querySelector('#input-text').value;
    const previewContainer = this.container.querySelector('#live-preview');
    previewContainer.innerHTML = previewView(this.currentChannel, text, this.companyData, this.currentImage);
  }

  async savePost(status) {
    const text = this.container.querySelector('#input-text').value;
    const topic = this.container.querySelector('#input-topic').value || 'Publicación comercial';
    const objective = this.container.querySelector('#input-objective').value;

    if (!text.trim()) {
      notify('Genera o redacta un texto antes de guardar.', 'error');
      return;
    }

    const payload = {
      channel: this.currentChannel,
      objective,
      topic,
      text,
      image: this.currentImage,
      imagePrompt: this.currentImagePrompt,
      status
    };

    try {
      await ApiClient.request('/posts', 'POST', payload);
      notify(status === 'approved' ? 'Publicación aprobada y guardada.' : 'Borrador guardado en biblioteca.', 'success');
      appRouter.navigate('/biblioteca');
    } catch (error) {
      notify('Error al guardar: ' + error.message, 'error');
    }
  }
}