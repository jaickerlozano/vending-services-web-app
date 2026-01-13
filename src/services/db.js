// Initial data for first load
// Initial data for first load
const INITIAL_DATA = {
  plazas: [],
  machines: [],
  products: [],
  sales: [],
  inventory: [],
  supplies: [
    { id: 1, name: 'Leche en Polvo' },
    { id: 2, name: 'Café en Grano' },
    { id: 3, name: 'Azúcar' },
    { id: 4, name: 'Chocolate' },
    { id: 5, name: 'Café Vainilla' },
    { id: 6, name: 'Café Dulce de Leche' },
    { id: 7, name: 'Vasos' },
    { id: 8, name: 'Paletinas' }
  ],
  complaints: []
};

const DB_KEY = 'vlb_db';

class StorageService {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(DB_KEY)) {
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
    }
  }

  getDb() {
    return JSON.parse(localStorage.getItem(DB_KEY) || '{}');
  }

  saveDb(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  // Generic Getters
  getPlazas() { return this.getDb().plazas || []; }
  getMachines() { return this.getDb().machines || []; }
  getProducts() { return this.getDb().products || []; }
  getSales() { return this.getDb().sales || []; }
  getInventory() { return this.getDb().inventory || []; }
  getComplaints() { return this.getDb().complaints || []; }
  getSupplies() { return this.getDb().supplies || []; }

  // Admin Methods: Plazas
  addPlaza(name) {
    const db = this.getDb();
    const newPlaza = { id: Date.now(), name };
    db.plazas.push(newPlaza);
    this.saveDb(db);
    return newPlaza;
  }

  deletePlaza(id) {
    const db = this.getDb();
    // Prevent delete if has machines
    if (db.machines.some(m => m.plazaId === id)) return false;
    db.plazas = db.plazas.filter(p => p.id !== id);
    this.saveDb(db);
    return true;
  }

  // Admin Methods: Machines
  addMachine(machine) {
    const db = this.getDb();
    const newMachine = { ...machine, id: Date.now(), products: machine.products || [] };
    db.machines.push(newMachine);
    this.saveDb(db);
    return newMachine;
  }

  updateMachine(id, updates) {
    const db = this.getDb();
    const idx = db.machines.findIndex(m => m.id === id);
    if (idx !== -1) {
      db.machines[idx] = { ...db.machines[idx], ...updates };
      this.saveDb(db);
      return true;
    }
    return false;
  }

  deleteMachine(id) {
    const db = this.getDb();
    db.machines = db.machines.filter(m => m.id !== id);
    this.saveDb(db);
    return true;
  }

  // Admin Methods: Products
  addProduct(product) {
    const db = this.getDb();
    const newProduct = { ...product, id: Date.now() };
    db.products.push(newProduct);
    this.saveDb(db);
    return newProduct;
  }

  updateProduct(id, updates) {
    const db = this.getDb();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.products[idx] = { ...db.products[idx], ...updates };
      this.saveDb(db);
      return true;
    }
    return false;
  }

  deleteProduct(id) {
    const db = this.getDb();
    // Check if used in machines? Maybe warn but allowed.
    // Clean up references in machines
    db.machines.forEach(m => {
      if (m.products) {
        m.products = m.products.filter(pid => pid !== id);
      }
    });
    db.products = db.products.filter(p => p.id !== id);
    this.saveDb(db);
    return true;
  }

  // Admin Methods: Supplies
  addSupply(supply) {
    const db = this.getDb();
    // Ensure supplies array exists
    if (!db.supplies) db.supplies = [];
    
    // Support both string (legacy) and object
    const newSupply = typeof supply === 'string' 
      ? { id: Date.now(), name: supply }
      : { ...supply, id: Date.now() };
      
    db.supplies.push(newSupply);
    this.saveDb(db);
    return newSupply;
  }

  updateSupply(id, updates) {
    const db = this.getDb();
    const idx = db.supplies.findIndex(s => s.id === id);
    if (idx !== -1) {
      db.supplies[idx] = { ...db.supplies[idx], ...updates };
      this.saveDb(db);
      return true;
    }
    return false;
  }

  deleteSupply(id) {
    const db = this.getDb();
    db.supplies = db.supplies.filter(s => s.id !== id);
    this.saveDb(db);
    return true;
  }

  // Generic Adders
  addSale(sale) {
    const db = this.getDb();
    const newSale = { 
      ...sale, 
      id: Date.now(), 
      date: new Date().toISOString() 
    };
    db.sales.push(newSale);
    this.saveDb(db);
    return newSale;
  }

  addComplaint(complaint) {
    const db = this.getDb();
    const newComplaint = {
      ...complaint,
      id: Date.now(),
      date: new Date().toISOString(),
      status: 'pending'
    };
    db.complaints.push(newComplaint);
    this.saveDb(db);
    return newComplaint;
  }

  addInventoryLog(log) {
    const db = this.getDb();
    // Ensure inventory array exists
    if (!db.inventory) db.inventory = [];
    
    const newLog = {
      ...log,
      id: Date.now(),
      date: new Date().toISOString()
    };
    db.inventory.push(newLog);
    this.saveDb(db);
    return newLog;
  }

  // Audit Logs
  addAuditLog(action, details, user, reason = '') {
    const db = this.getDb();
    if (!db.audit_logs) db.audit_logs = [];
    
    const newLog = {
      id: Date.now(),
      date: new Date().toISOString(),
      action, // 'UPDATE' | 'DELETE'
      details,
      user: user || 'Desconocido',
      reason: reason
    };
    db.audit_logs.push(newLog);
    this.saveDb(db);
    return newLog;
  }

  getAuditLogs() {
    return this.getDb().audit_logs || [];
  }

  updateInventoryLog(id, updates, user, reason) {
    const db = this.getDb();
    const idx = db.inventory.findIndex(l => l.id === id);
    if (idx !== -1) {
      const oldLog = db.inventory[idx];
      db.inventory[idx] = { ...oldLog, ...updates };
      this.saveDb(db);
      
      this.addAuditLog(
        'UPDATE', 
        `Modificó registro de ${oldLog.itemName}. Cantidad: ${oldLog.quantity} -> ${updates.quantity}. Tipo: ${oldLog.type} -> ${updates.type}`, 
        user,
        reason
      );
      return true;
    }
    return false;
  }

  deleteInventoryLog(id, user, reason) {
    const db = this.getDb();
    const log = db.inventory.find(l => l.id === id);
    if (log) {
      db.inventory = db.inventory.filter(l => l.id !== id);
      this.saveDb(db);
      
      this.addAuditLog(
        'DELETE', 
        `Eliminó registro de ${log.itemName} (${log.quantity}) del ${new Date(log.date).toLocaleDateString()}`, 
        user,
        reason
      );
      return true;
    }
    return false;
  }

  clearInventory(user) {
    const db = this.getDb();
    const count = db.inventory.length;
    db.inventory = [];
    this.saveDb(db);
    
    this.addAuditLog('CLEAR', `Eliminó todo el historial de inventario (${count} registros)`, user);
    return true;
  }
}

export const db = new StorageService();
