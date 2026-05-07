// CARDÁPIO
// Exibe itens do menu agrupados por categoria com opções de editar e deletar

// Mapeamento de categorias
const CATEGORY_LABELS = {
  lanches: 'Lanches',
  bebidas: 'Bebidas',
  porções: 'Porções',
  sobremesas: 'Sobremesas',
  outros: 'Outros',
};

function renderMenuPage() {
  // Busca todos os itens ordenados por categoria
  const items = data.MenuItem.list('category');
  
  let html = `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Cardápio</h2>
          <p class="text-sm text-slate-600 mt-1">
            ${items.length} ${items.length === 1 ? 'item' : 'itens'} cadastrados
          </p>
        </div>
        <button id="btnNewItem" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md flex items-center gap-2 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Novo Item
        </button>
      </div>
  `;

  // Se não há itens, mostra mensagem vazia
  if (items.length === 0) {
    html += `
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-20 h-20 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 mb-1">Nenhum item no cardápio</h3>
        <p class="text-sm text-slate-600 mb-6">
          Clique em "Novo Item" para adicionar ao cardápio
        </p>
      </div>
    `;
  } else {
    // Agrupa itens por categoria
    const grouped = items.reduce((acc, item) => {
      const cat = item.category || 'outros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    // Renderiza cada categoria com seus itens
    Object.keys(grouped).forEach(cat => {
      html += `
        <div class="mb-8">
          <h3 class="text-lg font-bold text-slate-900 mb-4">${CATEGORY_LABELS[cat] || cat}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      `;
      
      grouped[cat].forEach(item => {
        html += `
          <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition">
            <div class="flex items-start justify-between mb-2">
              <h4 class="font-bold text-slate-900 flex-1">${item.name}</h4>
              <span class="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">R$ ${item.price.toFixed(2)}</span>
            </div>
            <p class="text-sm text-slate-600 mb-4">${item.category}</p>
            <div class="flex gap-2">
              <button onclick="editMenuItem('${item.id}')" class="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Editar
              </button>
              <button onclick="deleteMenuItem('${item.id}')" class="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Deletar
              </button>
            </div>
          </div>
        `;
      });
      
      html += `</div></div>`;
    });
  }

  html += `</div>`;

  return {
    html,
    afterRender() {
      document.getElementById('btnNewItem').addEventListener('click', () => showMenuItemForm());
    }
  };
}

// Abre diálogo para adicionar ou editar um item
function showMenuItemForm(itemId = null) {
  const item = itemId ? data.MenuItem.get(itemId) : null;
  const isEdit = !!item;

  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  dialog.innerHTML = `
    <div class="bg-white rounded-lg p-6 w-96 shadow-xl max-h-96 overflow-y-auto">
      <h2 class="text-xl font-bold mb-4 text-slate-900">${isEdit ? 'Editar Item' : 'Novo Item'}</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-900 mb-1">Nome</label>
          <input type="text" id="itemName" placeholder="Ex: Coxinha" value="${item?.name || ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-900 mb-1">Preço</label>
          <input type="number" id="itemPrice" placeholder="0.00" step="0.01" value="${item?.price || ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-900 mb-1">Categoria</label>
          <select id="itemCategory" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900">
            ${Object.entries(CATEGORY_LABELS).map(([key, label]) => 
              `<option value="${key}" ${item?.category === key ? 'selected' : ''}>${label}</option>`
            ).join('')}
          </select>
        </div>
      </div>

      <div class="flex gap-3 justify-end mt-6">
        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 hover:bg-slate-50 transition font-medium">
          Cancelar
        </button>
        <button id="btnSaveItem" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium">
          ${isEdit ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);

  // Salva o item novo ou atualizado
  document.getElementById('btnSaveItem').addEventListener('click', () => {
    const name = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const category = document.getElementById('itemCategory').value;

    if (!name || !price) {
      alert('Preencha todos os campos');
      return;
    }

    if (isEdit) {
      data.MenuItem.update(item.id, { name, price, category });
    } else {
      data.MenuItem.create({ name, price, category, active: true });
    }

    dialog.remove();
    const page = document.getElementById('app');
    const result = renderMenuPage();
    page.innerHTML = result.html;
    if (result.afterRender) result.afterRender();
  });
}

// Abre form de edição para um item
function editMenuItem(id) {
  showMenuItemForm(id);
}

// Deleta um item do menu
function deleteMenuItem(id) {
  if (confirm('Tem certeza que deseja deletar este item?')) {
    data.MenuItem.delete(id);
    const page = document.getElementById('app');
    const result = renderMenuPage();
    page.innerHTML = result.html;
    if (result.afterRender) result.afterRender();
  }
}

window.renderMenuPage = renderMenuPage;
window.editMenuItem = editMenuItem;
window.deleteMenuItem = deleteMenuItem;
