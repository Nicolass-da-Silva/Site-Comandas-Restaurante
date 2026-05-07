// APLICAÇÃO PRINCIPAL
// Responsável pelo roteamento e renderização das páginas

let currentRoute = '/';

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
