// MESAS ABERTAS
// Exibe todas as mesas abertas com opção de abrir nova mesa ou deletar uma existente

function renderTablesPage() {
  // Busca todas as mesas abertas ordenadas por data de criação
  const orders = data.TableOrder.filter({ status: 'open' }, '-created_date');
  const existingTables = orders.map(o => o.table_number);

  let html = `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Mesas Abertas</h2>
          <p class="text-sm text-slate-600 mt-1">
            ${orders.length} ${orders.length === 1 ? 'mesa aberta' : 'mesas abertas'}
          </p>
        </div>
        <button id="btnOpenTable" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md flex items-center gap-2 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Abrir Mesa
        </button>
      </div>
  `;

  // Se não há mesas abertas, mostra mensagem vazia
  if (orders.length === 0) {
    html += `
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-20 h-20 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 012-2h6a2 2 0 012 2v1m0 13V7a2 2 0 00-2-2h-6a2 2 0 00-2 2v12m12-13h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 mb-1">Nenhuma mesa aberta</h3>
        <p class="text-sm text-slate-600 mb-6">
          Clique em "Abrir Mesa" para começar uma nova comanda
        </p>
        <button onclick="document.getElementById('btnOpenTable').click()" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Abrir Mesa
        </button>
      </div>
    `;
  } else {
    // Grid com todas as mesas abertas
    html += `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    `;
    
    orders.forEach(order => {
      const createdDate = new Date(order.created_date).toLocaleString('pt-BR');
      const total = order.total || 0;
      
      html += `
        <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-lg font-bold text-slate-900 cursor-pointer" onclick="navigateTo('/mesa/${order.id}')">${order.table_name ? order.table_name : 'Mesa ' + order.table_number}</h3>
            <div class="flex items-center gap-2">
              <span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">Aberta</span>
              <button class="btn-delete-table text-slate-400 hover:text-red-600 p-1 transition" data-table-id="${order.id}" title="Deletar mesa">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          <p class="text-sm text-slate-600 mb-3 cursor-pointer" onclick="navigateTo('/mesa/${order.id}')">${createdDate}</p>
          <div class="flex items-end justify-between cursor-pointer" onclick="navigateTo('/mesa/${order.id}')">
            <div>
              <p class="text-xs text-slate-600">Items: <span class="font-bold">${order.items?.length || 0}</span></p>
            </div>
            <p class="text-lg font-bold text-slate-900">R$ ${total.toFixed(2)}</p>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
  }

  html += `</div>`;

  return {
    html,
    afterRender() {
      document.getElementById('btnOpenTable').addEventListener('click', showOpenTableDialog);
      
      // Eventos para deletar mesas
      document.querySelectorAll('.btn-delete-table').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tableId = btn.dataset.tableId;
          showDeleteTableConfirmDialog(tableId);
        });
      });
    }
  };
}

// Abre diálogo para criar uma nova mesa
function showOpenTableDialog() {
  const existingTables = data.TableOrder.filter({ status: 'open' }, '-created_date')
    .map(o => o.table_number);

  // Define quais mesas estão disponíveis (1 a 10)
  const allTables = Array.from({ length: 10 }, (_, i) => i + 1);
  const availableTables = allTables.filter(n => !existingTables.includes(n));

  let options = availableTables.map(t => `<option value="${t}">Mesa ${t}</option>`).join('');

  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  dialog.innerHTML = `
    <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
      <h2 class="text-xl font-bold mb-4 text-slate-900">Abrir Nova Mesa</h2>
      <select id="tableSelect" class="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2">
        <option>Selecione uma mesa</option>
        ${options}
      </select>
      <input id="tableNameInput" placeholder="Nome da mesa (opcional) — ex: Família Silva" class="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4" />
      <div class="flex gap-3 justify-end">
        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 hover:bg-slate-50 transition font-medium">
          Cancelar
        </button>
        <button id="btnConfirmOpen" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium">
          Abrir
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);

  document.getElementById('btnConfirmOpen').addEventListener('click', () => {
    const tableNumber = parseInt(document.getElementById('tableSelect').value);
    if (!tableNumber) return;
    const tableName = (document.getElementById('tableNameInput').value || '').trim() || null;

    // Cria novo pedido com mesa vazia
    const newOrder = data.TableOrder.create({
      table_number: tableNumber,
      table_name: tableName,
      status: 'open',
      items: [],
      total: 0
    });
    
    dialog.remove();
    navigateTo(`/mesa/${newOrder.id}`);
  });
}

// Abre diálogo de confirmação para deletar uma mesa
function showDeleteTableConfirmDialog(tableId) {
  const order = data.TableOrder.get(tableId);
  if (!order) return;

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
    renderPage();
  });
}

window.renderTablesPage = renderTablesPage;
