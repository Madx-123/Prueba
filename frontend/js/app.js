import { Router } from './core/Router.js';

const routes = {
  '/': {
    template: './js/modules/landing/landing.html',
    controller: '../modules/landing/LandingController.js'
  },
  '/login': {
    template: './js/modules/auth/login.html',
    controller: '../modules/auth/AuthController.js'
  },
  '/registro': {
    template: './js/modules/auth/registro.html',
    controller: '../modules/auth/AuthController.js'
  },
  '/onboarding': {
    template: './js/modules/onboarding/onboarding.html',
    controller: '../modules/onboarding/OnboardingController.js'
  },
  '/dashboard': {
    template: './js/modules/dashboard/dashboard.html',
    controller: '../modules/dashboard/DashboardController.js',
    requiresLayout: true
  },
  '/crear': {
    template: './js/modules/creator/creator.html',
    controller: '../modules/creator/CreatorController.js',
    requiresLayout: true
  },
  '/biblioteca': {
    template: './js/modules/library/library.html',
    controller: '../modules/library/LibraryController.js',
    requiresLayout: true
  },
  '/perfil': {
    template: './js/modules/profile/profile.html',
    controller: '../modules/profile/ProfileController.js',
    requiresLayout: true
  }
};

const appRouter = new Router(routes);
appRouter.loadRoute();

export { appRouter };