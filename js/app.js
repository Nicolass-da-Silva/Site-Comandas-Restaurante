// APLICAÇÃO PRINCIPAL
// Responsável pelo roteamento e pela limitação de acesso por email

let currentRoute = '/';
const AUTH_STORAGE_KEY = 'sitecomanda:private:authorizedEmail';
const AUTH_STATE_KEY = 'sitecomanda:private:accessState';

function getAppConfig() {
  return window.siteComandaConfig || {};
}

function getAllowedEmails() {
  const access = getAppConfig().access || {};
  const emails = Array.isArray(access.allowedEmails) ? access.allowedEmails : [];
  return emails
    .map((email) => String(email || '').trim().toLowerCase())
    .filter(Boolean);
}

function isPrivateMode() {
  const config = getAppConfig();
  return config.mode !== 'public';
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getStoredAuthorizedEmail() {
  return normalizeEmail(localStorage.getItem(AUTH_STORAGE_KEY));
}

function setStoredAuthorizedEmail(email) {
  localStorage.setItem(AUTH_STORAGE_KEY, normalizeEmail(email));
  localStorage.setItem(AUTH_STATE_KEY, 'authorized');
}

function clearStoredAuthorizedEmail() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_STATE_KEY);
}

function isEmailAllowed(email) {
  const allowedEmails = getAllowedEmails();
  if (allowedEmails.length === 0) {
    return false;
  }
  return allowedEmails.includes(normalizeEmail(email));
}

function isAppAuthorized() {
  if (!isPrivateMode()) {
    return true;
  }

  const storedEmail = getStoredAuthorizedEmail();
  return !!storedEmail && isEmailAllowed(storedEmail);
}

function getAuthorizedEmailLabel() {
  return getStoredAuthorizedEmail() || 'Visitante';
}

function renderAccessDenied(message) {
  const app = document.getElementById('app');
  if (!app) return;

  const allowedEmails = getAllowedEmails();
  const allowedList = allowedEmails.length
    ? `<p class="text-xs text-slate-500 mt-4 break-words">Emails liberados: ${allowedEmails.join(', ')}</p>`
    : '<p class="text-xs text-slate-500 mt-4">Nenhum email foi configurado em js/site-config.js.</p>';

  app.innerHTML = `
    <div class="min-h-[70vh] flex items-center justify-center">
      <div class="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 text-red-700 font-bold mb-4">!</div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Acesso negado</h2>
        <p class="text-sm text-slate-600">${message || 'Seu email não está autorizado neste site.'}</p>
        ${allowedList}
      </div>
    </div>
  `;
}

function renderAccessForm() {
  const app = document.getElementById('app');
  if (!app) return;

  const allowedEmails = getAllowedEmails();
  const helpText = allowedEmails.length
    ? 'Digite o mesmo email que foi liberado no arquivo de configuração.'
    : 'Configure os emails liberados em js/site-config.js antes de usar o acesso privado.';

  app.innerHTML = `
    <div class="min-h-[70vh] flex items-center justify-center">
      <div class="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 font-bold">M</div>
          <div>
            <h2 class="text-2xl font-bold text-slate-900">Acesso por email</h2>
            <p class="text-sm text-slate-600">Somente emails autorizados entram no sistema</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label for="authEmail" class="block text-sm font-medium text-slate-700 mb-2">Email autorizado</label>
            <input id="authEmail" type="email" autocomplete="email" placeholder="voce@dominio.com" class="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button id="btnAuthorizeEmail" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition">
            Entrar
          </button>
          <p class="text-sm text-slate-600">${helpText}</p>
        </div>

        ${allowedEmails.length ? `<p class="text-xs text-slate-500 mt-4 break-words">Liberados: ${allowedEmails.join(', ')}</p>` : ''}
      </div>
    </div>
  `;

  const input = document.getElementById('authEmail');
  const button = document.getElementById('btnAuthorizeEmail');

  const handleSubmit = () => {
    const email = normalizeEmail(input?.value);
    if (!email) {
      renderAccessDenied('Digite um email para continuar.');
      renderAccessForm();
      return;
    }

    if (!isEmailAllowed(email)) {
      clearStoredAuthorizedEmail();
      renderAccessDenied('Este email não está autorizado neste site.');
      renderAccessForm();
      return;
    }

    setStoredAuthorizedEmail(email);
    renderPage();
  };

  if (button) {
    button.addEventListener('click', handleSubmit);
  }

  if (input) {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        handleSubmit();
      }
    });
  }
}

function renderAccessBadge() {
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
      <span class="px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">${getAuthorizedEmailLabel()}</span>
    </div>
  `;
}

function navigateTo(path) {
  window.location.hash = path;
}

function getCurrentRoute() {
  let hash = window.location.hash.slice(1);
  if (!hash) hash = '/';
  return hash;
}

function updateNavLinks() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    const page = link.dataset.page;
    if (page === currentRoute) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function renderPage() {
  if (isPrivateMode() && !isAppAuthorized()) {
    renderAccessForm();
    renderAccessBadge();
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
  updateNavLinks();
  renderAccessBadge();

  if (result.afterRender) {
    result.afterRender();
  }
}

window.addEventListener('hashchange', renderPage);
window.navigateTo = navigateTo;

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

function initApp() {
  if (document.getElementById('backup-controls')) return;
  renderPage();
  renderBackupControls();
}

// Inicialização
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
