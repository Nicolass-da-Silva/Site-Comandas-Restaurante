// HISTÓRICO DE MESAS
// Mostra mesas fechadas filtradas por data com estatísticas

// Converte timestamp para formato de data local (YYYY-MM-DD)
// Evita problemas de timezone que causavam deslocamento de 1 dia
function getLocalDateISO(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Renderiza a página de histórico
function renderHistoryPage() {
  const allClosedOrders = data.TableOrder.filter({ status: 'closed' }, '-created_date');
  // Usa data selecionada armazenada se existir, senão exibe o dia atual
  const selectedDate = localStorage.getItem('selectedHistoryDate') || getLocalDateISO(Date.now());
  
  const [year, month, day] = selectedDate.split('-');
  const displayDate = new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  
  const closedOrders = allClosedOrders.filter(order => {
    return getLocalDateISO(order.created_date) === selectedDate;
  });

  const totalToday = closedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  const allDays = {};
  allClosedOrders.forEach(order => {
    const orderDate = getLocalDateISO(order.created_date);
    if (!allDays[orderDate]) {
      allDays[orderDate] = { total: 0, count: 0 };
    }
    allDays[orderDate].total += order.total || 0;
    allDays[orderDate].count += 1;
  });

  const allDaysArray = Object.values(allDays);
  const averagePerDay = allDaysArray.length > 0 
    ? allDaysArray.reduce((sum, day) => sum + day.total, 0) / allDaysArray.length 
    : 0;
  const totalAllTime = allDaysArray.reduce((sum, day) => sum + day.total, 0);
  
  // Montagem da página que será exibida
  let html = `
    <div>
      <!-- CABEÇALHO: Título e card com total de hoje -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 mb-2">Histórico de Mesas</h2>
          <p class="text-sm text-slate-600">Mesas fechadas</p>
        </div>
        <!-- Card laranja: Total de hoje (soma de tudo que foi vendido hoje) -->
        <div class="text-right bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p class="text-sm text-slate-600">Total hoje</p>
          <p class="text-3xl font-bold text-orange-600">R$ ${totalToday.toFixed(2)}</p>
        </div>
      </div>

      <!-- SEÇÃO: Calendário + Estatísticas -->
      <div class="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <!-- Campo input para escolher a data -->
          <!-- type="date" cria um calendário automático -->
          <!-- onchange chama a função quando muda o valor -->
          <div>
            <label class="block text-sm font-medium text-slate-900 mb-2">Data</label>
            <input 
              type="date" 
              id="historyDatePicker" 
              value="${selectedDate}" 
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900" 
              onchange="changeHistoryDate(this.value)">
          </div>
          
          <!-- Card AZUL: Total do dia selecionado -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
            <p class="text-xs text-slate-600 mb-1">Total em ${displayDate}</p>
            <p class="text-2xl font-bold text-blue-600">R$ ${totalToday.toFixed(2)}</p>
            <!-- Mostra quantas mesas foram fechadas nesse dia -->
            <p class="text-xs text-slate-600 mt-1">${closedOrders.length} mesas</p>
          </div>
          
          <!-- Card VERDE: Médias e resumo geral -->
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
            <p class="text-xs text-slate-600 mb-1">Médias</p>
            <!-- Média de vendas por dia -->
            <p class="text-2xl font-bold text-green-600">R$ ${averagePerDay.toFixed(2)}</p>
            <!-- Quantos dias com vendas + total de todas as vendas -->
            <p class="text-xs text-slate-600 mt-1">${allDaysArray.length} dias | Total R$ ${totalAllTime.toFixed(2)}</p>
          </div>
        </div>
      </div>
  `;

  if (closedOrders.length === 0) {
    html += `
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-20 h-20 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 mb-1">Nenhuma mesa em ${displayDate}</h3>
        <p class="text-sm text-slate-600">
          Selecione outra data para ver o histórico
        </p>
      </div>
    `;
  } else {
    html += `
      <div class="space-y-4">
    `;
    
    closedOrders.forEach(order => {
      const createdDate = new Date(order.created_date).toLocaleDateString('pt-BR');
      const createdTime = new Date(order.created_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const closedDate = order.closed_date ? new Date(order.closed_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-';
      const duration = order.closed_date ? Math.round((order.closed_date - order.created_date) / 60000) : 0;
      const total = order.total || 0;
      const itemCount = order.items?.length || 0;
      
      html += `
        <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition">
          <div class="flex items-center justify-between cursor-pointer" onclick="expandOrderHistory('${order.id}', this)">
            <div class="flex-1">
              <h3 class="font-bold text-slate-900">Mesa ${order.table_number}</h3>
              <p class="text-sm text-slate-600">${createdDate} · ${createdTime} às ${closedDate}</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="font-bold text-lg text-slate-900">R$ ${total.toFixed(2)}</p>
                <p class="text-sm text-slate-600">${itemCount} itens · ${duration}min</p>
              </div>
              <button class="btn-delete-history text-slate-400 hover:text-red-600 p-1 transition" data-order-id="${order.id}" title="Deletar mesa do histórico">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          <div id="details-${order.id}" class="hidden mt-4 pt-4 border-t border-slate-200">
            <div class="space-y-2">
              ${order.items?.map(item => `
                <div class="flex justify-between text-sm">
                  <span class="text-slate-600">${item.name || 'Item'} x${item.quantity || 1}</span>
                  <span class="font-medium text-slate-900">R$ ${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              `).join('') || '<p class="text-sm text-slate-600">Sem itens</p>'}
            </div>
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
      // Adicionar event listeners para botões de deletar história
      document.querySelectorAll('.btn-delete-history').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevenir expansão do card
          const orderId = btn.dataset.orderId;
          showDeleteHistoryOrderDialog(orderId);
        });
      });
    }
  };
}

function expandOrderHistory(orderId, element) {
  const detailsDiv = document.getElementById(`details-${orderId}`);
  if (detailsDiv) {
    detailsDiv.classList.toggle('hidden');
  }
}

function changeHistoryDate(newDate) {
  localStorage.setItem('selectedHistoryDate', newDate);
  
  // Re-render página
  const page = document.getElementById('app');
  const result = renderHistoryPage();
  page.innerHTML = result.html;
  if (result.afterRender) result.afterRender();
}

function showDeleteHistoryOrderDialog(orderId) {
  const order = data.TableOrder.get(orderId);
  if (!order) return;

  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  dialog.innerHTML = `
    <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
      <h2 class="text-xl font-bold mb-2 text-slate-900">Deletar Mesa do Histórico?</h2>
      <p class="text-slate-600 mb-6">
        Tem certeza que deseja deletar a <strong>Mesa ${order.table_number}</strong> do histórico? 
        Esta ação não pode ser desfeita.
      </p>
      <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6">
        <p class="text-sm text-slate-700">
          <strong>Total:</strong> R$ ${(order.total || 0).toFixed(2)} · 
          <strong>Items:</strong> ${order.items?.length || 0}
        </p>
      </div>
      <div class="flex gap-3 justify-end">
        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 hover:bg-slate-50 transition font-medium">
          Cancelar
        </button>
        <button id="btnConfirmDeleteHistory" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium">
          Deletar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);

  document.getElementById('btnConfirmDeleteHistory').addEventListener('click', () => {
    data.TableOrder.delete(orderId);
    dialog.remove();
    
    // Re-render página
    const page = document.getElementById('app');
    const result = renderHistoryPage();
    page.innerHTML = result.html;
    if (result.afterRender) result.afterRender();
  });
}

window.renderHistoryPage = renderHistoryPage;
window.expandOrderHistory = expandOrderHistory;
window.changeHistoryDate = changeHistoryDate;
window.showDeleteHistoryOrderDialog = showDeleteHistoryOrderDialog;
