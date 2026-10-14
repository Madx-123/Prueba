
/**
 * ContentAI PYMES | Estado central de la aplicación
 * Ruta: js/store.js
 *
 * Conserva el contrato de los módulos actuales:
 * getState(), setState(), subscribe(), registerUserCompany().
 *
 * Los datos ficticios se importan desde data/demoData.js.
 * localStorage es temporal: NO proporciona autenticación real.
 */

import {
  DEMO_USER,
  getDemoCompany,
  getDemoGeneration
} from '../data/demoData.js';


/* ==========================================================
   1. CLAVES DE ALMACENAMIENTO LOCAL
   ========================================================== */

const STORAGE_KEYS = Object.freeze({
  profile: 'contentai_pyme_profile',
  history: 'contentai_pyme_history',
  user: 'contentai_pyme_user',
  registered: 'contentai_pyme_company_registered'
});


/* ==========================================================
   2. FUNCIONES AUXILIARES
   ========================================================== */

/**
 * Comprueba que un valor sea un objeto
 * y no un arreglo o un valor nulo.
 */
function isRecord(value) {
  return value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value);
}


/* ==========================================================
   3. CLASE PRINCIPAL DEL ESTADO
   ========================================================== */

class AppStore {

  constructor() {

    this.listeners = new Set();

    // Recuperar únicamente datos persistentes.
    const savedProfile = this.loadFromStorage(
      STORAGE_KEYS.profile
    );

    const savedHistory = this.loadFromStorage(
      STORAGE_KEYS.history
    );

    const savedUser = this.loadFromStorage(
      STORAGE_KEYS.user
    );

    const registeredFlag = this.loadFromStorage(
      STORAGE_KEYS.registered
    );


    /* ======================================================
       4. COMPROBAR REGISTRO EMPRESARIAL
       ====================================================== */

    /**
     * Una empresa de demostración no significa
     * que el usuario ya la haya registrado.
     *
     * Se conserva compatibilidad con empresas
     * registradas anteriormente mediante profiles.js.
     */

    const validProfile = isRecord(savedProfile) &&
      typeof savedProfile.name === 'string' &&
      savedProfile.name.trim().length > 0;

    const isCompanyRegistered = Boolean(
      validProfile &&
      (
        registeredFlag === true ||
        savedProfile.id
      )
    );


    /* ======================================================
       5. CARGAR PERFIL EMPRESARIAL
       ====================================================== */

    // Datos iniciales desde data/demoData.js
    const demoCompany = getDemoCompany();

    const companyProfile = isCompanyRegistered
      ? {
          ...demoCompany,
          ...savedProfile,

          channels: Array.isArray(savedProfile.channels)
            ? [...savedProfile.channels]
            : [...demoCompany.channels]
        }
      : demoCompany;


    /* ======================================================
       6. RECUPERAR INFORMACIÓN DEL USUARIO
       ====================================================== */

    const safeUser = isRecord(savedUser)
      ? savedUser
      : {};


    /* ======================================================
       7. ESTADO INICIAL DE LA APLICACIÓN
       ====================================================== */

    this.state = {

      // Navegación
      currentView: 'view-landing',

      activeDashboardTab: 'tab-generator',

      // Formulario de autenticación
      authMode: 'login',

      // Modo del editor
      editorMode: 'editor',

      // Interacciones simuladas
      likesCount: 142,
      isLiked: false,


      // Usuario
      user: {

        ...DEMO_USER,

        name: typeof safeUser.name === 'string'
          ? safeUser.name
          : DEMO_USER.name,

        email: typeof safeUser.email === 'string'
          ? safeUser.email
          : DEMO_USER.email,

        // La sesión no se restaura automáticamente.
        isLoggedIn: false
      },


      // Empresa
      isCompanyRegistered,

      companyProfile,


      // Generación de demostración
      currentGeneration: getDemoGeneration(),


      // Historial de publicaciones aprobadas.
      // Los registros demo no se agregan automáticamente.
      approvedHistory:
        isCompanyRegistered &&
        Array.isArray(savedHistory)
          ? savedHistory
          : []
    };
  }


  /* ========================================================
     8. OBTENER ESTADO ACTUAL
     ======================================================== */

  getState() {
    return this.state;
  }


  /* ========================================================
     9. MODIFICAR ESTADO
     ======================================================== */

  /**
   * Recibe un objeto con los campos que se desean
   * actualizar.
   *
   * Ejemplo:
   *
   * store.setState({
   *   activeDashboardTab: 'tab-review'
   * });
   */

  setState(partialState) {

    if (!isRecord(partialState)) {
      return;
    }

    // Identificar los campos modificados.
    const changedKeys = Object.keys(partialState).filter(
      (key) =>
        !Object.is(
          this.state[key],
          partialState[key]
        )
    );

    // No actualizar si no hubo cambios.
    if (changedKeys.length === 0) {
      return;
    }

    // Actualizar el estado.
    this.state = {
      ...this.state,
      ...partialState
    };

    // Persistir únicamente lo necesario.
    this.persist(changedKeys);

    // Notificar a los módulos suscritos.
    this.notify();
  }


  /* ========================================================
     10. SUSCRIPCIÓN A CAMBIOS
     ======================================================== */

  /**
   * Permite que otros módulos reciban
   * actualizaciones cuando cambia el estado.
   *
   * Devuelve una función para cancelar
   * la suscripción cuando sea necesario.
   */

  subscribe(listener) {

    if (typeof listener !== 'function') {
      return () => {};
    }

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }


  /* ========================================================
     11. NOTIFICAR A LOS SUSCRIPTORES
     ======================================================== */

  notify() {

    for (const listener of this.listeners) {
      listener(this.state);
    }
  }


  /* ========================================================
     12. PERSISTENCIA LOCAL
     ======================================================== */

  /**
   * Guarda los datos persistentes en localStorage.
   *
   * No guarda navegación, editor temporal,
   * contraseña ni sesión autenticada.
   */

  persist(changedKeys = [
    'user',
    'companyProfile',
    'approvedHistory',
    'isCompanyRegistered'
  ]) {

    try {

      // Guardar información básica del usuario.
      if (changedKeys.includes('user')) {

        const {
          name,
          email
        } = this.state.user;

        localStorage.setItem(
          STORAGE_KEYS.user,
          JSON.stringify({
            name,
            email
          })
        );
      }


      // Guardar empresa registrada.
      if (
        changedKeys.includes('companyProfile') ||
        changedKeys.includes('isCompanyRegistered')
      ) {

        if (this.state.isCompanyRegistered) {

          localStorage.setItem(
            STORAGE_KEYS.profile,
            JSON.stringify(
              this.state.companyProfile
            )
          );

          localStorage.setItem(
            STORAGE_KEYS.registered,
            JSON.stringify(true)
          );
        }
      }


      // Guardar publicaciones aprobadas.
      if (
        changedKeys.includes('approvedHistory') &&
        this.state.isCompanyRegistered
      ) {

        localStorage.setItem(
          STORAGE_KEYS.history,
          JSON.stringify(
            this.state.approvedHistory
          )
        );
      }

    } catch (error) {

      console.warn(
        'ContentAI: no se pudo guardar en localStorage.',
        error
      );
    }
  }


  /* ========================================================
     13. LEER ALMACENAMIENTO LOCAL
     ======================================================== */

  loadFromStorage(key) {

    try {

      const raw = localStorage.getItem(key);

      return raw === null
        ? null
        : JSON.parse(raw);

    } catch {

      return null;
    }
  }


  /* ========================================================
     14. REGISTRAR O ACTUALIZAR EMPRESA
     ======================================================== */

  /**
   * Registra la primera empresa o actualiza
   * la empresa existente.
   *
   * Mantiene el identificador original
   * durante las actualizaciones.
   */

  registerUserCompany(companyData) {

    // Validación básica.
    if (
      !isRecord(companyData) ||
      typeof companyData.name !== 'string' ||
      !companyData.name.trim()
    ) {

      throw new Error(
        'El nombre de la empresa es obligatorio.'
      );
    }


    // Determinar si es un registro nuevo.
    const wasRegistered =
      this.state.isCompanyRegistered;

    const previous = wasRegistered
      ? this.state.companyProfile
      : null;

    const now = new Date().toISOString();


    // Preparar registro empresarial.
    const companyProfile = {

      ...companyData,

      channels: Array.isArray(companyData.channels)
        ? [...companyData.channels]
        : [],

      id:
        previous?.id ||
        companyData.id ||
        `pyme_${Date.now()}`,

      registeredAt:
        previous?.registeredAt ||
        now
    };


    // Actualizar empresa y estado.
    this.setState({

      companyProfile,

      isCompanyRegistered: true,

      // Una empresa nueva comienza sin historial.
      ...(wasRegistered
        ? {}
        : {
            approvedHistory: []
          })
    });
  }
}


/* ==========================================================
   15. INSTANCIA COMPARTIDA
   ========================================================== */

export const store = new AppStore();
