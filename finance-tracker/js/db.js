/* IndexedDB wrapper for Magharian Finance Tracker */
const DB = (() => {
  const DB_NAME = 'MagharFinanceDB';
  const DB_VERSION = 1;
  let db = null;

  const STORES = {
    repairJobs: 'repairJobs',
    productSales: 'productSales',
    inventory: 'inventory',
    dailySales: 'dailySales',
    customerCredits: 'customerCredits',
    expenses: 'expenses',
  };

  function open() {
    return new Promise((resolve, reject) => {
      if (db) { resolve(db); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const database = e.target.result;
        Object.values(STORES).forEach(name => {
          if (!database.objectStoreNames.contains(name)) {
            database.createObjectStore(name, { keyPath: 'id' });
          }
        });
      };
      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror = e => reject(e.target.error);
    });
  }

  function tx(store, mode = 'readonly') {
    return db.transaction(store, mode).objectStore(store);
  }

  function getAll(store) {
    return open().then(() => new Promise((resolve, reject) => {
      const req = tx(store).getAll();
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    }));
  }

  function get(store, id) {
    return open().then(() => new Promise((resolve, reject) => {
      const req = tx(store).get(id);
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    }));
  }

  function put(store, item) {
    if (!item.id) item.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    return open().then(() => new Promise((resolve, reject) => {
      const req = tx(store, 'readwrite').put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = e => reject(e.target.error);
    }));
  }

  function remove(store, id) {
    return open().then(() => new Promise((resolve, reject) => {
      const req = tx(store, 'readwrite').delete(id);
      req.onsuccess = () => resolve();
      req.onerror = e => reject(e.target.error);
    }));
  }

  function clear(store) {
    return open().then(() => new Promise((resolve, reject) => {
      const req = tx(store, 'readwrite').clear();
      req.onsuccess = () => resolve();
      req.onerror = e => reject(e.target.error);
    }));
  }

  async function exportAll() {
    const data = {};
    for (const s of Object.values(STORES)) {
      data[s] = await getAll(s);
    }
    return data;
  }

  async function importAll(data) {
    for (const [store, items] of Object.entries(data)) {
      if (!Object.values(STORES).includes(store)) continue;
      await clear(store);
      for (const item of items) await put(store, item);
    }
  }

  return { open, getAll, get, put, remove, clear, exportAll, importAll, STORES };
})();
