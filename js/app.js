// APLICAÇÃO PRINCIPAL
// Responsável pelo roteamento e renderização das páginas

let currentRoute = '/';
let authReady = false;
let authGateRendered = false;

function isNetlifyIdentityAvailable() {
  return typeof window.netlifyIdentity !== 'undefined';
}

function isAppAuthorized() {
  if (data && data.auth && typeof data.auth.isAuthenticated === 'function') {
    return data.auth.isAuthenticated();
  }
  return !!localStorage.getItem('sitecomanda:token');
}

function getAuthenticatedUserLabel() {
  const user = data && data.auth && typeof data.auth.getUser === 'function' ? data.auth.getUser() : null;
  return user?.email || user?.name || 'Usuário autenticado';
}

function ensureAuthGate() {
  const app = document.getElementById('app');
  if (!app) return;

  if (authGateRendered) return;
  authGateRendered = true;

  const identityReady = isNetlifyIdentityAvailable();
  const hasAccess = isAppAuthorized();

  if (hasAccess) {
    authReady = true;
    return;
  }

  app.innerHTML = `
    <div class="min-h-[70vh] flex items-center justify-center">
      <div class="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 font-bold">M</div>
          <div>
            <h2 class="text-2xl font-bold text-slate-900">Acesso restrito</h2>
            <p class="text-sm text-slate-600">Somente usuários autorizados podem entrar</p>
          </div>
        </div>

        <div class="space-y-4 text-sm text-slate-700 mb-6">
          <p>Este site foi bloqueado para acesso público. Para entrar, use um login autorizado pelo administrador.</p>
          <p>\${identityReady ? 'O acesso está configurado via Netlify Identity e convites por e-mail.' : 'O Netlify Identity não foi encontrado. Ative o recurso no painel do Netlify para usar convites por e-mail.'}</p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <button id="btnOpenLogin" class="px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Entrar</button>
          <button id="btnRefreshAuth" class="px-4 py-3 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition">Verificar acesso</button>
        </div>

        <p class="mt-4 text-xs text-slate-500">Se você quiser uma barreira forte, convide apenas os e-mails autorizados no Netlify e remova o acesso público do site.</p>
      </div>
    </div>
  `;

  const btnOpenLogin = document.getElementById('btnOpenLogin');
  const btnRefreshAuth = document.getElementById('btnRefreshAuth');

  if (btnOpenLogin) {
    btnOpenLogin.addEventListener('click', () => {
      if (!identityReady) {
        alert('Ative o Netlify Identity no painel do Netlify para usar login por convite.');
        return;
      }
      window.netlifyIdentity.open('login');
    });
  }

  if (btnRefreshAuth) {
    btnRefreshAuth.addEventListener('click', () => {
      authGateRendered = false;
      renderPage();
    });
  }
}

function renderAuthBadge() {
  const nav = document.querySelector('nav .flex.items-center.justify-between');
  if (!nav) return;

  let badge = document.getElementById('authBadge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'authBadge';
    badge.className = 'ml-4 flex items-center gap-2';
    nav.appendChild(badge);
  }

  if (!isAppAuthorized()) {
    badge.innerHTML = '';
    return;
  }

  badge.innerHTML = `
    <div class="flex items-center gap-2 text-sm text-slate-600">
      <span class="px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">\${getAuthenticatedUserLabel()}</span>
      <button id="btnLogout" class="px-3 py-1 rounded-lg border border-slate-300 text-slate-900 hover:bg-slate-50 transition">Sair</button>
    </div>
  `;

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (isNetlifyIdentityAvailable() && window.netlifyIdentity.currentUser()) {
        window.netlifyIdentity.logout();
      }
      localStorage.removeItem('sitecomanda:token');
      localStorage.removeItem('sitecomanda:user');
      authGateRendered = false;
      renderPage();
    });
  }
}

function setupAuthListeners() {
  if (!isNetlifyIdentityAvailable() || window.__siteComandaAuthListeners) return;
  window.__siteComandaAuthListeners = true;

  window.netlifyIdentity.on('init', (user) => {
    if (user) {
      localStorage.setItem('sitecomanda:token', `netlify-\${user.id || 'user'}`);
      localStorage.setItem('sitecomanda:user', JSON.stringify({
        id: user.id || 'user',
        name: user.user_metadata?.full_name || user.email || 'Usuário',
        email: user.email || ''
      }));
    }
    authReady = true;
    authGateRendered = false;
    renderPage();
  });

  window.netlifyIdentity.on('login', (user) => {
    localStorage.setItem('sitecomanda:token', `netlify-\${user.id || 'user'}`);
    localStorage.setItem('sitecomanda:user', JSON.stringify({
      id: user.id || 'user',
      name: user.user_metadata?.full_name || user.email || 'Usuário',
      email: user.email || ''
    }));
    authReady = true;
    authGateRendered = false;
    renderPage();
  });

  window.netlifyIdentity.on('logout', () => {
    localStorage.removeItem('sitecomanda:token');
    localStorage.removeItem('sitecomanda:user');
    authReady = false;
    authGateRendered = false;
    renderPage();
  });
}

// Muda para uma rota diferente (atualiza o hash da URL)
function navigateTo(path) {
  window.location.hash = path;
}

// Obtém a rota atual pela URL
function getCurrentRoute() {
  let hash = window.location.hash.slice(1);
  if (!hash) hash = '/';
  return hash;
}

// Renderiza a página baseado na rota
function renderPage() {
  if (!authReady && isNetlifyIdentityAvailable()) {
    setupAuthListeners();
    window.netlifyIdentity.init();
    const identityUser = window.netlifyIdentity.currentUser();
    if (identityUser) {
      localStorage.setItem('sitecomanda:token', `netlify-\${identityUser.id || 'user'}`);
      localStorage.setItem('sitecomanda:user', JSON.stringify({
        id: identityUser.id || 'user',
        name: identityUser.user_metadata?.full_name || identityUser.email || 'Usuário',
        email: identityUser.email || ''
      }));
    }
    authReady = true;
  }

  if (!isAppAuthorized()) {
    ensureAuthGate();
    renderAuthBadge();
    return;
  }

  const route = getCurrentRoute();
  currentRoute = route;
  
  const app = document.getElementById('app');
  if (!app) return;

  let result = null;

  if (route === '/') {
    result = renderTablesPage();
  } else if (route === '/cardapio') {
    result = renderMenuPage();
  } else if (route === '/historico') {
    result = renderHistoryPage();
  } else if (route.startsWith('/mesa/')) {
    const tableId = route.slice(6);
    result = renderTableDetailPage(tableId);
  } else {
    result = {
      html: `
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <h2 class="text-2xl font-bold text-slate-900 mb-2">Página não encontrada</h2>
          <p class="text-slate-600 mb-6">A página que você procura não existe</p>
          <button onclick="navigateTo('/')" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg">
            Voltar para Home
          </button>
        </div>
      `
    };
  }

  app.innerHTML = result.html;

  // Atualizar nav links ativos
  updateNavLinks();

  // Executar callback pós-renderização
  renderAuthBadge();
  if (result.afterRender) {
    result.afterRender();
  }
}

function updateNavLinks() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const page = link.dataset.page;
    if (page === currentRoute) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Event listeners
window.addEventListener('hashchange', renderPage);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  renderPage();
  // Adiciona controles de backup/import
  renderBackupControls();
});

// Se a página já carregou antes do script executar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderPage);
} else {
  renderPage();
}

window.navigateTo = navigateTo;

// Renderiza controles de Export/Import de backup (download/upload JSON)
function renderBackupControls() {
  if (document.getElementById('backup-controls')) return;

  const container = document.createElement('div');
  container.id = 'backup-controls';
  container.style = 'position:fixed;right:12px;bottom:12px;z-index:60;';
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-2 flex gap-2 items-center">
      <button id="btnExportBackup" class="px-3 py-1 bg-slate-800 text-white rounded">Exportar</button>
      <button id="btnImportBackup" class="px-3 py-1 bg-slate-600 text-white rounded">Importar</button>
      <input id="backupFileInput" type="file" accept="application/json" style="display:none" />
    </div>
  `;

  document.body.appendChild(container);

  document.getElementById('btnExportBackup').addEventListener('click', () => {
    try {
      const backup = data.exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitecomanda-backup.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Erro ao gerar backup: ' + e.message);
    }
  });

  document.getElementById('btnImportBackup').addEventListener('click', () => {
    document.getElementById('backupFileInput').click();
  });

  document.getElementById('backupFileInput').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const obj = JSON.parse(evt.target.result);
        data.importBackup(obj, { merge: true });
        alert('Backup importado com sucesso. Atualizando a página.');
        renderPage();
      } catch (err) {
        alert('Arquivo inválido: ' + err.message);
      }
    };
    reader.readAsText(file);
  });
}
