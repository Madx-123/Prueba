/** Estado efímero de la UI; nunca se guarda como parte de la empresa. */
import { CHANNELS, OBJECTIVES } from '../data/seed.js';

export function blankCompany() {
  return { name:'', sector:'', city:'', offer:'', audience:'', differentiator:'', tone:'', goal:'', channels:[] };
}
export function blankEditor() {
  return { id:null, channel:CHANNELS[0].id, objective:OBJECTIVES[0], topic:'', text:'', status:'draft' };
}
export const ui = {
  view:'landing', user:null, company:null, posts:[],
  sidebarCollapsed:false, mobileSidebarOpen:false, authVisiblePassword:false,
  onboardingStep:0, onboarding:blankCompany(), editingCompany:false,
  editor:blankEditor(), previewChannel:'Facebook', generating:false,
  libraryFilter:'all', libraryQuery:'', librarySort:'newest',
  menuOpen:false
};
