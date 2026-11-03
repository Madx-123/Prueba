import { appRouter } from '../../app.js';
import { ApiClient } from '../../core/ApiClient.js';
import { buildCopy } from './engine.js';      // Tu antiguo copyGenerator.js
import { previewView } from './previews.js';  // Tu antiguo previews.js

export default class CreatorController {
  constructor(container) {
    this.container = container;
    this.companyData = null;
    this.currentChannel = 'Facebook';
    this.variantCount = 0;
    
    this.init();
  }

  async init() {
    try {
      // Obtenemos los datos de la empresa desde MySQL para saber el tono y nombre
      const response = await ApiClient.request('/empresa', 'GET');
      if (!response.company) {
        alert("Primero debes configurar tu empresa.");
        appRouter.navigate('/onboarding');
        return;
      }
      this.companyData = response.company;
      this.container.querySelector('#display-tone').textContent = this.companyData.tone;

      this.bindEvents();
      this.updatePreview(); // Dibuja la vista previa vacía inicial
    } catch (error) {
      console.error("Error al cargar datos del creador:", error);
    }
  }

  bindEvents() {
    // 1. Selector de Plataformas (Facebook, Instagram...)
    const channelButtons = this.container.querySelectorAll('.platform-button');
    channelButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Quitar clase active a todos y ponérsela al clickeado
        channelButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        this.currentChannel = e.currentTarget.dataset.channel;
        this.updatePreview();
      });
    });

    // 2. Generar Propuesta
    const btnGenerate = this.container.querySelector('#btn-generate');
    btnGenerate.addEventListener('click', () => this.generateText());

    // 3. Otra variante
    this.container.querySelector('#btn-variant').addEventListener('click', () => {
      this.variantCount++;
      this.generateText();
    });

    // 4. Actualizar vista previa en vivo si el usuario teclea en el editor
    const inputText = this.container.querySelector('#input-text');
    inputText.addEventListener('input', () => this.updatePreview());

    // 5. Limpiar y Copiar
    this.container.querySelector('#btn-clear').addEventListener('click', () => {
      inputText.value = '';
      this.updatePreview();
    });

    this.container.querySelector('#btn-copy').addEventListener('click', async () => {
      const value = inputText.value;
      if (!value.trim()) { alert('No hay texto para copiar.'); return; }
      try {
        await navigator.clipboard.writeText(value);
        alert('Texto copiado.');
      } catch {
        inputText.select();
        alert('Seleccionamos el texto; pulsa Ctrl+C para copiarlo.');
      }
    });

    // 6. Guardar publicación
    this.container.querySelector('#btn-save-draft').addEventListener('click', () => this.savePost('draft'));
    this.container.querySelector('#btn-save-approved').addEventListener('click', () => this.savePost('approved'));
  }

  generateText() {
    const topic = this.container.querySelector('#input-topic').value;
    const objective = this.container.querySelector('#input-objective').value;

    if (!topic.trim()) {
      alert("Por favor, describe qué deseas comunicar.");
      return;
    }

    // Usar tu motor (buildCopy) para generar el texto
    const generatedText = buildCopy(
      { channel: this.currentChannel, objective, topic }, 
      this.companyData, 
      this.variantCount
    );

    // Insertar en el textarea y actualizar la maqueta visual
    this.container.querySelector('#input-text').value = generatedText;
    this.updatePreview();
  }

  updatePreview() {
    const text = this.container.querySelector('#input-text').value;
    const previewContainer = this.container.querySelector('#live-preview');
    
    // Usar tu archivo previews.js para inyectar el HTML de FB/IG/TikTok
    previewContainer.innerHTML = previewView(this.currentChannel, text, this.companyData);
  }

  async savePost(status) {
    const text = this.container.querySelector('#input-text').value;
    const topic = this.container.querySelector('#input-topic').value;
    const objective = this.container.querySelector('#input-objective').value;

    if (!text.trim()) {
      alert("No hay texto para guardar.");
      return;
    }

    const payload = {
      channel: this.currentChannel,
      objective: objective,
      topic: topic,
      text: text,
      status: status
    };

    try {
      // Aquí llamaremos a tu API (PostController)
      await ApiClient.request('/posts', 'POST', payload);
      alert(`Publicación guardada como ${status}.`);
      appRouter.navigate('/biblioteca');
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  }
}