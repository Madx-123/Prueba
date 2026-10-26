import { readImage, postImage } from './ui/media.js';
/** ContentAI PYMES: único controlador de UI. Todos los eventos se delegan aquí. */
import { api } from './services/api.js';
import { ui, blankCompany, blankEditor } from './core/state.js';
import { notify } from './ui/toast.js';
import { landingView, authView } from './views/public.js';
import { onboardingView } from './views/onboarding.js';
import { dashboardView, libraryResults, filteredPosts } from './views/dashboard.js';
import { previewView } from './views/previews.js';
import { buildCopy } from './features/copyGenerator.js';
import { SUGGESTIONS } from './data/seed.js';
import { words } from './core/utils.js';
const app = document.getElementById('app');
const guarded = new Set(['home','create','library','company','settings']);
// Conserva la página del usuario tras recargar, pero la sesión real la verifica PHP.
const SAVED_VIEW_KEY = 'contentai.v4.lastPage';
function rememberPage(view) {
  if (!ui.user || !guarded.has(view)) return;
  try {
    sessionStorage.setItem(SAVED_VIEW_KEY, JSON.stringify({ userId: ui.user.id, view }));
  } catch { /* La sesión PHP no depende de sessionStorage. */ }
}
function restorePage() {
  if (!ui.user || !ui.company) return 'onboarding';
  try {
    const saved = JSON.parse(sessionStorage.getItem(SAVED_VIEW_KEY) || 'null');
    if (saved?.userId === ui.user.id && guarded.has(saved.view)) return saved.view;
  } catch { /* Página por defecto */ }
  return 'home';
}
function clearRememberedPage() {
  try { sessionStorage.removeItem(SAVED_VIEW_KEY); } catch { /* Sin almacenamiento */ }
}
let variant = 0;
let guardandoEmpresa = false;
const $ = id => document.getElementById(id);

function render() {
  if (ui.view === 'landing') app.innerHTML = landingView();
  else if (ui.view === 'login' || ui.view === 'register') app.innerHTML = authView(ui.view);
  else if (ui.view === 'onboarding') app.innerHTML = onboardingView(ui);
  else if (guarded.has(ui.view)) app.innerHTML = dashboardView(ui);
  else app.innerHTML = landingView();
  if (ui.view === 'create') syncPreview();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

async function hydrate() {
  // En cada recarga, PHP comprueba su cookie de sesión; NO usamos una sesión falsa local.
  ui.user = await api.session();
  ui.company = ui.user ? await api.getCompany() : null;
  ui.posts = ui.company ? await api.posts() : [];
  if (ui.user) {
    ui.view = restorePage();
    if (!ui.company) prepareOnboarding(false);
  } else {
    clearRememberedPage();
    ui.view = 'landing';
  }
}
async function navigate(view) {
  if (guarded.has(view) || view === 'onboarding') {
    if (!ui.user) { ui.view='login'; render(); return; }
    if (!ui.company && view !== 'onboarding') {
      prepareOnboarding(false); ui.view='onboarding'; render(); return;
    }
  }
  if (!['landing','login','register','onboarding', ...guarded].includes(view)) view='landing';
  ui.view = view;
  rememberPage(view);
  ui.mobileSidebarOpen=false;
  render();
}
function prepareOnboarding(edit) {
  ui.editingCompany = edit;
  ui.onboardingStep = 0;
  ui.onboarding = edit && ui.company ? { ...ui.company, channels:[...ui.company.channels] } : blankCompany();
}
function updatePreviewNode() {
  const node = $('live-preview');
  if (node) node.innerHTML = previewView(ui.previewChannel,ui.editor.text,ui.company,ui.editor.image);
}
function syncPreview() { updatePreviewNode(); }
function syncEditorMetrics() {
  const counter=$('editor-count');
  if(counter) counter.textContent=`${words(ui.editor.text)} palabras · ${ui.editor.text.length} caracteres`;
  const count=$('topic-count'); if(count) count.textContent=`${ui.editor.topic.length}/500`;
}
function onboardingValid(step) {
  const fieldMap = {0:[['name','nombre comercial'],['sector','sector'],['offer','productos o servicios']],1:[['audience','público objetivo']],2:[['tone','tono de la marca']]};
  for(const [field,label] of fieldMap[step] || []) {
    if (!String(ui.onboarding[field] || '').trim()) {
      notify(`Completa ${label} para continuar.`, 'error');
      $(`${field}`)?.focus(); return false;
    }
  }
  if(step===2 && !ui.onboarding.channels.length) {notify('Selecciona al menos una plataforma.','error');return false;}
  return true;
}
async function submitCompany() {
  if (guardandoEmpresa) return;
  for(let step=0;step<3;step++) if(!onboardingValid(step)){ui.onboardingStep=step;render();return;}
  guardandoEmpresa = true;
  const button=document.querySelector('[data-action="onboard-next"]');
  if(button) button.disabled=true;
  try {
    ui.company=await api.saveCompany(ui.onboarding);
    ui.posts=await api.posts();
    notify(ui.editingCompany?'Los datos de la empresa se actualizaron.':'¡Empresa configurada! Ya puedes crear contenido.','success');
    await navigate(ui.editingCompany?'company':'home');
  } catch(e){notify(e.message,'error');if(button)button.disabled=false;}
  finally { guardandoEmpresa = false; }
}
async function authSubmit(form) {
  const fields = Object.fromEntries(new FormData(form));
  const data = {
    name: String(fields.nombre || '').trim(),
    email: String(fields.correo || '').trim(),
    password: String(fields.password || '')
  };
  const button=form.querySelector('[type="submit"]');
  if(button) button.disabled=true;
  try {
    ui.avatarDraft=undefined;
    ui.user = form.dataset.form === 'register' ? await api.register(data) : await api.login(data);
    clearRememberedPage();
    ui.company = await api.getCompany();
    ui.posts = ui.company ? await api.posts() : [];
    notify(`Hola, ${ui.user.name.split(' ')[0]}. ¡Bienvenido a ContentAI!`,'success');
    if (!ui.company) {prepareOnboarding(false); await navigate('onboarding');}
    else await navigate('home');
  } catch(e){notify(e.message,'error');if(button)button.disabled=false;}
}
async function savePost(status) {
  if(!ui.editor.text.trim()) {notify('Escribe o genera un texto antes de guardarlo.','error');$('editor-text')?.focus();return;}
  try {
    const saved = await api.savePost({...ui.editor,status});
    ui.editor.id=saved.id; ui.editor.status=saved.status;
    ui.posts=await api.posts();
    notify(status==='approved'?'Publicación aprobada y guardada.':'Borrador guardado correctamente.','success');
    await navigate('library');
  }catch(e){notify(e.message,'error');}
}
async function generate() {
  if(ui.generating) return;
  if(!ui.editor.topic.trim()) {notify('Describe qué deseas comunicar antes de generar.','error');$('editor-topic')?.focus();return;}
  ui.generating=true;
  const button=document.querySelector('[data-action="generate"]');
  if(button){button.disabled=true;button.innerHTML='✦ Preparando borrador...';}
  try {
    await new Promise(resolve=>setTimeout(resolve,650));
    variant=0;
    ui.editor.text=buildCopy(ui.editor,ui.company,variant);
    const field=$('editor-text');if(field)field.value=ui.editor.text;
    ui.previewChannel=ui.editor.channel;
    updatePreviewNode();syncEditorMetrics();
    document.querySelectorAll('.preview-tab').forEach(x=>{x.classList.toggle('active',x.dataset.channel===ui.previewChannel);x.setAttribute('aria-pressed', String(x.dataset.channel===ui.previewChannel));});
    notify('Propuesta de demostración creada. Puedes editarla libremente.','success');
  } catch(e){notify(e.message,'error');}
  finally {ui.generating=false; if(button){button.disabled=false;button.innerHTML='✦ Generar propuesta demo →';}}
}
function updateLibrary() {
  const result=$('library-results'); if(!result)return;
  result.innerHTML=libraryResults(filteredPosts(ui),ui.libraryLayout);
  document.querySelectorAll('[data-count]').forEach(el=>el.textContent=ui.posts.filter(p=>el.dataset.count==='all'||p.status===el.dataset.count).length);

}
function putAtCursor(s) {
  const box=$('editor-text');if(!box)return;
  const a=box.selectionStart,b=box.selectionEnd, selected=box.value.slice(a,b);
  const replacement=s==='bold'?`**${selected||'texto destacado'}**`:s==='list'?`\n• ${selected||'Elemento de la lista'}`:' ✨';
  box.setRangeText(replacement,a,b,'end');
  ui.editor.text=box.value;syncEditorMetrics();updatePreviewNode();box.focus();
}
async function copyText() {
  if(!ui.editor.text.trim()){notify('No hay contenido para copiar.','error');return;}
  try{await navigator.clipboard.writeText(ui.editor.text);notify('Texto copiado al portapapeles.','success');}
  catch{const box=$('editor-text');box?.select();notify('Selecciona el texto y pulsa Ctrl+C para copiar.');}
}
async function downloadData() {
  const json=await api.exportDemo();
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);const anchor=document.createElement('a');
  anchor.href=url;anchor.download='contentai-datos-demo.json';document.body.append(anchor);anchor.click();anchor.remove();
  URL.revokeObjectURL(url);notify('Datos locales exportados.','success');
}
const findPost = id => ui.posts.find(p=>p.id===id);

app.addEventListener('submit', async event => {
  const form=event.target.closest('form[data-form]'); if(!form)return;
  event.preventDefault();
  if(['login','register'].includes(form.dataset.form)) await authSubmit(form);
});

app.addEventListener('input', event => {
  const el=event.target;
  if(el.dataset.companyField) ui.onboarding[el.dataset.companyField]=el.value;
  if(el.dataset.editorField){ui.editor[el.dataset.editorField]=el.value;syncEditorMetrics();if(el.dataset.editorField==='text')updatePreviewNode();}
  if(el.id==='library-search'){ui.libraryQuery=el.value;updateLibrary();}
});
app.addEventListener('change', async event => {
  const el=event.target;
  if(el.dataset.companyField) ui.onboarding[el.dataset.companyField]=el.value;
  if(el.dataset.companyChannel){const id=el.dataset.companyChannel;ui.onboarding.channels=el.checked?[...new Set([...ui.onboarding.channels,id])]:ui.onboarding.channels.filter(x=>x!==id);el.closest('.channel-choice')?.classList.toggle('checked',el.checked);}
  if(el.dataset.editorField)ui.editor[el.dataset.editorField]=el.value;
  if(el.id==='library-channel'){ui.libraryChannel=el.value;updateLibrary();}
  if(el.id==='avatar-input'||el.id==='post-image-input') {
    const file=el.files?.[0]; if(!file)return;
    const userId=ui.user?.id, view=ui.view, editor=ui.editor;
    el.disabled=true;
    try {
      const value=await readImage(file,el.id==='avatar-input'?400:1200);
      if(ui.user?.id!==userId || ui.view!==view || !el.isConnected)return;
      if(el.id==='avatar-input')ui.avatarDraft=value;
      else if(ui.editor===editor)ui.editor.image=value;
      const scrollY=window.scrollY;render();window.scrollTo({top:scrollY,behavior:"instant"});
    } catch(error){notify(error.message,'error');el.value='';}
    finally{el.disabled=false;}
  }
  if(el.id==='library-sort'){ui.librarySort=el.value;updateLibrary();}
});

app.addEventListener('click', async event => {
  const el=event.target.closest('[data-action]');if(!el)return;
  const action=el.dataset.action;
  if(el.tagName==='A')event.preventDefault();
  try{
    switch(action){
      case 'save-avatar': if(ui.avatarDraft!==undefined){ui.user=await api.saveAvatar(ui.avatarDraft);ui.avatarDraft=undefined;render();notify('Foto de perfil guardada.','success');}break;
      case 'cancel-avatar': ui.avatarDraft=undefined;render();break;
      case 'remove-avatar': ui.avatarDraft='';render();break;
      case 'remove-post-image': {const scrollY=window.scrollY;ui.editor.image='';render();window.scrollTo({top:scrollY,behavior:'instant'});break;}
      case 'library-layout': ui.libraryLayout=el.dataset.layout;render();break;
      case 'create-for-channel': ui.editor=blankEditor();ui.editor.channel=el.dataset.channel;ui.previewChannel=el.dataset.channel;variant=0;await navigate('create');break;
      case 'start-idea': ui.editor=blankEditor();ui.editor.channel=ui.company.channels[0]||'Facebook';ui.editor.topic=SUGGESTIONS[Number(el.dataset.index)];ui.previewChannel=ui.editor.channel;variant=0;await navigate('create');break;
      case 'go': ui.avatarDraft=undefined; await navigate(el.dataset.view);break;
      case 'demo-login': ui.avatarDraft=undefined;ui.user=await api.demoLogin();clearRememberedPage();ui.company=await api.getCompany();ui.posts=await api.posts();await navigate('home');notify('Entraste al espacio de demostración.','success');break;
      case 'logout': ui.avatarDraft=undefined; await api.logout();clearRememberedPage();ui.user=null;ui.company=null;ui.posts=[];ui.editor=blankEditor();await navigate('landing');notify('Sesión cerrada.');break;
      case 'toggle-password': {const input=$('auth-password');if(input){input.type=input.type==='password'?'text':'password';el.setAttribute('aria-label',input.type==='password'?'Mostrar contraseña':'Ocultar contraseña');}break;}
      case 'toggle-mobile-sidebar': ui.mobileSidebarOpen=!ui.mobileSidebarOpen;app.querySelector('.app-sidebar')?.classList.toggle('mobile-open',ui.mobileSidebarOpen);app.querySelector('.sidebar-backdrop')?.classList.toggle('show',ui.mobileSidebarOpen);break;
      case 'close-sidebar': ui.mobileSidebarOpen=false;app.querySelector('.app-sidebar')?.classList.remove('mobile-open');app.querySelector('.sidebar-backdrop')?.classList.remove('show');break;
      case 'onboard-step': {const dest=Number(el.dataset.step);if(dest<ui.onboardingStep){ui.onboardingStep=dest;render();}else{let valid=true;for(let i=ui.onboardingStep;i<dest;i++)if(!onboardingValid(i)){valid=false;break;}if(valid){ui.onboardingStep=dest;render();}}break;}
      case 'onboard-back': if(ui.onboardingStep>0){ui.onboardingStep--;render();}break;
      case 'onboard-next': if(ui.onboardingStep<3){if(onboardingValid(ui.onboardingStep)){ui.onboardingStep++;render();}}else await submitCompany();break;
      case 'edit-company': prepareOnboarding(true);await navigate('onboarding');break;
      case 'new-post': ui.editor=blankEditor();ui.editor.channel=ui.company?.channels[0]||'Facebook';ui.previewChannel=ui.editor.channel;variant=0;await navigate('create');break;
      case 'select-channel': ui.editor.channel=el.dataset.channel;ui.previewChannel=el.dataset.channel;render();break;
      case 'preview-channel': ui.previewChannel=el.dataset.channel;document.querySelectorAll('.preview-tab').forEach(x=>{x.classList.toggle('active',x===el);x.setAttribute('aria-pressed',String(x===el));});updatePreviewNode();break;
      case 'use-suggestion': {const suggestion=SUGGESTIONS[Number(el.dataset.index)];if(suggestion){ui.editor.topic=suggestion;$('editor-topic').value=suggestion;syncEditorMetrics();}break;}
      case 'generate': await generate();break;
      case 'variant': if(!ui.editor.topic.trim()){notify('Describe primero el tema de tu publicación.','error');break;}variant++;ui.editor.text=buildCopy(ui.editor,ui.company,variant);$('editor-text').value=ui.editor.text;syncEditorMetrics();updatePreviewNode();notify('Variante preparada.','success');break;
      case 'format-bold': putAtCursor('bold');break;
      case 'format-list': putAtCursor('list');break;
      case 'format-emoji': putAtCursor('emoji');break;
      case 'clear-editor': if(ui.editor.text && !confirm('¿Descartar el texto actual?'))break;ui.editor.text='';if($('editor-text'))$('editor-text').value='';syncEditorMetrics();updatePreviewNode();break;
      case 'copy-text': await copyText();break;
      case 'save-post': await savePost(el.dataset.status);break;
      case 'filter-posts': ui.libraryFilter=el.dataset.filter;document.querySelectorAll('.filter-tabs button').forEach(x=>{x.classList.toggle('active',x===el);x.setAttribute('aria-pressed',String(x===el));});updateLibrary();break;
      case 'edit-post': {const p=findPost(el.dataset.id);if(!p)break;ui.editor={id:p.id,channel:p.channel,objective:p.objective,topic:p.topic,text:p.text,image:postImage(p),status:p.status};ui.previewChannel=p.channel;await navigate('create');break;}
      case 'duplicate-post': {const p=findPost(el.dataset.id);if(!p)break;ui.editor={id:null,channel:p.channel,objective:p.objective,topic:p.topic,text:p.text,image:postImage(p),status:'draft'};ui.previewChannel=p.channel;await navigate('create');notify('Se creó una copia editable. Guárdala para conservarla.','success');break;}
      case 'delete-post': if(!confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.'))break;await api.deletePost(el.dataset.id);ui.posts=await api.posts();updateLibrary();notify('Publicación eliminada.','success');break;
      case 'export-data': await downloadData();break;
      case 'reset-data': if(!confirm('¿Restablecer TODOS los datos de esta demo en este navegador?'))break;await api.resetDemo();clearRememberedPage();ui.avatarDraft=undefined;ui.user=null;ui.company=null;ui.posts=[];ui.editor=blankEditor();await navigate('landing');notify('Se restauraron los datos de prueba.','success');break;
      case 'about': notify('Cuentas y empresas en MySQL. Publicaciones e imágenes guardadas localmente; la generación y las redes sociales son simuladas.');break;
      default: break;
    }
  }catch(error){console.error('ContentAI UI:',error);notify(error.message||'No se pudo completar la acción.','error');}
});
document.addEventListener('keydown', event => {
  if(event.key==='Escape' && ui.mobileSidebarOpen){ui.mobileSidebarOpen=false;app.querySelector('.app-sidebar')?.classList.remove('mobile-open');app.querySelector('.sidebar-backdrop')?.classList.remove('show');}
});

(async () => {
  try {
    await hydrate();
    render();
  } catch (error) {
    console.error('Error recuperando la sesión:', error);
    // Un fallo de red no significa que el usuario cerró sesión: no lo mandamos a la demo.
    app.innerHTML = `<main class="fatal-error" style="padding:40px">
      <h1>No se pudo recuperar tu sesión</h1>
      <p>Comprueba que Apache esté activo y que PHP responda en /Prueba/api/login.php.</p>
      <p>Tu cuenta y tu empresa no se eliminaron. Puedes volver a cargar esta página.</p>
      <a class="btn btn-primary" href="./">Reintentar</a>
    </main>`;
  }
})();
