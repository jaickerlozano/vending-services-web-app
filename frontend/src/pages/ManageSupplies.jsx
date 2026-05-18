import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Plus, Trash2, Edit2, Save, X, Coffee } from 'lucide-react';

export default function ManageSupplies() {
  const [supplies, setSupplies] = useState([]);
  const [newSupplyName, setNewSupplyName] = useState('');
  const [newSupplyUnit, setNewSupplyUnit] = useState('unid');
  const [newSupplyCost, setNewSupplyCost] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('unid');
  const [editCost, setEditCost] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setSupplies(db.getSupplies());
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSupplyName) return;

    db.addSupply({ 
      name: newSupplyName, 
      unit: newSupplyUnit,
      cost: Number(newSupplyCost) || 0
    });
    setNewSupplyName('');
    setNewSupplyUnit('unid');
    setNewSupplyCost('');
    refreshData();
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar insumo? Se eliminará de la lista de selección.')) {
      db.deleteSupply(id);
      refreshData();
    }
  };

  const startEdit = (supply) => {
    setEditingId(supply.id);
    setEditName(supply.name);
    setEditUnit(supply.unit || 'unid');
    setEditCost(supply.cost || '');
  };

  const saveEdit = () => {
    db.updateSupply(editingId, { 
      name: editName, 
      unit: editUnit,
      cost: Number(editCost) || 0
    });
    setEditingId(null);
    refreshData();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditUnit('unid');
    setEditCost('');
  };

  const units = [
    { value: 'unid', label: 'Unidades' },
    { value: 'kg', label: 'Kilogramos' },
    { value: 'g', label: 'Gramos' },
    { value: 'pqte', label: 'Paquete' },
    { value: 'frasco', label: 'Frasco' }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>Gestión de Insumos</h1>
        <p className="text-muted">Administra los insumos (materias primas) para máquinas de café</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '2rem' }}>
        
        {/* ADD FORM */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1rem' }}>Nuevo Insumo</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nombre del Insumo</label>
              <input 
                className="input" 
                placeholder="Ej. Leche Descremada"
                value={newSupplyName}
                onChange={(e) => setNewSupplyName(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Unidad</label>
                <select 
                  className="input" 
                  value={newSupplyUnit}
                  onChange={(e) => setNewSupplyUnit(e.target.value)}
                >
                  {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Costo Unit. ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="input" 
                  placeholder="0.00"
                  value={newSupplyCost}
                  onChange={(e) => setNewSupplyCost(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <Plus size={18} /> Agregar
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            <p>Estos insumos aparecerán disponibles en la sección <strong>Inventario</strong> cuando selecciones una máquina de café.</p>
          </div>
        </div>

        {/* LIST */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Coffee size={20} className="text-muted" /> Catálogo de Insumos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {supplies.length === 0 ? (
              <div className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>No hay insumos registrados</div>
            ) : supplies.map(supply => (
              <div key={supply.id} style={{ 
                padding: '1rem', 
                borderBottom: '1px solid var(--color-border)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                {editingId === supply.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input 
                      className="input" 
                      style={{ flex: 2, minWidth: '120px' }}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <select 
                      className="input" 
                      style={{ flex: 1, minWidth: '80px', padding: '0.5rem' }}
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                    >
                      {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                    <input 
                      type="number"
                      step="0.01"
                      className="input" 
                      style={{ flex: 1, minWidth: '80px' }}
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.value)}
                      placeholder="Costo"
                    />
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={saveEdit}><Save size={16} /></button>
                      <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={cancelEdit}><X size={16} /></button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>{supply.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {units.find(u => u.value === supply.unit)?.label || 'Unidades'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                          ${Number(supply.cost || 0).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Costo Unit.</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => startEdit(supply)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--color-error)' }} onClick={() => handleDelete(supply.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
