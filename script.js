
// Mock Data for Programs and Exercises
const PROGRAMS_DATA = {
  // --- GÉNESIS ---
  'genesis': {
    id: 'genesis',
    name: 'GÉNESIS',
    description: 'Fundamentos del movimiento. Ideal para comenzar.',
    image: 'program_genesis.png',
    externalUrl: '../Genesis/genesis_n1.html',
    theme: 'genesis'
  },
  // --- MILON (Fuerza) ---
  'milon_n1': {
    id: 'milon_n1',
    name: 'MILON - Nivel 1',
    description: 'Construcción de base sólida. Fuerza y técnica.',
    image: 'program_milon_strength.png',
    externalUrl: '../Milon/milon_n1.html',
    theme: 'milon'
  },
  'milon_n2': {
    id: 'milon_n2',
    name: 'MILON - Nivel 2',
    description: 'Intensificación. Aumenta la carga y el volumen.',
    image: 'program_milon_strength.png',
    externalUrl: '../Milon/milon_n2.html',
    theme: 'milon'
  },
  'milon_n3': {
    id: 'milon_n3',
    name: 'MILON - Nivel 3',
    description: 'Fuerza Pura. Rangos de repeticiones más bajos.',
    image: 'program_milon_strength.png',
    externalUrl: '../Milon/milon_n3.html',
    theme: 'milon'
  },
  'milon_n4': {
    id: 'milon_n4',
    name: 'MILON - Nivel 4',
    description: 'Peaking. Maximiza tu rendimiento.',
    image: 'program_milon_strength.png',
    externalUrl: '../Milon/milon_n4.html',
    theme: 'milon'
  },
  // --- AFRODITA (Estética) ---
  'afrodita_n1': {
    id: 'afrodita_n1',
    name: 'AFRODITA - Nivel 1',
    description: 'Activación de glúteos y piernas. Foco técnico.',
    image: 'program_afrodita_fitness.png',
    externalUrl: '../Afrodita/afrodita_n1.html',
    theme: 'afrodita'
  },
  'afrodita_n2': {
    id: 'afrodita_n2',
    name: 'AFRODITA - Nivel 2',
    description: 'Hipertrofia. Volumen moderado, alta tensión.',
    image: 'program_afrodita_fitness.png',
    externalUrl: '../Afrodita/afrodita_n2.html',
    theme: 'afrodita'
  },
  'afrodita_n3': {
    id: 'afrodita_n3',
    name: 'AFRODITA - Nivel 3',
    description: 'Metabólico. Densidad de entrenamiento aumentada.',
    image: 'program_afrodita_fitness.png',
    externalUrl: '../Afrodita/afrodita_n3.html',
    theme: 'afrodita'
  },
  'afrodita_n4': {
    id: 'afrodita_n4',
    name: 'AFRODITA - Nivel 4',
    description: 'Definición y detalle. Alta intensidad.',
    image: 'program_afrodita_fitness.png',
    externalUrl: '../Afrodita/afrodita_n4.html',
    theme: 'afrodita'
  },
  // --- OTROS ---
  'hercules': {
    id: 'hercules',
    name: 'HÉRCULES',
    description: 'Powerlifting y Fuerza Máxima. Periodización avanzada.',
    image: 'program_hercules.png',
    externalUrl: '../Hercules/hercules_n1.html',
    theme: 'gold'
  },
  'kronos': {
    id: 'kronos',
    name: 'KRONOS',
    description: 'Longevidad y funcionalidad para +60.',
    image: 'program_kronos.png',
    externalUrl: '#', // Placeholder
    theme: 'gold'
  },
  'hermes': {
    id: 'hermes',
    name: 'HERMES',
    description: 'Entrenamiento Express 30 min.',
    image: 'program_hermes.png',
    externalUrl: '#', // Placeholder
    theme: 'genesis'
  }
};

// State Management
const state = {
  user: JSON.parse(localStorage.getItem('currentUser')) || null,
  purchases: JSON.parse(localStorage.getItem('userPurchases')) || []
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderHeader();
  renderMyPrograms();
  setupEventListeners();
  checkUrlParams();
}

function checkUrlParams() {
  // Basic check if we need to open a specific modal or section
  const hash = window.location.hash;
  if (hash === '#mis-programas' && state.user) {
    document.getElementById('mis-programas').scrollIntoView();
  }
}

function setupEventListeners() {
  // Buy Buttons
  document.querySelectorAll('.btn-comprar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const planId = e.target.dataset.planId;
      handlePurchase(planId);
    });
  });

  // Levels Toggle
  document.querySelectorAll('.levels-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = e.target.dataset.target;
      const target = document.querySelector(targetId);
      if (target) {
        target.classList.toggle('hidden');
        if (target.style.display === 'none' || !target.style.display) {
          target.style.display = 'block';
        } else {
          target.style.display = 'none';
        }
      }
    });
  });

  // Hide level panels by default
  document.querySelectorAll('.levels-panel').forEach(el => el.style.display = 'none');

  // Close Fullscreen Button
  const closeBtn = document.getElementById('close-fullscreen-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeFullscreenView);
  }
}

function closeFullscreenView() {
  const view = document.getElementById('fullscreen-program-view');
  view.classList.add('hidden');
  view.classList.remove('translate-x-0');
  view.classList.add('translate-x-full');
}

// --- Auth Logic ---

function login(email, password) {
  if (email && password) {
    // Updated requirement: edfmarcoflores@gmail.com is the ONLY superuser
    const isSuperUser = email.toLowerCase() === 'edfmarcoflores@gmail.com';

    const user = {
      email,
      name: email.includes('@') ? email.split('@')[0] : email,
      id: Date.now(),
      isAdmin: isSuperUser
    };

    if (isSuperUser) {
      user.name = "Marco Flores";
    }

    state.user = user;
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Load purchases
    let storedPurchases = [];
    if (isSuperUser) {
      // Admin gets EVERYTHING
      storedPurchases = Object.keys(PROGRAMS_DATA);
    } else {
      const userStore = localStorage.getItem(`purchases_${email}`);
      storedPurchases = userStore ? JSON.parse(userStore) : [];

      // CRITICAL: Filter out junk/invalid programs
      storedPurchases = storedPurchases.filter(id => PROGRAMS_DATA.hasOwnProperty(id));
    }

    state.purchases = storedPurchases;
    localStorage.setItem('userPurchases', JSON.stringify(state.purchases));

    closeModal();
    renderHeader();
    renderMyPrograms();

    // Redirect to My Programs
    const programsSection = document.getElementById('mis-programas');
    if (programsSection) programsSection.scrollIntoView({ behavior: 'smooth' });

  } else {
    alert('Por favor ingresa email y contraseña.');
  }
}

function logout() {
  state.user = null;
  state.purchases = [];
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userPurchases');

  renderHeader();
  renderMyPrograms();

  // Redirect to home
  window.location.hash = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function register(name, email, password) {
  if (name && email && password) {
    // For demo, we just log them in with the name they provided
    if (name === 'Marco Flores') {
      login(name, password);
    } else {
      login(email, password);
    }
  } else {
    alert('Todos los campos son obligatorios.');
  }
}

// --- Purchase Logic ---

function handlePurchase(planId) {
  if (!state.user) {
    openAuthModal();
    return;
  }

  if (state.purchases.includes(planId)) {
    alert('¡Ya tienes este programa! Revisa la sección "Mis Programas".');
    const section = document.getElementById('mis-programas');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  // Simulate purchase process
  const confirmPurchase = confirm(`¿Confirmar compra de ${planId}? (Simulación)`);
  if (confirmPurchase) {
    state.purchases.push(planId);
    localStorage.setItem('userPurchases', JSON.stringify(state.purchases));
    // Also save to user specific storage
    localStorage.setItem(`purchases_${state.user.email}`, JSON.stringify(state.purchases));

    alert('¡Compra exitosa! El programa ha sido añadido a tu cuenta.');
    renderMyPrograms();
    const section = document.getElementById('mis-programas');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }
}

// --- Rendering ---

function renderHeader() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (!headerPlaceholder) return;

  let navContent = '';
  if (state.user) {
    navContent = `
      <div class="flex items-center gap-4">
        <span class="text-sm font-semibold hidden sm:inline">Hola, ${state.user.name} ${state.user.isAdmin ? '(Admin)' : ''}</span>
        <button onclick="logout()" class="text-sm font-bold text-red-500 hover:text-red-600">Cerrar Sesión</button>
        <a href="#mis-programas" class="px-4 py-2 rounded-lg bg-accent-vibrant text-black font-bold text-sm">Mis Programas</a>
      </div>
    `;
  } else {
    navContent = `
      <button onclick="openAuthModal()" class="px-4 py-2 rounded-lg bg-primary-dark text-white font-bold text-sm hover:bg-gray-800">Iniciar Sesión / Registro</button>
    `;
  }

  headerPlaceholder.innerHTML = `
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
           <!-- Logo Placeholder -->
           <div class="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-oswald font-bold">RM</div>
           <span class="font-oswald font-bold text-xl tracking-tighter">REPETICIÓN MÁXIMA</span>
        </div>
        <nav>
          ${navContent}
        </nav>
      </div>
    </header>
  `;
}

function renderMyPrograms() {
  const grid = document.getElementById('mis-programas-grid');
  if (!grid) return;

  if (!state.user) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p class="text-gray-500 mb-4">Inicia sesión para ver tus programas adquiridos.</p>
        <button onclick="openAuthModal()" class="px-6 py-2 bg-primary-dark text-white rounded-lg font-bold">Ingresar</button>
      </div>
    `;
    return;
  }

  if (state.purchases.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p class="text-gray-500 mb-4">Aún no tienes programas. ¡Explora la tienda!</p>
        <a href="#programas" class="px-6 py-2 bg-accent-vibrant text-black rounded-lg font-bold">Ver Catálogo</a>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.purchases.map(planId => {
    const program = PROGRAMS_DATA[planId] || { name: planId, description: 'Programa adquirido', image: 'hero_gym_dark.png', theme: 'default' };
    const imgSrc = program.image || 'hero_gym_dark.png';
    const themeClass = `theme-${program.theme || 'default'}`;

    return `
      <div class="program-card ${themeClass} bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div class="h-40 bg-gray-200 relative overflow-hidden group">
           <img src="${imgSrc}" onerror="this.src='hero_gym_dark.png'" alt="${program.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110">
           <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <button onclick="openProgramDetails('${planId}')" class="px-4 py-2 bg-white text-black font-bold rounded-full transform scale-90 group-hover:scale-100 transition">Ver Entrenamientos</button>
           </div>
        </div>
        <div class="p-5 flex-1 flex flex-col relative content">
          <div class="theme-accent-line absolute top-0 left-0 w-full h-1"></div>
          <h3 class="font-bold text-lg mb-1 font-oswald uppercase tracking-wide">${program.name}</h3>
          <p class="text-sm text-gray-600 mb-4 flex-1">${program.description}</p>
          <button onclick="openProgramDetails('${planId}')" class="theme-btn w-full py-2 rounded-lg text-white font-bold text-sm transition hover:opacity-90">Acceder</button>
        </div>
      </div>
    `;
  }).join('');
}

function openProgramDetails(planId) {
  const program = PROGRAMS_DATA[planId];
  if (!program) {
    alert('Detalles no disponibles para este programa.');
    return;
  }

  // Handle External URL (e.g., Milon 2)
  if (program.externalUrl && program.externalUrl !== '#') {
    window.location.href = program.externalUrl;
    return;
  } else if (program.externalUrl === '#') {
    alert('Este programa estará disponible próximamente.');
    return;
  }

  const view = document.getElementById('fullscreen-program-view');
  const content = document.getElementById('fullscreen-content');

  if (!view || !content) return;

  // Populate Content
  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="flex flex-col md:flex-row gap-8 mb-8">
        <div class="md:w-1/3">
           <img src="${program.image || 'hero_gym_dark.png'}" alt="${program.name}" class="w-full rounded-xl shadow-lg">
        </div>
        <div class="md:w-2/3">
          <h1 class="text-4xl md:text-5xl font-extrabold font-oswald mb-4 text-primary-dark">${program.name}</h1>
          <p class="text-xl text-gray-600 mb-6">${program.description}</p>
          <div class="flex gap-4">
             <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">Nivel 1</span>
             <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">Duración: 4 Semanas</span>
          </div>
        </div>
      </div>

      <div class="border-t pt-8">
        <h2 class="text-3xl font-bold font-oswald mb-6">Plan de Entrenamiento - Semana 1</h2>
        <div class="space-y-4">
          ${program.exercises && program.exercises.length > 0 ? program.exercises.map(ex => `
            <div class="exercise-item bg-gray-50 rounded-xl p-4 hover:bg-white hover:shadow-md transition">
              <img src="${ex.image}" onerror="this.src='hero_gym_dark.png'" alt="${ex.name}" class="exercise-img shadow-sm">
              <div class="flex-1">
                <h4 class="text-xl font-bold text-primary-dark mb-1">${ex.name}</h4>
                <p class="text-gray-500 text-sm mb-2">Enfoque en técnica y control.</p>
                <div class="flex gap-4 text-sm text-gray-700">
                  <span class="bg-white px-3 py-1 rounded border">Sets: <strong>${ex.sets}</strong></span>
                  <span class="bg-white px-3 py-1 rounded border">Reps: <strong>${ex.reps}</strong></span>
                </div>
              </div>
            </div>
          `).join('') : '<p class="text-gray-500 italic">Contenido en desarrollo o disponible en formato PDF descargable.</p>'}
        </div>
      </div>
    </div>
    `;

  view.classList.remove('hidden');
  // Small delay to allow display:block to apply before transition
  setTimeout(() => {
    view.classList.remove('translate-x-full');
    view.classList.add('translate-x-0');
  }, 10);
}

// Mock Modal Functions
function openAuthModal() {
  const modalPlaceholder = document.getElementById('modal-placeholder');
  if (!modalPlaceholder) return;

  modalPlaceholder.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>
        <h2 class="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
        <div class="space-y-4">
          <input type="text" id="login-email" placeholder="Email" class="w-full px-4 py-3 border rounded-lg">
          <input type="password" id="login-password" placeholder="Contraseña" class="w-full px-4 py-3 border rounded-lg">
          <button onclick="login(document.getElementById('login-email').value, document.getElementById('login-password').value)" class="w-full py-3 rounded-lg bg-primary-dark text-white font-bold">Entrar</button>
        </div>
        <p class="mt-4 text-center text-sm text-gray-500">¿No tienes cuenta? <a href="#" class="text-accent-vibrant font-bold">Regístrate</a></p>
      </div>
    </div>
    `;
}

function closeModal() {
  const modalPlaceholder = document.getElementById('modal-placeholder');
  if (modalPlaceholder) modalPlaceholder.innerHTML = '';
}

function calc1RM() {
  const w = parseFloat(document.getElementById('rm-peso').value);
  const r = parseInt(document.getElementById('rm-reps').value);
  if (w && r) {
    const rm = Math.round(w * (1 + r / 30));
    document.getElementById('rm-res').innerHTML = `Tu 1RM estimado es: <strong>${rm} kg</strong>`;
  }
}

function generateQuickRoutine() {
  const routines = [
    "Sentadilla 3x5, Press Banca 3x5, Remo Pendlay 3x8",
    "Peso Muerto 1x5, Press Militar 3x5, Dominadas 3xFall",
    "Sentadilla Frontal 3x8, Fondos 3x10, Curl Barra 3x12"
  ];
  const random = routines[Math.floor(Math.random() * routines.length)];
  document.getElementById('routine-res').innerText = random;
}
