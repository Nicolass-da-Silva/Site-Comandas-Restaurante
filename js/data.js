// BANCO DE DADOS
// Gerencia dados usando localStorage (sem servidor externo)

const storageKey = (name) => `sitecomanda:${name}`;

// Converte string JSON em objeto ou retorna valor padrão
const readJSON = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

// Lê dados do localStorage
const read = (key) => readJSON(localStorage.getItem(storageKey(key)), []);

// Escreve dados no localStorage
const write = (key, data) => {
  localStorage.setItem(storageKey(key), JSON.stringify(data));
};

// Dados padrão do cardápio
const defaultMenuItems = [
  { id: 'm1', name: 'Coxinha', price: 8, category: 'lanches', active: true },
  { id: 'm2', name: 'Refresco', price: 5, category: 'bebidas', active: true },
  { id: 'm3', name: 'Salgado', price: 6, category: 'lanches', active: true },
  { id: 'm4', name: 'Refrigerante', price: 7, category: 'bebidas', active: true },
  { id: 'm5', name: 'X-Bacon', price: 22, category: 'lanches', active: true },
  { id: 'm6', name: 'X-Burguer', price: 18, category: 'lanches', active: true },
  { id: 'm7', name: 'X-Salada', price: 20, category: 'lanches', active: true },
  { id: 'm8', name: 'Batata Frita', price: 15, category: 'porções', active: true },
  { id: 'm9', name: 'Porção de Calabresa', price: 25, category: 'porções', active: true },
  { id: 'm10', name: 'Suco Natural', price: 8, category: 'bebidas', active: true },
  { id: 'm11', name: 'Água', price: 3.5, category: 'bebidas', active: true },
];

// Dados padrão de pedidos para exemplo
const defaultOrders = () => {
  const hoje = new Date();
  const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);
  const anteontem = new Date(ontem.getTime() - 24 * 60 * 60 * 1000);
  return [
    {
      id: 't1', table_number: 1, status: 'closed',
      created_date: hoje.getTime() - 3 * 60 * 60 * 1000,
      closed_date: hoje.getTime() - 2 * 60 * 60 * 1000,
      items: [
        { id: 'm1', name: 'Coxinha', price: 8, quantity: 2 },
        { id: 'm2', name: 'Refresco', price: 5, quantity: 2 },
      ],
      total: 26,
    },
    {
      id: 't2', table_number: 5, status: 'closed',
      created_date: hoje.getTime() - 1 * 60 * 60 * 1000,
      closed_date: hoje.getTime() - 30 * 60 * 1000,
      items: [
        { id: 'm5', name: 'X-Bacon', price: 22, quantity: 1 },
        { id: 'm4', name: 'Refrigerante', price: 7, quantity: 2 },
      ],
      total: 36,
    },
    {
      id: 't3', table_number: 2, status: 'closed',
      created_date: ontem.getTime() - 4 * 60 * 60 * 1000,
      closed_date: ontem.getTime() - 3 * 60 * 60 * 1000,
      items: [
        { id: 'm6', name: 'X-Burguer', price: 18, quantity: 1 },
        { id: 'm8', name: 'Batata Frita', price: 15, quantity: 1 },
      ],
      total: 33,
    },
    {
      id: 't4', table_number: 3, status: 'closed',
      created_date: ontem.getTime() - 2 * 60 * 60 * 1000,
      closed_date: ontem.getTime() - 1 * 60 * 60 * 1000,
      items: [
        { id: 'm1', name: 'Coxinha', price: 8, quantity: 3 },
        { id: 'm2', name: 'Refresco', price: 5, quantity: 3 },
      ],
      total: 39,
    },
    {
      id: 't5', table_number: 1, status: 'closed',
      created_date: anteontem.getTime() - 5 * 60 * 60 * 1000,
      closed_date: anteontem.getTime() - 4 * 60 * 60 * 1000,
      items: [
        { id: 'm7', name: 'X-Salada', price: 20, quantity: 2 },
        { id: 'm4', name: 'Refrigerante', price: 7, quantity: 2 },
      ],
      total: 54,
    },
    {
      id: 't6', table_number: 4, status: 'closed',
      created_date: anteontem.getTime() - 3 * 60 * 60 * 1000,
      closed_date: anteontem.getTime() - 2.5 * 60 * 60 * 1000,
      items: [
        { id: 'm9', name: 'Porção de Calabresa', price: 25, quantity: 1 },
        { id: 'm2', name: 'Refresco', price: 5, quantity: 1 },
      ],
      total: 30,
    },
  ];
};

// Carrega dados padrão se não existirem no localStorage
function initializeData() {
  localStorage.removeItem(storageKey('backupSnapshots'));
  localStorage.removeItem(storageKey('lastBackupAt'));
  // Carrega menu existente (pode ser vazio)
  let existingMenu = read('menuItems');
  if (!Array.isArray(existingMenu) || existingMenu.length === 0) {
    existingMenu = defaultMenuItems.slice();
  }

  // Se o desenvolvedor forneceu `window.customMenuItems`, mescla-os sempre (sem sobrescrever itens já salvos)
  const custom = Array.isArray(window.customMenuItems) ? window.customMenuItems : [];
  if (custom.length > 0) {
    const normalizedCustom = custom.map((it, idx) => ({
      id: it.id || `cm${Date.now()}${idx}`,
      name: it.name || `Item ${idx}`,
      price: typeof it.price === 'number' ? it.price : 0,
      category: it.category || 'outros',
      active: it.active !== false
    }));

    const existingIds = new Set(existingMenu.map(i => i.id));
    const existingNames = new Set(existingMenu.map(i => (i.name || '').toLowerCase()));

    normalizedCustom.forEach(ci => {
      // adiciona apenas se não houver item com mesmo id ou mesmo nome
      if (!existingIds.has(ci.id) && !existingNames.has((ci.name || '').toLowerCase())) {
        existingMenu.push(ci);
      }
    });

    localStorage.setItem(storageKey('menuItems'), JSON.stringify(existingMenu));
  } else {
    // garante que haja algo gravado
    if (!localStorage.getItem(storageKey('menuItems'))) {
      localStorage.setItem(storageKey('menuItems'), JSON.stringify(existingMenu));
    }
  }
  if (!localStorage.getItem(storageKey('tableOrders'))) {
    localStorage.setItem(storageKey('tableOrders'), JSON.stringify(defaultOrders()));
  }
  if (!localStorage.getItem(storageKey('token'))) {
    localStorage.setItem(storageKey('token'), 'mock-token-123');
    localStorage.setItem(storageKey('user'), JSON.stringify({ id: 'user1', name: 'Admin', email: 'admin@test.com' }));
  }
}

// Ajusta pedidos com datas anteriores à data de abertura do restaurante
function migrateOrdersToOpenDate(openDateISO) {
  try {
    const orders = read('tableOrders');
    if (!Array.isArray(orders) || orders.length === 0) return;

    // Criar Date no horário local a partir de string ISO YYYY-MM-DD
    let openDate;
    if (typeof openDateISO === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(openDateISO)) {
      const parts = openDateISO.split('-').map(Number);
      openDate = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      openDate = new Date(openDateISO);
    }
    orders.forEach((o) => {
      const created = new Date(o.created_date);
      if (created < openDate) {
        // preserva hora/minuto/segundo do registro original
        const h = created.getHours();
        const m = created.getMinutes();
        const s = created.getSeconds();
        const newCreated = new Date(openDate.getFullYear(), openDate.getMonth(), openDate.getDate(), h, m, s).getTime();
        o.created_date = newCreated;
        if (o.closed_date) {
          const closed = new Date(o.closed_date);
          const ch = closed.getHours();
          const cm = closed.getMinutes();
          const cs = closed.getSeconds();
          o.closed_date = new Date(openDate.getFullYear(), openDate.getMonth(), openDate.getDate(), ch, cm, cs).getTime();
        }
      }
      // garante campos para pagamentos e nome da mesa
      if (typeof o.paidAmount !== 'number') o.paidAmount = 0;
      if (!Array.isArray(o.payments)) o.payments = [];
      if (o.table_name === undefined) o.table_name = null;
    });
    write('tableOrders', orders);
  } catch (e) {
    // ignore
  }
}

// Corrige migração anterior que pode ter criado registros com o dia anterior
function fixMigratedDayIfNeeded(openDateISO) {
  try {
    const flagKey = storageKey('migrationFixAppliedV1');
    if (localStorage.getItem(flagKey)) return; // já aplicado

    if (typeof openDateISO !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(openDateISO)) return;
    const parts = openDateISO.split('-').map(Number);
    const openDateLocal = new Date(parts[0], parts[1] - 1, parts[2]);
    const prevDay = new Date(openDateLocal.getFullYear(), openDateLocal.getMonth(), openDateLocal.getDate() - 1);

    const orders = read('tableOrders');
    let changed = false;
    orders.forEach(o => {
      const created = new Date(o.created_date);
      if (created.getFullYear() === prevDay.getFullYear() && created.getMonth() === prevDay.getMonth() && created.getDate() === prevDay.getDate()) {
        // adicionar 24h para created e closed
        o.created_date = created.getTime() + 24 * 60 * 60 * 1000;
        if (o.closed_date) o.closed_date = new Date(o.closed_date).getTime() + 24 * 60 * 60 * 1000;
        // marca para evitar reprocessamento específico por item
        o._migratedFixed = true;
        changed = true;
      }
    });
    if (changed) {
      write('tableOrders', orders);
    }
    localStorage.setItem(flagKey, '1');
  } catch (e) {
    // ignore
  }
}

// Verifica se um item tem todos os campos da query
const matchQuery = (item, query = {}) => {
  return Object.keys(query).every((k) => item[k] === query[k]);
};

// Ordena um array por um campo
const byField = (arr, field) => {
  if (!field) return arr;
  const desc = field.startsWith('-');
  const f = desc ? field.slice(1) : field;
  return arr.slice().sort((a, b) => (a[f] > b[f] ? (desc ? -1 : 1) : a[f] < b[f] ? (desc ? 1 : -1) : 0));
};

// API de dados - Método CRUD para itens de menu e pedidos
const data = {
  MenuItem: {
    list(sortField) {
      const items = read('menuItems');
      return byField(items, sortField);
    },
    filter(query = {}, sortField) {
      const items = read('menuItems').filter((i) => matchQuery(i, query));
      return byField(items, sortField);
    },
    get(id) {
      const items = read('menuItems');
      return items.find(i => i.id === id);
    },
    create(item) {
      const items = read('menuItems');
      const newItem = { id: `m${Date.now()}`, ...item };
      items.push(newItem);
      write('menuItems', items);
      return newItem;
    },
    update(id, updates) {
      const items = read('menuItems');
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error('Não encontrado');
      items[idx] = { ...items[idx], ...updates };
      write('menuItems', items);
      return items[idx];
    },
    delete(id) {
      const items = read('menuItems');
      const filtered = items.filter((i) => i.id !== id);
      write('menuItems', filtered);
    }
  },

  TableOrder: {
    filter(query = {}, sortField) {
      const items = read('tableOrders').filter((i) => matchQuery(i, query));
      return byField(items, sortField);
    },
    get(id) {
      const items = read('tableOrders');
      return items.find(i => i.id === id);
    },
    create(order) {
      const items = read('tableOrders');
      const newOrder = { 
        id: `t${Date.now()}`, 
        created_date: Date.now(),
        items: [],
        total: 0,
        paidAmount: 0,
        payments: [],
        table_name: null,
        ...order 
      };
      items.push(newOrder);
      write('tableOrders', items);
      return newOrder;
    },
    update(id, updates) {
      const items = read('tableOrders');
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error('Não encontrado');
      items[idx] = { ...items[idx], ...updates };
      write('tableOrders', items);
      return items[idx];
    },
    delete(id) {
      const items = read('tableOrders');
      const filtered = items.filter((i) => i.id !== id);
      write('tableOrders', filtered);
    }
  },

  // Autenticação simples (mock)
  auth: {
    getUser() {
      const token = localStorage.getItem(storageKey('token'));
      if (!token) return null;
      const user = localStorage.getItem(storageKey('user'));
      return user ? JSON.parse(user) : null;
    },
    isAuthenticated() {
      return !!localStorage.getItem(storageKey('token'));
    }
  },
};

// Exporta o estado atual (menu + pedidos) pronto para download
data.exportBackup = function() {
  return {
    menuItems: read('menuItems'),
    tableOrders: read('tableOrders'),
    user: readJSON(localStorage.getItem(storageKey('user')), null),
    token: localStorage.getItem(storageKey('token'))
  };
};

// Importa um backup (objeto) no storage. Por padrão faz merge para preservar histórico.
data.importBackup = function(backup = {}, options = {}) {
  const merge = options.merge !== false; // default true

  // Importar menuItems
  if (Array.isArray(backup.menuItems)) {
    const existingMenu = read('menuItems');
    if (merge) {
      const ids = new Set(existingMenu.map(i => i.id));
      backup.menuItems.forEach(i => {
        if (!ids.has(i.id)) existingMenu.push(i);
      });
      write('menuItems', existingMenu);
    } else {
      write('menuItems', backup.menuItems);
    }
  }

  // Importar tableOrders (preservar histórico)
  if (Array.isArray(backup.tableOrders)) {
    const existingOrders = read('tableOrders');
    if (merge) {
      const ids = new Set(existingOrders.map(o => o.id));
      backup.tableOrders.forEach(o => {
        if (!ids.has(o.id)) existingOrders.push(o);
      });
      write('tableOrders', existingOrders);
    } else {
      write('tableOrders', backup.tableOrders);
    }
  }

  // Restaurar user/token se presentes
  if (backup.user) localStorage.setItem(storageKey('user'), JSON.stringify(backup.user));
  if (backup.token) localStorage.setItem(storageKey('token'), backup.token);

  return true;
};

// Inicializar dados e expor API
// Garantir que exista uma data de abertura do restaurante
// Usuário informou que o restaurante abriu em 09/05 — usamos ISO 2026-05-09
const OPEN_DATE_KEY = storageKey('siteOpenDate');
if (!localStorage.getItem(OPEN_DATE_KEY)) {
  // formato ISO yyyy-mm-dd
  localStorage.setItem(OPEN_DATE_KEY, '2026-05-09');
}

initializeData();

// Migra pedidos com datas anteriores à data de abertura para o dia de abertura
const openISO = localStorage.getItem(OPEN_DATE_KEY) || (new Date()).toISOString().slice(0,10);
migrateOrdersToOpenDate(openISO);
// Aplica correção única caso migração anterior tenha deslocado para dia anterior
fixMigratedDayIfNeeded(openISO);

window.data = data;
