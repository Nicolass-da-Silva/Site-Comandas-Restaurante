// Página: Histórico
function renderHistoryPage() {
  const allClosedOrders = data.TableOrder.filter({ status: 'closed' }, '-created_date');
  
  // Data selecionada (do localStorage ou hoje)
  const selectedDate = localStorage.getItem('selectedHistoryDate') || new Date().toISOString().split('T')[0];
  
  // Filtrar por dia selecionado
  const closedOrders = allClosedOrders.filter(order => {
    const orderDate = new Date(order.created_date).toISOString().split('T')[0];
    return orderDate === selectedDate;
  });

  // Calcular estatísticas
  const totalToday = closedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const allDays = {};
  
  allClosedOrders.forEach(order => {
    const orderDate = new Date(order.created_date).toISOString().split('T')[0];
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
  
  let html = `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 mb-2">Histórico de Mesas</h2>
          <p class="text-sm text-slate-600">Mesas fechadas</p>
        </div>
        <div class="text-right bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p class="text-sm text-slate-600">Total hoje</p>
          <p class="text-3xl font-bold text-orange-600">R$ ${totalToday.toFixed(2)}</p>
        </div>
      </div>

      <!-- Seletor de Data -->
      <div class="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-900 mb-2">Data</label>
            <input type="date" id="historyDatePicker" value="${selectedDate}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900" onchange="changeHistoryDate(this.value)">
          </div>
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
            <p class="text-xs text-slate-600 mb-1">Total em ${new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
            <p class="text-2xl font-bold text-blue-600">R$ ${totalToday.toFixed(2)}</p>
            <p class="text-xs text-slate-600 mt-1">${closedOrders.length} mesas</p>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
            <p class="text-xs text-slate-600 mb-1">Médias</p>
            <p class="text-2xl font-bold text-green-600">R$ ${averagePerDay.toFixed(2)}</p>
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
        <h3 class="text-lg font-semibold text-slate-900 mb-1">Nenhuma mesa em ${new Date(selectedDate).toLocaleDateString('pt-BR')}</h3>
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
        <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition cursor-pointer" onclick="expandOrderHistory('${order.id}', this)">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="font-bold text-slate-900">Mesa ${order.table_number}</h3>
              <p class="text-sm text-slate-600">${createdDate} · ${createdTime} às ${closedDate}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-lg text-slate-900">R$ ${total.toFixed(2)}</p>
              <p class="text-sm text-slate-600">${itemCount} itens · ${duration}min</p>
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

  return { html };
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

window.renderHistoryPage = renderHistoryPage;
window.expandOrderHistory = expandOrderHistory;
window.changeHistoryDate = changeHistoryDate;
