import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Monitor, Plus, Trash2, Settings, Save, Coffee, Cookie } from 'lucide-react';
import { loadDataFromAPI } from '../services/api';
import { ENDPOINTS } from '../utils/endpoints';

export default function ManageMachines() {
  const [machines, setMachines] = useState([]);
  const [plazas, setPlazas] = useState([]);
  const [products, setProducts] = useState([]);
  
  // New Machine Form
  const [newMachine, setNewMachine] = useState({
    name: '',
    plazaId: '',
    type: 'coffee'
  });
  
  // Edit Mode
  const [editingMachine, setEditingMachine] = useState(null);

  useEffect(() => {
    loadDataFromAPI(ENDPOINTS.locations, setPlazas);
    loadDataFromAPI(ENDPOINTS.machines, setMachines);
    // loadDataFromAPI ENDPOINTS.products, setProducts);
  }, []);
  console.log(machines)

  // const handleAdd = (e) => {
  //   e.preventDefault();
  //   if (!machines.name || !machines.locations) return;

  //   db.addMachine({
  //     ...newMachine,
  //     plazaId: parseInt(newMachine.plazaId),
  //     products: [] // Start empty or default? Let's start empty.
  //   });
  //   setNewMachine({ name: '', plazaId: '', type: 'coffee' });
  //   refreshData();
  // };

    const handleAdd = async (e) => {
    e.preventDefault();

    if (!newMachine.name.trim()) {
      alert('Por favor ingresa un nombre para la máquina');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/machines/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newMachine.name,
          location: newMachine.plazaId,
          type: newMachine.type,
        })
      });

      if (response.ok) {
        setNewMachine({ name: '', location: '', type: 'coffee' });
        await loadDataFromAPI(ENDPOINTS.machines, setMachines);
        alert('Máquina agregada correctamente');
      } else {
        const errorData = await response.json();        const [newMachine, setNewMachine] = useState({
          name: '',
          plazaId: '',
          type: 'coffee'
        });
        console.error('Error al agregar la máquina:', errorData);
        alert('Error al agregar la máquina: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar equipo? Se perderá el historial asociado si no está respaldado.')) {
      try {
        await fetch(`http://localhost:8000/api/machines/${id}/`, {
          method: 'DELETE'
        });
        await loadDataFromAPI(ENDPOINTS.machines, setMachines);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const toggleProduct = (productId) => {
    if (!editingMachine) return;
    
    const currentProducts = editingMachine.products || [];
    const newProducts = currentProducts.includes(productId)
      ? currentProducts.filter(id => id !== productId)
      : [...currentProducts, productId];
      
    setEditingMachine({ ...editingMachine, products: newProducts });
  };

  const saveConfiguration = () => {
    if (editingMachine) {
      db.updateMachine(editingMachine.id, { products: editingMachine.products });
      setEditingMachine(null);
      refreshData();
    }
  };

  // Filters
  const [filters, setFilters] = useState({ name: '', plazaId: '', type: '' });

  const filteredMachines = machines.filter(m => {
    const matchesName = m.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesPlaza = filters.plazaId ? m.plazaId === parseInt(filters.plazaId) : true;
    const matchesType = filters.type ? m.type === filters.type : true;
    return matchesName && matchesPlaza && matchesType;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>Gestionar Equipos</h1>
        <p className="text-muted">Configuración de máquinas, tipos y productos asignados</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* List & Add */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Add New Machine Form */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Agregar Nuevo Equipo</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                className="input" 
                placeholder="Nombre (ej. Cafetería Piso 1)"
                value={newMachine.name}
                onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
              />
              <select 
                className="input"
                value={newMachine.plazaId}
                onChange={(e) => setNewMachine({...newMachine, plazaId: e.target.value})}
              >
                <option value="">Seleccionar Plaza...</option>
                {plazas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="type" 
                    checked={newMachine.type === 'coffee' || newMachine.type === 'snacks'} 
                    onChange={() => setNewMachine({...newMachine, type: newMachine.type === 'coffee' ? 'snack' : 'coffee'})}
                  />
                  <span>Café</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="type" 
                    checked={newMachine.type === 'snack'} 
                    onChange={() => setNewMachine({...newMachine, type: 'snack'})}
                  />
                  <span>Snacks</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary">
                <Plus size={18} /> Crear Equipo
              </button>
            </form>
          </div>

          {/* Filters */}
          <div className="card" style={{ padding: '1rem', backgroundColor: '#f8fafc' }}>
            <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Filtrar Equipos</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input 
                className="input" 
                placeholder="Buscar por nombre..." 
                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                value={filters.name}
                onChange={(e) => setFilters({...filters, name: e.target.value})}
              />
              <select 
                className="input"
                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                value={filters.plazaId}
                onChange={(e) => setFilters({...filters, plazaId: e.target.value})}
              >
                <option value="">Todas las Plazas</option>
                {plazas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select 
                className="input"
                style={{ fontSize: '0.8rem', padding: '0.4rem', gridColumn: '1 / span 2' }}
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="">Todos los Tipos</option>
                <option value="coffee">Máquinas de Café</option>
                <option value="snack">Máquinas de Snack</option>
              </select>
            </div>
          </div>

          {/* Machines List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredMachines.length === 0 ? (
              <div className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>No se encontraron equipos</div>
            ) : filteredMachines.map(machine => (
              <div key={machine.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '8px', 
                  backgroundColor: machine.type === 'coffee' ? '#78350f' : '#d97706',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {machine.type === 'coffee' ? <Coffee size={20} /> : <Cookie size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{machine.name}</div>
                  <div style={{ fontSize: '0.75rem', className: 'text-muted' }}>
                    {plazas.find(p => p.id === machine.plazaId)?.name} • {machine.products?.length || 0} Prod.
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={() => setEditingMachine(machine)}>
                  <Settings size={18} />
                </button>
                <button className="btn btn-ghost" style={{ color: 'var(--color-error)' }} onClick={() => handleDelete(machine.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Panel */}
        <div>
          {editingMachine ? (
            <div className="card" style={{ position: 'sticky', top: '2rem', border: '2px solid var(--color-accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3>Configurar: {editingMachine.name}</h3>
                <button className="btn btn-ghost" onClick={() => setEditingMachine(null)}>Cancelar</button>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Selecciona los productos disponibles en esta máquina:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                  {products
                    .filter(product => product.category === editingMachine.type) // Strict category filter
                    .map(product => {
                    const isSelected = editingMachine.products?.includes(product.id);
                    return (
                      <button 
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          backgroundColor: isSelected ? '#fffbeb' : 'white',
                          color: isSelected ? 'var(--color-accent-hover)' : 'var(--color-text-main)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          textAlign: 'left'
                        }}
                      >
                        {product.name}
                      </button>
                    );
                  })}
                  
                  {products.filter(p => p.category === editingMachine.type).length === 0 && (
                     <div style={{ gridColumn: '1/-1', padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                       No hay productos registrados para esta categoría ({editingMachine.type === 'coffee' ? 'Café' : 'Snacks'}). 
                       Ve a "Productos" para agregarlos.
                     </div>
                  )}
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveConfiguration}>
                <Save size={18} /> Guardar Configuración
              </button>
            </div>
          ) : (
            <div className="card" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', border: '2px dashed var(--color-border)' }}>
              Selecciona un equipo para configurar sus productos
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
