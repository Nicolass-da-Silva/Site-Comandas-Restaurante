// DETALHES DA MESA
// Exibe itens da mesa com opções de adicionar/remover itens e fechar/deletar mesa

const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Crédito' },
];

function getPaymentMethodLabel(method) {
  const found = PAYMENT_METHODS.find(item => item.value === method);
  return found ? found.label : 'Não informado';
}

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
  const paidAmount = order.paidAmount || 0;
  const payments = Array.isArray(order.payments) ? order.payments : [];
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
          <h2 class="text-3xl font-bold text-slate-900">${order.table_name ? order.table_name + ' · Mesa ' + order.table_number : 'Mesa ' + order.table_number}</h2>
          <p class="text-sm text-slate-600 mt-1"><button onclick="editTableName('${order.id}')" class="text-xs text-blue-600 underline">Editar nome</button></p>
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
                        <p class="text-sm text-slate-600">${(() => { const paid = getPaidQty(order, item.id); const rem = Math.max(0, (item.quantity||0) - paid); return `R$ ${item.price.toFixed(2)} x ${item.quantity}${rem>0 ? ' (rest: '+rem+')' : ' (pago)'}` })()}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2">
                          <button class="px-2 py-1 bg-slate-100 rounded" onclick="changeOrderItemQuantity('${tableId}', ${idx}, -1)">-</button>
                          <span class="text-sm text-slate-700">${item.quantity}</span>
                          <button class="px-2 py-1 bg-slate-100 rounded" onclick="changeOrderItemQuantity('${tableId}', ${idx}, 1)">+</button>
                        </div>
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
              <div class="flex justify-between">
                <span class="text-slate-600">Pago:</span>
                <span class="font-medium text-slate-900">R$ ${paidAmount.toFixed(2)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Restante:</span>
                <span class="font-medium text-slate-900">R$ ${(Math.max(0, total - paidAmount)).toFixed(2)}</span>
              </div>
            </div>
            <div class="flex justify-between mb-6">
              <span class="text-lg font-bold text-slate-900">Total:</span>
              <span class="text-2xl font-bold text-blue-600">R$ ${total.toFixed(2)}</span>
            </div>
            ${payments.length > 0 ? `
              <div class="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p class="text-sm font-semibold text-slate-900 mb-2">Pagamentos salvos</p>
                <div class="space-y-2 max-h-48 overflow-auto pr-1">
                  ${payments.slice().reverse().map(payment => `
                    <div class="text-sm bg-white border border-slate-200 rounded-lg p-2">
                      <div class="flex items-center justify-between gap-2">
                        <span class="font-medium text-slate-900">${getPaymentMethodLabel(payment.method)} · ${payment.mode === 'full' ? 'Mesa toda' : 'Parcelado'}</span>
                        <span class="font-semibold text-slate-900">R$ ${(payment.amount || 0).toFixed(2)}</span>
                      </div>
                      <p class="text-xs text-slate-500 mt-1">${new Date(payment.date || Date.now()).toLocaleString('pt-BR')}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
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
      if (btnCloseTable) btnCloseTable.addEventListener('click', () => payTableConfirm(tableId));
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
  // Agrupa categorias e renderiza dropdown para filtragem + controle de quantidade por item
  const categories = Array.from(new Set(allMenuItems.map(i => i.category || 'outros')));

  dialog.innerHTML = `
    <div class="bg-white rounded-lg p-8 w-11/12 max-w-3xl shadow-xl max-h-[80vh] overflow-y-auto">
      <h2 class="text-xl font-bold mb-4 text-slate-900">Adicionar Item</h2>
      <div class="mb-3">
        <label class="text-sm text-slate-600">Categoria</label>
        <select id="dialogCategorySelect" onchange="filterDialogByCategory(this.value)" class="w-full px-3 py-2 border border-slate-300 rounded-lg mt-1">
          <option value="all">Todas</option>
          ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div id="dialogItems" class="space-y-2 mb-4">
        ${allMenuItems.map(item => `
          <div class="dialog-item" data-category="${item.category}">
            <div class="flex items-center gap-4 py-3 border-b border-slate-100">
              <div class="flex-1">
                <p class="text-lg font-semibold text-slate-900">${item.name}</p>
                <p class="text-sm text-slate-600 mt-1">${item.category}</p>
              </div>
              <div class="flex items-center gap-3">
                <button class="px-3 py-1 bg-slate-100 rounded text-lg" onclick="changeDialogQty(this, -1)">-</button>
                <span class="dialog-qty px-3 text-base font-medium">1</span>
                <button class="px-3 py-1 bg-slate-100 rounded text-lg" onclick="changeDialogQty(this, 1)">+</button>
                <button onclick="addItemToOrder('${tableId}', '${item.id}', this, parseInt(this.closest(\'.dialog-item\').querySelector('.dialog-qty').innerText || '1'))" class="ml-4 px-4 py-2 bg-blue-600 text-white rounded">Adicionar</button>
                <p class="font-bold text-slate-900 ml-4">R$ ${item.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
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

// Filtra itens no diálogo por categoria
function filterDialogByCategory(category) {
  const container = document.getElementById('dialogItems');
  if (!container) return;
  Array.from(container.querySelectorAll('.dialog-item')).forEach(el => {
    const cat = el.dataset.category || 'outros';
    el.style.display = (category === 'all' || category === cat) ? '' : 'none';
  });
}

// Aumenta/diminui quantidade exibida no diálogo
function changeDialogQty(button, delta) {
  const item = button.closest('.dialog-item');
  if (!item) return;
  const span = item.querySelector('.dialog-qty');
  let qty = parseInt(span.innerText || '1');
  qty = Math.max(1, qty + delta);
  span.innerText = qty;
}

// Adiciona um item ao pedido da mesa
function addItemToOrder(tableId, menuItemId, button, quantity = 1) {
  const order = data.TableOrder.get(tableId);
  const menuItem = data.MenuItem.get(menuItemId);
  
  if (!order || !menuItem) return;

  quantity = parseInt(quantity) || 1;

  // Se o item já existe, incrementa quantidade
  const existingItem = order.items.find(i => i.id === menuItemId);
  
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + quantity;
  } else {
    order.items.push({
      id: menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: quantity
    });
  }

  // Recalcula o total
  order.total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Fecha automaticamente se já tiver sido pago integralmente
  if ((order.paidAmount || 0) >= order.total) {
    order.status = 'closed';
    order.closed_date = Date.now();
  }

  data.TableOrder.update(tableId, {
    items: order.items,
    total: order.total,
    paidAmount: order.paidAmount,
    payments: order.payments,
    status: order.status,
    closed_date: order.closed_date
  });

  // Fecha diálogo e re-renderiza página
  const fixed = document.querySelector('.fixed');
  if (fixed) fixed.remove();
  const page = document.getElementById('app');
  const result = renderTableDetailPage(tableId);
  page.innerHTML = result.html;
  if (result.afterRender) result.afterRender();
}

// Muda a quantidade de um item já adicionado na comanda
function changeOrderItemQuantity(tableId, itemIndex, delta) {
  const order = data.TableOrder.get(tableId);
  if (!order) return;
  const item = order.items[itemIndex];
  if (!item) return;
  item.quantity = Math.max(0, (item.quantity || 1) + delta);
  if (item.quantity === 0) {
    order.items.splice(itemIndex, 1);
  }
  order.total = order.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  if ((order.paidAmount || 0) >= order.total) {
    order.status = 'closed';
    order.closed_date = Date.now();
  }
  data.TableOrder.update(tableId, { items: order.items, total: order.total, paidAmount: order.paidAmount, payments: order.payments, status: order.status, closed_date: order.closed_date });

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
  if ((order.paidAmount || 0) >= order.total) {
    order.status = 'closed';
    order.closed_date = Date.now();
  }
  data.TableOrder.update(tableId, {
    items: order.items,
    total: order.total,
    paidAmount: order.paidAmount,
    payments: order.payments,
    status: order.status,
    closed_date: order.closed_date
  });

  // Re-renderiza página
  const page = document.getElementById('app');
  const result = renderTableDetailPage(tableId);
  page.innerHTML = result.html;
  if (result.afterRender) result.afterRender();
}

// Fecha a mesa e marca como histórico
// Retorna quantas unidades de um item já foram pagas (somando pagamentos)
function getPaidQty(order, itemId) {
  if (!order || !Array.isArray(order.payments)) return 0;
  return order.payments.reduce((sum, p) => {
    if (!Array.isArray(p.items)) return sum;
    const it = p.items.find(i => i.id === itemId);
    return sum + (it ? (it.qty || 0) : 0);
  }, 0);
}

// Editar nome da mesa
function editTableName(tableId) {
  const order = data.TableOrder.get(tableId);
  if (!order) return;
  const name = prompt('Nome da mesa (vazio para remover):', order.table_name || '');
  if (name === null) return; // cancel
  const v = (name || '').trim() || null;
  data.TableOrder.update(tableId, { table_name: v });
  const page = document.getElementById('app');
  const result = renderTableDetailPage(tableId);
  page.innerHTML = result.html;
  if (result.afterRender) result.afterRender();
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
        Tem certeza que deseja deletar a <strong>${order.table_name ? order.table_name : 'Mesa ' + order.table_number}</strong>? 
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
  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

  const remainingTotal = Math.max(0, (order.total || 0) - (order.paidAmount || 0));
  const isFullyPaid = remainingTotal <= 0;

  dialog.innerHTML = `
    <div class="bg-white rounded-lg p-6 w-[28rem] shadow-xl max-h-[85vh] overflow-auto">
      <h2 class="text-xl font-bold mb-2 text-slate-900">Pagamento - Mesa ${order.table_number}</h2>
      <p class="text-sm text-slate-600 mb-3">Total restante: R$ ${remainingTotal.toFixed(2)}</p>
      <div class="mb-4">
        <label class="text-sm font-medium text-slate-700 block mb-1">Modo</label>
        <select id="paymentModeSelect" class="w-full px-3 py-2 border border-slate-300 rounded-lg">
          <option value="full" ${isFullyPaid ? 'selected' : ''}>Mesa toda</option>
          <option value="partial" ${isFullyPaid ? '' : 'selected'}>Parcelado</option>
        </select>
      </div>
      <div class="mb-4">
        <label class="text-sm font-medium text-slate-700 block mb-1">Forma de pagamento</label>
        <select id="paymentMethodSelect" class="w-full px-3 py-2 border border-slate-300 rounded-lg">
          ${PAYMENT_METHODS.map(method => `<option value="${method.value}">${method.label}</option>`).join('')}
        </select>
      </div>
      <div class="space-y-2 mb-3" id="payItemsList">
        ${order.items.map((it, idx) => {
          const paid = getPaidQty(order, it.id);
          const remaining = Math.max(0, (it.quantity || 0) - paid);
          return `
            <div class="flex items-center justify-between p-2 border-b border-slate-100">
              <div class="flex-1">
                <label class="inline-flex items-center gap-2">
                  <input type="checkbox" data-idx="${idx}" ${remaining === 0 ? 'disabled' : ''} />
                  <span class="font-medium">${it.name}</span>
                  <small class="text-slate-500"> R$ ${it.price.toFixed(2)}</small>
                </label>
              </div>
              <div class="flex items-center gap-2">
                <input type="number" min="1" max="${remaining}" value="${remaining}" class="w-20 px-2 py-1 border rounded qty-pay" data-idx="${idx}" ${remaining === 0 ? 'disabled' : ''} />
              </div>
            </div>`;
        }).join('')}
      </div>
      <div class="mb-3">
        <label class="text-sm text-slate-600">Ou pagar valor personalizado</label>
        <input id="customPayAmount" type="number" min="0" step="0.01" placeholder="0.00" class="w-full px-3 py-2 border border-slate-300 rounded-lg mt-1" />
      </div>
      <div class="flex gap-3 justify-end">
        <button id="btnCancelPay" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 hover:bg-slate-50 transition font-medium">Cancelar</button>
        <button id="btnConfirmPay" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium">Confirmar Pagamento</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  document.getElementById('btnCancelPay').addEventListener('click', () => dialog.remove());

  document.getElementById('btnConfirmPay').addEventListener('click', () => {
    const paymentMode = document.getElementById('paymentModeSelect').value;
    const paymentMethod = document.getElementById('paymentMethodSelect').value;
    const customVal = parseFloat((document.getElementById('customPayAmount').value || '').replace(',', '.')) || 0;
    let amountToPay = 0;
    let itemsToRecord = [];

    if (paymentMode === 'full') {
      if (remainingTotal <= 0) {
        const updated = data.TableOrder.get(tableId);
        updated.status = 'closed';
        updated.closed_date = updated.closed_date || Date.now();
        data.TableOrder.update(tableId, { status: 'closed', closed_date: updated.closed_date });
        dialog.remove();
        alert('Mesa já estava quitada. Fechamento confirmado.');
        navigateTo('/');
        return;
      }
      amountToPay = remainingTotal;
    } else if (customVal > 0) {
      amountToPay = customVal;
    } else {
      // soma itens selecionados
      const checked = Array.from(dialog.querySelectorAll('input[type="checkbox"]')).filter(c => c.checked && !c.disabled);
      checked.forEach(ch => {
        const idx = parseInt(ch.dataset.idx);
        const qtyInput = dialog.querySelector(`.qty-pay[data-idx="${idx}"]`);
        const qty = Math.min(Math.max(1, parseInt(qtyInput.value || '1')), parseInt(qtyInput.max || '1'));
        const it = order.items[idx];
        const thisAmount = (it.price || 0) * qty;
        amountToPay += thisAmount;
        itemsToRecord.push({ id: it.id, qty, price: it.price });
      });
    }

    if (amountToPay <= 0) {
      alert('Informe itens selecionados ou um valor para pagar');
      return;
    }

    if (paymentMode === 'full' && amountToPay < remainingTotal) {
      amountToPay = remainingTotal;
    }

    if (amountToPay > remainingTotal) {
      if (!confirm('O valor informado é maior que o restante. Deseja prosseguir e fechar a mesa?')) return;
    }

    // Registra pagamento
    const payment = { id: `p${Date.now()}`, date: Date.now(), items: itemsToRecord, amount: amountToPay, method: paymentMethod, mode: paymentMode };
    const updated = data.TableOrder.get(tableId);
    updated.payments = Array.isArray(updated.payments) ? updated.payments : [];
    updated.payments.push(payment);
    updated.paidAmount = (updated.paidAmount || 0) + amountToPay;

    // Se pagou tudo, fecha a mesa
    if ((updated.paidAmount || 0) >= (updated.total || 0)) {
      updated.status = 'closed';
      updated.closed_date = Date.now();
    }

    data.TableOrder.update(tableId, { payments: updated.payments, paidAmount: updated.paidAmount, status: updated.status, closed_date: updated.closed_date });

    dialog.remove();
    if (updated.status === 'closed') {
      alert('Pagamento concluído — Mesa fechada.');
      navigateTo('/');
    } else {
      alert('Pagamento registrado com sucesso.');
      const page = document.getElementById('app');
      const result = renderTableDetailPage(tableId);
      page.innerHTML = result.html;
      if (result.afterRender) result.afterRender();
    }
  });
}

window.renderTableDetailPage = renderTableDetailPage;
window.removeItemFromOrder = removeItemFromOrder;
window.addItemToOrder = addItemToOrder;
