/**
 * ContentAI - PYMES | Store & State Management Module
 * Modelo de Empresa Única: El usuario registrado trabaja única y exclusivamente con su empresa.
 */

class AppStore {
  constructor() {
    this.listeners = [];
    
    // Cargar perfil guardado de la empresa del usuario
    const savedProfile = this.loadFromStorage('contentai_pyme_profile');
    const savedHistory = this.loadFromStorage('contentai_pyme_history');
    const savedUser = this.loadFromStorage('contentai_pyme_user');

    // Empresa por defecto inicial (o la previamente registrada)
    const initialCompany = savedProfile || {
      name: 'Café Artesanal La Cumbre',
      sector: 'Gastronomía & Alimentos',
      audience: 'Amantes del café de especialidad y profesionales de 25 a 45 años que buscan productos de origen local, apoyan a caficultores y aprecian la trazabilidad del grano.',
      tone: 'Cercano, Amigable y Cálido',
      channels: ['Facebook', 'Instagram', 'Email Marketing', 'WhatsApp Business'],
      registeredAt: '2026-09-27'
    };

    this.state = {
      currentView: 'view-landing',
      activeDashboardTab: 'tab-generator',
      authMode: 'login', // 'login' | 'register'
      editorMode: 'editor', // 'editor' | 'preview'
      likesCount: 142,
      isLiked: false,

      // Usuario autenticado
      user: savedUser || {
        email: 'gerencia@lacumbre.com',
        name: 'Administrador PYME',
        isLoggedIn: false
      },

      // Bandera de empresa registrada: Solo puede haber una empresa vinculada
      isCompanyRegistered: !!savedProfile,

      // Única Empresa Registrada con la que trabaja el usuario
      companyProfile: initialCompany,

      // Estado de generación comercial activo
      currentGeneration: {
        contentType: 'Post de Facebook',
        objective: 'Ventas Directas y Conversión',
        topic: 'Lanzamiento de nuestro nuevo café de origen Nariño con 20% de descuento durante este fin de semana.',
        generatedText: `✨ ¿Hueles eso? Es el aroma a café recién tostado llegando directo a tu mesa. ☕🌿\n\nEn Café Artesanal La Cumbre estamos de fiesta: te presentamos nuestro nuevo origen Nariño, cosechado a mano con notas dulces a panela y frutos rojos que transformarán tus mañanas.\n\n🎉 PROMO EXCLUSIVA DE FIN DE SEMANA:\nLlévate tu bolsa con un 20% DE DESCUENTO especial. Y si tu pedido supera los $50.000, el envío va 100% por nuestra cuenta hasta tu puerta. 📦✨\n\n👇 Dale clic al botón de abajo o escríbenos a nuestro WhatsApp para pedir el tuyo antes de que se agote el lote de esta semana. ¡Apoya a nuestros caficultores locales!`
      },

      // Historial de Contenidos Aprobados para esta empresa
      approvedHistory: savedHistory || [
        {
          id: 1727400000000,
          date: '27/09/2026 10:15',
          company: initialCompany.name,
          contentType: 'Post de Facebook',
          tone: 'Cercano, Amigable y Cálido',
          text: `✨ ¿Hueles eso? Es el aroma a café recién tostado llegando directo a tu mesa. En ${initialCompany.name} celebramos con 20% de descuento en café Nariño.`
        }
      ]
    };
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
    this.persist();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  persist() {
    try {
      localStorage.setItem('contentai_pyme_profile', JSON.stringify(this.state.companyProfile));
      localStorage.setItem('contentai_pyme_history', JSON.stringify(this.state.approvedHistory));
      localStorage.setItem('contentai_pyme_user', JSON.stringify(this.state.user));
    } catch {
      // Ignorar si localStorage está restringido
    }
  }

  loadFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  // Registra la única empresa del usuario
  registerUserCompany(companyData) {
    this.setState({
      companyProfile: { ...companyData, registeredAt: new Date().toISOString() },
      isCompanyRegistered: true
    });
  }
}

export const store = new AppStore();
