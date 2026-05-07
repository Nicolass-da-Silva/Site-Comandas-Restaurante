// Aplicação principal - Roteamento e renderização
let currentRoute = '/';

function navigateTo(path) {
  window.location.hash = path;
}

function getCurrentRoute() {
  let hash = window.location.hash.slice(1); // Remove #
  if (!hash) hash = '/';
  return hash;
}

function renderPage() {
  const route = getCurrentRoute();
  currentRoute = route;
  
  const app = document.getElementById('app');
  if (!app) return;

  let result = null;

  // Roteamento
  if (route === '/') {
    result = renderTablesPage();
  } else if (route === '/cardapio') {
    result = renderMenuPage();
  } else if (route === '/historico') {
    result = renderHistoryPage();
  } else if (route.startsWith('/mesa/')) {
    const tableId = route.slice(6); // Remove '/mesa/'
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

  // Renderizar
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
});

// Se a página já carregou antes do script executar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderPage);
} else {
  renderPage();
}

window.navigateTo = navigateTo;
