
/**
 * ContentAI PYMES | Servicio de datos
 * Ruta: js/services/api.js
 *
 * Centraliza las operaciones de:
 * - Sesión de demostración
 * - Registro y edición empresarial
 * - Generación de contenido
 * - Consulta y administración de publicaciones
 *
 * Actualmente utiliza store.js como almacenamiento local.
 * Posteriormente conectaremos estos métodos con Laravel.
 *
 * IMPORTANTE: este archivo NO proporciona seguridad
 * ni autenticación real.
 */

import { store } from '../store.js';


/* ==========================================================
   1. MANEJO DE ERRORES
   ========================================================== */

export class ApiError extends Error {

  constructor(message, status = 400) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
  }
}


/* ==========================================================
   2. FUNCIONES AUXILIARES
   ========================================================== */

function isObject(value) {
  return value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value);
}


/**
 * Devuelve una copia independiente de los datos.
 * Evita modificar accidentalmente el estado original.
 */
function copy(value) {
  return JSON.parse(JSON.stringify(value));
}


/**
 * Comprueba que exista una sesión de demostración.
 */
function requireSession() {
  const state = store.getState();

  if (!state.user?.isLoggedIn) {
    throw new ApiError(
      'Debes iniciar sesión para continuar.',
      401
    );
  }

  return state;
}


/**
 * Comprueba que el usuario haya registrado su empresa.
 */
function requireCompany() {
  const state = requireSession();

  if (
    !state.isCompanyRegistered ||
    !state.companyProfile?.id
  ) {
    throw new ApiError(
      'Primero debes registrar tu empresa.',
      409
    );
  }

  return state;
}


/**
 * Valida campos de texto obligatorios.
 */
function requiredText(value, label, max = 5000) {

  if (
    typeof value !== 'string' ||
    !value.trim()
  ) {
    throw new ApiError(
      `El campo ${label} es obligatorio.`,
      422
    );
  }

  const text = value.trim();

  if (text.length > max) {
    throw new ApiError(
      `${label} supera el máximo de ${max} caracteres.`,
      422
    );
  }

  return text;
}


/* ==========================================================
   3. VALIDACIÓN DE EMPRESA
   ========================================================== */

function validateCompany(input) {

  if (!isObject(input)) {
    throw new ApiError(
      'Los datos de la empresa no son válidos.',
      422
    );
  }

  if (
    !Array.isArray(input.channels) ||
    input.channels.length === 0
  ) {
    throw new ApiError(
      'Selecciona al menos un canal.',
      422
    );
  }

  const channels = input.channels.map((value) =>
    requiredText(value, 'canal', 80)
  );

  return {
    name: requiredText(
      input.name,
      'nombre de empresa',
      120
    ),

    sector: requiredText(
      input.sector,
      'sector',
      150
    ),

    audience: requiredText(
      input.audience,
      'público objetivo',
      1000
    ),

    tone: requiredText(
      input.tone,
      'tono',
      120
    ),

    channels: [...new Set(channels)]
  };
}


/* ==========================================================
   4. UTILIDADES DE PUBLICACIONES
   ========================================================== */

function getHistory() {
  const list = store.getState().approvedHistory;

  return Array.isArray(list)
    ? list
    : [];
}


/**
 * Identificador temporal.
 * Laravel generará los identificadores reales.
 */
function newContentId() {

  if (globalThis.crypto?.randomUUID) {
    return `demo_${globalThis.crypto.randomUUID()}`;
  }

  return (
    `demo_${Date.now()}_` +
    Math.random().toString(36).slice(2, 10)
  );
}


/* ==========================================================
   5. API DEL FRONTEND
   ========================================================== */

/**
 * Todas las operaciones son asíncronas.
 *
 * Los componentes podrán seguir utilizando estos
 * mismos métodos cuando incorporemos Laravel.
 */

export const api = {


  /* ========================================================
     AUTENTICACIÓN DE DEMOSTRACIÓN
     ======================================================== */

  async login({ email, password } = {}) {

    const cleanEmail = requiredText(
      email,
      'correo',
      254
    ).toLowerCase();

    requiredText(password, 'contraseña');

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      throw new ApiError(
        'Introduce un correo válido.',
        422
      );
    }

    const state = store.getState();

    const savedEmail = String(
      state.user?.email ?? ''
    ).toLowerCase();

    // No mezclar empresas de diferentes correos.
    if (
      state.isCompanyRegistered &&
      savedEmail !== cleanEmail
    ) {
      throw new ApiError(
        'Esta empresa demo está vinculada a otro correo.',
        403
      );
    }

    const user = {
      name:
        state.user?.name ||
        'Administrador PYME',

      email: cleanEmail,

      isLoggedIn: true
    };

    store.setState({ user });

    // No devolver ni almacenar contraseñas.
    return copy({
      name: user.name,
      email: user.email
    });
  },


  /* ========================================================
     REGISTRO DE USUARIO DEMO
     ======================================================== */

  async register({ name, email, password } = {}) {

    const cleanName = requiredText(
      name,
      'nombre',
      120
    );

    const cleanEmail = requiredText(
      email,
      'correo',
      254
    ).toLowerCase();

    requiredText(password, 'contraseña');

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      throw new ApiError(
        'Introduce un correo válido.',
        422
      );
    }

    if (store.getState().isCompanyRegistered) {
      throw new ApiError(
        'Ya existe una empresa demo en este navegador.',
        409
      );
    }

    store.setState({
      user: {
        name: cleanName,
        email: cleanEmail,
        isLoggedIn: true
      }
    });

    return {
      name: cleanName,
      email: cleanEmail
    };
  },


  /* ========================================================
     CERRAR SESIÓN
     ======================================================== */

  async logout() {

    const state = store.getState();

    store.setState({
      user: {
        ...state.user,
        isLoggedIn: false
      }
    });

    return {
      success: true
    };
  },


  /* ========================================================
     CONSULTAR USUARIO ACTUAL
     ======================================================== */

  async getCurrentUser() {

    const { user } = requireSession();

    return {
      name: user.name,
      email: user.email
    };
  },


  /* ========================================================
     CONSULTAR PERFIL EMPRESARIAL
     ======================================================== */

  async getCompany() {

    const state = requireSession();

    return state.isCompanyRegistered
      ? copy(state.companyProfile)
      : null;
  },


  /* ========================================================
     REGISTRAR EMPRESA
     ======================================================== */

  async saveCompany(companyData) {

    requireSession();

    const validated = validateCompany(companyData);

    store.registerUserCompany(validated);

    return copy(
      store.getState().companyProfile
    );
  },


  /* ========================================================
     ACTUALIZAR EMPRESA
     ======================================================== */

  async updateCompany(changes) {

    const state = requireCompany();

    if (!isObject(changes)) {
      throw new ApiError(
        'Los cambios enviados no son válidos.',
        422
      );
    }

    const validated = validateCompany({
      ...state.companyProfile,
      ...changes
    });

    store.registerUserCompany(validated);

    return copy(
      store.getState().companyProfile
    );
  },


  /* ========================================================
     GENERACIÓN DE CONTENIDO
     ======================================================== */

  async generateContent(parameters) {

    requireCompany();

    if (!isObject(parameters)) {
      throw new ApiError(
        'Los parámetros de generación no son válidos.',
        422
      );
    }

    const contentType = requiredText(
      parameters.contentType,
      'canal',
      100
    );

    const objective = requiredText(
      parameters.objective,
      'objetivo',
      150
    );

    const topic = requiredText(
      parameters.topic,
      'descripción',
      500
    );

    /**
     * Reutilizamos generator.js.
     * No duplicamos sus plantillas.
     *
     * La importación diferida evita dependencias
     * circulares durante el inicio de la aplicación.
     */

    const { craftAICommercialCopy } =
      await import('../generator.js');

    const generatedText = craftAICommercialCopy(
      contentType,
      objective,
      topic
    );

    return {
      contentType,
      objective,
      topic,
      generatedText
    };
  },


  /* ========================================================
     CONSULTAR PUBLICACIONES
     ======================================================== */

  async getContents() {

    requireCompany();

    return copy(getHistory());
  },


  /* ========================================================
     CONSULTAR UNA PUBLICACIÓN
     ======================================================== */

  async getContent(id) {

    requireCompany();

    const item = getHistory().find(
      (entry) =>
        String(entry.id) === String(id)
    );

    if (!item) {
      throw new ApiError(
        'Publicación no encontrada.',
        404
      );
    }

    return copy(item);
  },


  /* ========================================================
     GUARDAR PUBLICACIÓN APROBADA
     ======================================================== */

  async saveContent(content) {

    const state = requireCompany();

    if (!isObject(content)) {
      throw new ApiError(
        'Los datos de publicación no son válidos.',
        422
      );
    }

    const now = new Date();

    const item = {

      id: newContentId(),

      companyId: state.companyProfile.id,

      company: state.companyProfile.name,

      contentType: requiredText(
        content.contentType,
        'canal',
        100
      ),

      objective: String(
        content.objective ?? ''
      ).trim(),

      topic: String(
        content.topic ?? ''
      ).trim(),

      tone: String(
        state.companyProfile.tone ?? ''
      ),

      text: requiredText(
        content.text,
        'contenido',
        20000
      ),

      status: 'approved',

      createdAt: now.toISOString(),

      date: now.toLocaleString('es-PE')
    };

    store.setState({
      approvedHistory: [
        item,
        ...getHistory()
      ]
    });

    return copy(item);
  },


  /* ========================================================
     ACTUALIZAR PUBLICACIÓN
     ======================================================== */

  async updateContent(id, changes) {

    requireCompany();

    if (!isObject(changes)) {
      throw new ApiError(
        'Los cambios enviados no son válidos.',
        422
      );
    }

    const history = getHistory();

    const index = history.findIndex(
      (item) =>
        String(item.id) === String(id)
    );

    if (index < 0) {
      throw new ApiError(
        'Publicación no encontrada.',
        404
      );
    }

    const original = history[index];

    const next = {
      ...original
    };

    // Solo permitir editar campos autorizados.
    const editableFields = [
      'contentType',
      'objective',
      'topic',
      'text'
    ];

    for (const field of editableFields) {

      if (Object.hasOwn(changes, field)) {

        next[field] = field === 'text'
          ? requiredText(
              changes[field],
              'contenido',
              20000
            )
          : requiredText(
              changes[field],
              field,
              5000
            );
      }
    }

    next.updatedAt = new Date().toISOString();

    store.setState({
      approvedHistory: history.map(
        (item, position) =>
          position === index
            ? next
            : item
      )
    });

    return copy(next);
  },


  /* ========================================================
     ELIMINAR PUBLICACIÓN
     ======================================================== */

  async deleteContent(id) {

    requireCompany();

    const history = getHistory();

    const remaining = history.filter(
      (item) =>
        String(item.id) !== String(id)
    );

    if (remaining.length === history.length) {
      throw new ApiError(
        'Publicación no encontrada.',
        404
      );
    }

    store.setState({
      approvedHistory: remaining
    });

    return {
      success: true
    };
  }

};
