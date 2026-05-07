// Sistema de dados com localStorage.
// Sem servicos externos.

const storageKey = (name) => `sitecomanda:${name}`;

const readJSON = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const read = (key) => readJSON(localStorage.getItem(storageKey(key)), []);

const write = (key, data) => {
  localStorage.setItem(storageKey(key), JSON.stringify(data));
};

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

// Inicializar dados padrão
function initializeData() {
  // Limpa residuos do recurso antigo de backup.
  localStorage.removeItem(storageKey('backupSnapshots'));
  localStorage.removeItem(storageKey('lastBackupAt'));

  if (!localStorage.getItem(storageKey('menuItems'))) {
    localStorage.setItem(storageKey('menuItems'), JSON.stringify(defaultMenuItems));
  }
  if (!localStorage.getItem(storageKey('tableOrders'))) {
    localStorage.setItem(storageKey('tableOrders'), JSON.stringify(defaultOrders()));
  }
  if (!localStorage.getItem(storageKey('token'))) {
    localStorage.setItem(storageKey('token'), 'mock-token-123');
    localStorage.setItem(storageKey('user'), JSON.stringify({ id: 'user1', name: 'Admin', email: 'admin@test.com' }));
  }
}

const matchQuery = (item, query = {}) => {
  return Object.keys(query).every((k) => item[k] === query[k]);
};

const byField = (arr, field) => {
  if (!field) return arr;
  const desc = field.startsWith('-');
  const f = desc ? field.slice(1) : field;
  return arr.slice().sort((a, b) => (a[f] > b[f] ? (desc ? -1 : 1) : a[f] < b[f] ? (desc ? 1 : -1) : 0));
};

// API de dados
const data = {
  // Menu Items
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

  // Table Orders
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

  // Auth
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

// Inicializar dados
initializeData();

// Exportar
window.data = data;
