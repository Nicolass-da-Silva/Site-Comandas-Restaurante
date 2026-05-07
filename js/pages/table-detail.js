// DETALHES DA MESA
// Exibe itens da mesa com opções de adicionar/remover itens e fechar/deletar mesa

function renderTableDetailPage(tableId) {
  const order = data.TableOrder.get(tableId);
  
  // Se a mesa não existe, mostra mensagem
  if (!order) {
    return {
      html: `
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <h2 class="text-2xl font-bold text-slate-900 mb-2">Mesa não encontrada</h2>
          <p class="text-slate-600 mb-6">Volte para a lista de mesas</p>
          <button onclick="navigateTo('/')" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg">
            Voltar
          </button>
        </div>
      `
    };
  }

  const items = order.items || [];
  const total = order.total || 0;
  const allMenuItems = data.MenuItem.list();

  let html = `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <button onclick="navigateTo('/')" class="text-blue-600 hover:text-blue-700 font-medium mb-2 flex items-center gap-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Voltar
          </button>
          <h2 class="text-3xl font-bold text-slate-900">Mesa ${order.table_number}</h2>
          <p class="text-sm text-slate-600 mt-1">
            Aberta há ${getTimeSinceOpen(order.created_date)}
          </p>
        </div>
        <button id="btnCloseTable" class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Fechar Mesa
        </button>
        <button id="btnDeleteTable" class="bg-slate-300 hover:bg-slate-400 text-slate-900 font-medium py-2 px-6 rounded-lg flex items-center gap-2" title="Deletar esta mesa">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Deletar
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-slate-900">Items Pedidos</h3>
              <button id="btnAddItem" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-4 rounded-lg text-sm flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Adicionar
              </button>
            </div>

            ${items.length === 0 ? `
              <div class="text-center py-8 text-slate-600">
                <p class="mb-4">Nenhum item adicionado ainda</p>
                <button id="btnAddItemEmpty" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                  Adicionar Item
                </button>
              </div>
            ` : `
              <div class="space-y-2">
                ${items.map((item, idx) => `
                  <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div class="flex-1">
                      <p class="font-medium text-slate-900">${item.name}</p>
                      <p class="text-sm text-slate-600">R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <div class="flex items-center gap-3">
                      <p class="font-bold text-slate-900">R$ ${(item.price * item.quantity).toFixed(2)}</p>
                      <button onclick="removeItemFromOrder('${tableId}', ${idx})" class="text-red-600 hover:text-red-700 p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- Resumo e opções de pagamento -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg border border-slate-200 p-6 sticky top-24">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Resumo</h3>
            <div class="space-y-3 mb-4 pb-4 border-b border-slate-200">
              <div class="flex justify-between">
                <span class="text-slate-600">Items:</span>
                <span class="font-medium text-slate-900">${items.length}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Subtotal:</span>
                <span class="font-medium text-slate-900">R$ ${total.toFixed(2)}</span>
              </div>
            </div>
            <div class="flex justify-between mb-6">
              <span class="text-lg font-bold text-slate-900">Total:</span>
              <span class="text-2xl font-bold text-blue-600">R$ ${total.toFixed(2)}</span>
            </div>
            <button id="btnPayTable" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition" ${items.length === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Pagar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    html,
    afterRender() {
      const btnAddItem = document.getElementById('btnAddItem');
      const btnAddItemEmpty = document.getElementById('btnAddItemEmpty');
      const btnCloseTable = document.getElementById('btnCloseTable');
      const btnDeleteTable = document.getElementById('btnDeleteTable');
      const btnPayTable = document.getElementById('btnPayTable');

      if (btnAddItem) btnAddItem.addEventListener('click', () => showAddItemDialog(tableId, allMenuItems));
      if (btnAddItemEmpty) btnAddItemEmpty.addEventListener('click', () => showAddItemDialog(tableId, allMenuItems));
      if (btnCloseTable) btnCloseTable.addEventListener('click', () => closeTableConfirm(tableId));
      if (btnDeleteTable) btnDeleteTable.addEventListener('click', () => deleteTableConfirm(tableId));
      if (btnPayTable) btnPayTable.addEventListener('click', () => payTableConfirm(tableId));
    }
  };
}

// Calcula o tempo decorrido desde a abertura da mesa
function getTimeSinceOpen(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}min`;
  return `${minutes}min`;
}

// Abre diálogo para selecionar um item do cardápio
function showAddItemDialog(tableId, allMenuItems) {
  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  dialog.innerHTML = `
    <div class="bg-white rounded-lg p-6 w-96 shadow-xl max-h-96 overflow-y-auto">
      <h2 class="text-xl font-bold mb-4 text-slate-900">Adicionar Item</h2>
      
      <div class="space-y-2 mb-4">
        ${allMenuItems.map(item => `
          <button onclick="addItemToOrder('${tableId}', '${item.id}', this)" class="w-full text-left px-3 py-3 border border-slate-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition" data-item-id="${item.id}" data-item-name="${item.name}" data-item-price="${item.price}">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium text-slate-900">${item.name}</p>
                <p class="text-sm text-slate-600">${item.category}</p>
              </div>
              <p class="font-bold text-slate-900">R$ ${item.price.toFixed(2)}</p>
            </div>
          </button>
        `).join('')}
      </div>

      <div class="flex gap-3 justify-end">
        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 hover:bg-slate-50 transition font-medium">
          Fechar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
}

// Adiciona um item ao pedido da mesa
function addItemToOrder(tableId, menuItemId, button) {
  const order = data.TableOrder.get(tableId);
  const menuItem = data.MenuItem.get(menuItemId);
  
  if (!order || !menuItem) return;

  // Se o item já existe, incrementa quantidade
  const existingItem = order.items.find(i => i.id === menuItemId);
  
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    order.items.push({
      id: menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1
    });
  }

  // Recalcula o total
  order.total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  data.TableOrder.update(tableId, {
    items: order.items,
    total: order.total
  });

  // Fecha diálogo e re-renderiza página
  document.querySelector('.fixed').remove();
  const page = document.getElementById('app');
  const result = renderTableDetailPage(tableId);
  page.innerHTML = result.html;
  if (result.afterRender) result.afterRender();
}

// Remove um item do pedido
function removeItemFromOrder(tableId, itemIndex) {
  const order = data.TableOrder.get(tableId);
  if (!order) return;

  order.items.splice(itemIndex, 1);
  order.total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  data.TableOrder.update(tableId, {
    items: order.items,
    total: order.total
  });

  // Re-renderiza página
  const page = document.getElementById('app');
  const result = renderTableDetailPage(tableId);
  page.innerHTML = result.html;
  if (result.afterRender) result.afterRender();
}

// Fecha a mesa e marca como histórico
function closeTableConfirm(tableId) {
  if (confirm('Tem certeza que deseja fechar esta mesa?')) {
    const order = data.TableOrder.get(tableId);
    data.TableOrder.update(tableId, { status: 'closed', closed_date: Date.now() });
    navigateTo('/');
  }
}

// Abre diálogo para confirmar deleção da mesa
function deleteTableConfirm(tableId) {
  const order = data.TableOrder.get(tableId);
  if (!order) return;

  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  dialog.innerHTML = `
    <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
      <h2 class="text-xl font-bold mb-2 text-slate-900">Deletar Mesa?</h2>
      <p class="text-slate-600 mb-6">
        Tem certeza que deseja deletar a <strong>Mesa ${order.table_number}</strong>? 
        Esta ação não pode ser desfeita.
      </p>
      ${order.items && order.items.length > 0 ? `
        <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p class="text-sm text-red-800">
            <strong>Atenção:</strong> Esta mesa possui ${order.items.length} item(ns) adicionado(s). Ao deletar, esses items serão perdidos.
          </p>
        </div>
      ` : ''}
      <div class="flex gap-3 justify-end">
        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 hover:bg-slate-50 transition font-medium">
          Cancelar
        </button>
        <button id="btnConfirmDelete" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium">
          Deletar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);

  // Confirma a deletação
  document.getElementById('btnConfirmDelete').addEventListener('click', () => {
    data.TableOrder.delete(tableId);
    dialog.remove();
    navigateTo('/');
  });
}

// Processa o pagamento da mesa
function payTableConfirm(tableId) {
  const order = data.TableOrder.get(tableId);
  if (order.items.length === 0) {
    alert('Adicione items antes de pagar');
    return;
  }
  
  if (confirm(`Confirmar pagamento de R$ ${order.total.toFixed(2)}?`)) {
    data.TableOrder.update(tableId, { status: 'closed', closed_date: Date.now() });
    alert('Mesa fechada com sucesso!');
    navigateTo('/');
  }
}

window.renderTableDetailPage = renderTableDetailPage;
window.removeItemFromOrder = removeItemFromOrder;
window.addItemToOrder = addItemToOrder;
