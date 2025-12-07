// ---------- script.js (reemplazar por completo) ----------

// Config: usa el cliente supabase ya inicializado en index.html: `supabase`
/*
  Requisitos previos en index.html:
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
*/

const PROGRAMS_DATA = {
  'genesis': { id:'genesis', name:'GÉNESIS', description:'Fundamentos del movimiento.', image:'program_genesis.png', externalUrl:'./Genesis/genesis_n1.html', theme:'genesis' },
  'milon_n1': { id:'milon_n1', name:'MILON - Nivel 1', description:'Construcción de base sólida.', image:'program_milon_strength.png', externalUrl:'./Milon/milon_n1.html', theme:'milon' },
  'afrodita_n1': { id:'afrodita_n1', name:'AFRODITA - Nivel 1', description:'Activación de glúteos y piernas.', image:'program_afrodita_fitness.png', externalUrl:'./Afrodita/afrodita_n1.html', theme:'afrodita' },
  'hercules': { id:'hercules', name:'HÉRCULES', description:'Powerlifting y Fuerza Máxima.', image:'program_hercules.png', externalUrl:'./Hercules/hercules_n1.html', theme:'gold' },
  'kronos': { id:'kronos', name:'KRONOS', description:'Programa +60', image:'program_kronos.png', externalUrl:'#', theme:'gold' },
  'hermes': { id:'hermes', name:'HERMES', description:'Express 30 min', image:'program_hermes.png', externalUrl:'#', theme:'genesis' }
};

let CURRENT_USER = null; // objeto usuario supabase (user.id, user.email, etc)
let PURCHASES = [];      // array de program_id

// --- Inicialización DOM ---
document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
});

async function initApp(){
  await checkSession();
  renderHeader();
  renderMyPrograms(); // render basado en estado local inicial
  setupUiEventHandlers();
}

function setupUiEventHandlers(){
  // Delegación simple para botones dinámicos si hace falta
  document.addEventListener('click', (e) => {
    if(e.target.matches('[data-buy-level]')) {
      const id = e.target.dataset.buyLevel;
      buyLevel(id);
    }
    if(e.target.matches('[data-open-level]')) {
      const id = e.target.dataset.openLevel;
      openLevel(id);
    }
  });
}

// --- Sesión / Auth ---
async function checkSession(){
  try {
    const { data } = await supabase.auth.getSession();
    if (data && data.session && data.session.user) {
      CURRENT_USER = data.session.user;
      await loadPurchasesFromDb();
    } else {
      CURRENT_USER = null;
      PURCHASES = [];
    }
  } catch (err) {
    console.error("checkSession error:", err);
    CURRENT_USER = null;
    PURCHASES = [];
  }
}

async function handleLoginForm(email, password, uiCallbacks = {}) {
  // uiCallbacks: { onStart, onSuccess, onError }
  try {
    if(uiCallbacks.onStart) uiCallbacks.onStart();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    CURRENT_USER = data.user;
    await loadPurchasesFromDb();
    if(uiCallbacks.onSuccess) uiCallbacks.onSuccess(data.user);
    renderHeader();
    renderMyPrograms();
    return { ok: true, user: data.user };
  } catch (err) {
    console.error("Login error:", err);
    if(uiCallbacks.onError) uiCallbacks.onError(err);
    return { ok: false, error: err };
  }
}

async function handleLogout() {
  try {
    await supabase.auth.signOut();
  } catch(e){ console.warn("signOut:", e); }
  CURRENT_USER = null;
  PURCHASES = [];
  renderHeader();
  renderMyPrograms();
}

// --- Compras / Purchases ---
async function loadPurchasesFromDb(){
  if(!CURRENT_USER) { PURCHASES = []; return; }
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('program_id')
      .eq('user_id', CURRENT_USER.id);

    if (error) throw error;
    PURCHASES = (data || []).map(r => r.program_id);
  } catch (err) {
    console.error("loadPurchasesFromDb:", err);
    PURCHASES = [];
  }
}

async function buyLevel(programId){
  if(!CURRENT_USER){
    alert("Debes iniciar sesión para comprar.");
    return;
  }
  // Implementación mínima: insertar fila en purchases
  try {
    const payload = { user_id: CURRENT_USER.id, program_id: programId, created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('purchases').insert([payload]);
    if (error) throw error;
    PURCHASES.push(programId);
    renderMyPrograms();
    alert('Compra registrada correctamente.');
  } catch (err) {
    console.error("buyLevel error:", err);
    alert('Error al registrar compra. Ver consola.');
  }
}

// --- Render general ---
function renderHeader(){
  const headerPlaceholder = document.getElementById('header-placeholder');
  if(!headerPlaceholder) return;
  let navContent = '';
  if(CURRENT_USER){
    const isAdmin = isUserAdmin(CURRENT_USER.email);
    navContent = `
      <div class="flex items-center gap-4">
        <span class="text-sm font-semibold hidden sm:inline">Hola, ${CURRENT_USER.email.split('@')[0]} ${isAdmin ? '(Admin)' : ''}</span>
        <button id="btn-logout-js" class="text-sm font-bold text-red-500 hover:text-red-600">Cerrar Sesión</button>
        <a href="#mis-programas" class="px-4 py-2 rounded-lg bg-accent-vibrant text-black font-bold text-sm">Mis Programas</a>
      </div>
    `;
    // attach logout handler
    setTimeout(() => {
      const btn = document.getElementById('btn-logout-js');
      if(btn) btn.addEventListener('click', () => handleLogout());
    }, 50);
  } else {
    navContent = `<button id="btn-open-login-js" class="px-4 py-2 rounded-lg bg-primary-dark text-white font-bold text-sm hover:bg-gray-800">Iniciar Sesión / Registro</button>`;
    setTimeout(() => {
      const btn = document.getElementById('btn-open-login-js');
      if(btn) btn.addEventListener('click', () => openAuthModal());
    }, 50);
  }

  headerPlaceholder.innerHTML = `
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-oswald font-bold">RM</div>
          <span class="font-oswald font-bold text-xl tracking-tighter">REPETICIÓN MÁXIMA</span>
        </div>
        <nav>${navContent}</nav>
      </div>
    </header>
  `;
}

function renderMyPrograms(){
  const grid = document.getElementById('mis-programas-grid');
  if(!grid) return;

  if(!CURRENT_USER) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p class="text-gray-500 mb-4">Inicia sesión para ver tus programas adquiridos.</p>
        <button onclick="openAuthModal()" class="px-6 py-2 bg-primary-dark text-white rounded-lg font-bold">Ingresar</button>
      </div>`;
    return;
  }

  // Si admin: mostrar todo
  const isAdmin = isUserAdmin(CURRENT_USER.email);
  const listToShow = isAdmin ? Object.keys(PROGRAMS_DATA) : PURCHASES;

  if(!listToShow || listToShow.length === 0){
    grid.innerHTML = `
      <div class="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p class="text-gray-500 mb-4">No tienes programas. Si eres admin puedes forzar la carga.</p>
        <button onclick="openAuthModal()" class="px-6 py-2 bg-accent-vibrant text-black rounded-lg font-bold">Ver Catálogo</button>
      </div>`;
    return;
  }

  grid.innerHTML = listToShow.map(planId => {
    const program = PROGRAMS_DATA[planId] || { name: planId, description: 'Programa adquirido', image:'hero_gym_dark.png' };
    return `
      <div class="program-card bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
        <div class="h-40 bg-gray-200 relative overflow-hidden">
          <img src="${program.image}" onerror="this.src='hero_gym_dark.png'" alt="${program.name}" class="w-full h-full object-cover">
        </div>
        <div class="p-5 flex-1 flex flex-col">
          <h3 class="font-bold text-lg mb-1 font-oswald uppercase">${program.name}</h3>
          <p class="text-sm text-gray-600 mb-4 flex-1">${program.description}</p>
          <div class="mt-auto">
            <button data-open-level="${program.id}" class="w-full py-2 rounded-lg theme-btn">Acceder</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// --- Helpers ---
function isUserAdmin(email){
  if(!email) return false;
  const adminEmails = ['edfmarcoflores@gmail.com']; // puedes añadir aquí más administradores
  return adminEmails.includes(email.toLowerCase());
}

// --- Modal & Auth UI (se usan en index.html) ---
function openAuthModal(){
  // reusar modal del index.html: se espera que index tenga un form con id login-form que haga handleLoginSubmit
  const modal = document.getElementById('login-modal');
  if(modal) modal.style.display = 'flex';
}

function closeLoginModal(){
  const modal = document.getElementById('login-modal');
  if(modal) modal.style.display = 'none';
}

async function handleLoginSubmit(event){
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loader = document.getElementById('login-loader');
  const errorBox = document.getElementById('login-error');

  if(loader) loader.classList.remove('hidden');
  if(errorBox) errorBox.classList.add('hidden');

  const res = await handleLoginForm(email, password, {
    onStart: () => {},
    onSuccess: (user) => {
      closeLoginModal();
      renderHeader();
      renderMyPrograms();
      // abrir dashboard
      setTimeout(() => {
        const dashboard = document.getElementById('user-dashboard-mock');
        if(dashboard) dashboard.style.display = 'block';
      }, 200);
    },
    onError: (err) => {
      if(errorBox) {
        errorBox.innerText = err.message || 'Error al iniciar sesión.';
        errorBox.classList.remove('hidden');
      }
    }
  });

  if(loader) loader.classList.add('hidden');
}

// --- Visor / Abrir nivel (simple redirect por ahora) ---
function openLevel(planId){
  const program = PROGRAMS_DATA[planId];
  if(!program) { alert('Contenido no disponible'); return; }
  if(program.externalUrl && program.externalUrl !== '#'){
    window.location.href = program.externalUrl;
  } else {
    alert('Programa disponible próximamente.');
  }
}

// --------------------------------------------------
// Chatbot: llama a Gemini si configuras API key
// --------------------------------------------------
async function sendChatMessageToGemini(text){
  // Para que esto funcione, debes añadir tu API key directamente en index.html
  // Busca en index.html: const GEMINI_API_KEY = "";
  // y pon tu clave ahí. (Instrucciones abajo)
  try {
    if(typeof GEMINI_API_KEY === 'undefined' || !GEMINI_API_KEY) throw new Error('No API Key');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
    const payload = { contents: [{ role: "user", parts: [{ text }] }] };
    const resp = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    if(!resp.ok) throw new Error('API Error');
    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Respuesta vacía';
  } catch (err) {
    console.warn('Gemini call failed:', err);
    return null;
  }
}

// Fallback local bot (modo offline)
function getLocalBotResponse(text){
  const lower = text.toLowerCase();
  if(lower.includes('precio')) return "Asesoría 1a1: $60k. Programas: $40k.";
  return "Modo offline activo. Pregunta por precios.";
}

// Exponer función global para que index.html pueda usarla en el widget de chat
window.appSendChat = async function(prompt){
  const onlineResp = await sendChatMessageToGemini(prompt);
  if(onlineResp) return onlineResp;
  return getLocalBotResponse(prompt);
};

// --------------------------------------------------
// Útil: recargar estado manualmente
// --------------------------------------------------
window.appReload = async function(){
  await checkSession();
  renderHeader();
  renderMyPrograms();
};
