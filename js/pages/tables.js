// Página: Mesas Abertas
function renderTablesPage() {
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
    html += `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    `;
    
    orders.forEach(order => {
      const createdDate = new Date(order.created_date).toLocaleString('pt-BR');
      const total = order.total || 0;
      
      html += `
        <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition cursor-pointer" onclick="navigateTo('/mesa/${order.id}')">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-lg font-bold text-slate-900">Mesa ${order.table_number}</h3>
            <span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">Aberta</span>
          </div>
          <p class="text-sm text-slate-600 mb-3">${createdDate}</p>
          <div class="flex items-end justify-between">
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
    }
  };
}

function showOpenTableDialog() {
  const existingTables = data.TableOrder.filter({ status: 'open' }, '-created_date')
    .map(o => o.table_number);

  const allTables = Array.from({ length: 10 }, (_, i) => i + 1);
  const availableTables = allTables.filter(n => !existingTables.includes(n));

  let options = availableTables.map(t => `<option value="${t}">Mesa ${t}</option>`).join('');

  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  dialog.innerHTML = `
    <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
      <h2 class="text-xl font-bold mb-4 text-slate-900">Abrir Nova Mesa</h2>
      <select id="tableSelect" class="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4">
        <option>Selecione uma mesa</option>
        ${options}
      </select>
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
    
    const newOrder = data.TableOrder.create({
      table_number: tableNumber,
      status: 'open',
      items: [],
      total: 0
    });
    
    dialog.remove();
    navigateTo(`/mesa/${newOrder.id}`);
  });
}

window.renderTablesPage = renderTablesPage;
