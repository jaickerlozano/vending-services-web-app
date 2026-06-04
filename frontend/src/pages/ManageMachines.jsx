import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Monitor, Plus, Trash2, Settings, Save, Coffee, Cookie } from 'lucide-react';
import { loadDataFromAPI, postDataToAPI, deleteDataFromAPI } from '../services/api';
import { ENDPOINTS } from '../utils/endpoints';

export default function ManageMachines() {
  const [machines, setMachines] = useState([]);
  const [plazas, setPlazas] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // New Machine Form
  const [newMachine, setNewMachine] = useState({
    name: '',
    plazaId: '',
    type: 'coffee'
  });
  
  // Edit Mode
  const [editingMachine, setEditingMachine] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadDataFromAPI(ENDPOINTS.locations, setPlazas),
          loadDataFromAPI(ENDPOINTS.machines, setMachines),
          loadDataFromAPI(ENDPOINTS.products, setProducts),
        ]);
      } catch (error) {
        setMessage({ type: 'error', text: 'Error al cargar datos' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const refreshData = () => {
    loadDataFromAPI(ENDPOINTS.machines, setMachines);
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!newMachine.name.trim()) {
      showMessage('error', 'Por favor ingresa un nombre para la máquina');
      return;
    }

    try {
      await postDataToAPI(ENDPOINTS.machines, {
        name: newMachine.name,
        location: newMachine.plazaId,
        type: newMachine.type,
      }, () => {
        setNewMachine({ name: '', plazaId: '', type: 'coffee' });
        loadDataFromAPI(ENDPOINTS.machines, setMachines);
        showMessage('success', 'Máquina agregada correctamente');
      });
    } catch (error) {
      console.error('Error de conexión:', error);
      showMessage('error', 'Error de conexión con el servidor');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar equipo? Se perderá el historial asociado si no está respaldado.')) {
      try {
        await deleteDataFromAPI(ENDPOINTS.machines, id);
        await loadDataFromAPI(ENDPOINTS.machines, setMachines);
        showMessage('success', 'Equipo eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar:', error);
        showMessage('error', 'Error al eliminar el equipo');
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
      showMessage('success', 'Configuración guardada correctamente');
    }
  };

  // Filters
  const [filters, setFilters] = useState({ name: '', location: '', type: '' });

  const filteredMachines = machines.filter(m => {
    const matchesName = m.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesPlaza = filters.location ? m.location === parseInt(filters.location) : true;
    const matchesType = filters.type ? m.type === filters.type : true;
    return matchesName && matchesPlaza && matchesType;
  });

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl text-primary">Gestionar Equipos</h1>
        <p className="text-muted">Configuración de máquinas, tipos y productos asignados</p>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg mb-4 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* List & Add */}
        <div className="flex flex-col gap-8">
          
          {/* Add New Machine Form */}
          <div className="card">
            <h3 className="mb-4">Agregar Nuevo Equipo</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
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
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    checked={newMachine.type === 'coffee'} 
                    onChange={() => setNewMachine({...newMachine, type: 'coffee'})}
                  />
                  <span>Café</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
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
          <div className="card p-4 bg-bg">
            <h4 className="text-sm mb-2 text-muted">Filtrar Equipos</h4>
            <div className="grid grid-cols-2 gap-2">
              <input 
                className="input text-xs p-1.5"
                placeholder="Buscar por nombre..." 
                value={filters.name}
                onChange={(e) => setFilters({...filters, name: e.target.value})}
              />
              <select 
                className="input text-xs p-1.5"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              >
                <option value="">Todas las Plazas</option>
                {plazas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select 
                className="input text-xs p-1.5 col-span-2"
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
          {loading ? (
            <div className="text-muted text-center p-4">Cargando equipos...</div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredMachines.length === 0 ? (
                <div className="text-muted text-center p-4">No se encontraron equipos</div>
              ) : filteredMachines.map(machine => (
                <div key={machine.id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{
                      backgroundColor: machine.type === 'coffee' ? '#78350f' : '#d97706',
                    }}
                  >
                    {machine.type === 'coffee' ? <Coffee size={20} /> : <Cookie size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{machine.name}</div>
                    <div className="text-xs text-muted">
                      {plazas.find(p => p.id === machine.location)?.name} • {machine.products?.length || 0} Prod.
                    </div>
                  </div>
                  <button className="btn btn-ghost" onClick={() => setEditingMachine(machine)}>
                    <Settings size={18} />
                  </button>
                  <button className="btn btn-ghost text-error" onClick={() => handleDelete(machine.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuration Panel */}
        <div>
          {editingMachine ? (
            <div className="card sticky top-8 border-2 border-accent">
              <div className="flex justify-between mb-6">
                <h3>Configurar: {editingMachine.name}</h3>
                <button className="btn btn-ghost" onClick={() => setEditingMachine(null)}>Cancelar</button>
              </div>

              <div className="mb-4">
                <p className="text-muted text-sm mb-4">
                  Selecciona los productos disponibles en esta máquina:
                </p>
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
                  {products
                    .filter(product => product.category === editingMachine.type) // Strict category filter
                    .map(product => {
                    const isSelected = editingMachine.products?.includes(product.id);
                    return (
                      <button 
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className="p-2 rounded-lg text-left text-xs cursor-pointer"
                        style={{
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          backgroundColor: isSelected ? '#fffbeb' : 'white',
                          color: isSelected ? 'var(--color-accent-hover)' : 'var(--color-text-main)',
                        }}
                      >
                        {product.name}
                      </button>
                    );
                  })}
                  
                  {products.filter(p => p.category === editingMachine.type).length === 0 && (
                     <div className="col-span-full p-4 text-center text-sm text-muted">
                       No hay productos registrados para esta categoría ({editingMachine.type === 'coffee' ? 'Café' : 'Snacks'}). 
                       Ve a "Productos" para agregarlos.
                     </div>
                  )}
                </div>
              </div>

              <button className="btn btn-primary w-full" onClick={saveConfiguration}>
                <Save size={18} /> Guardar Configuración
              </button>
            </div>
          ) : (
            <div className="card h-[200px] flex items-center justify-center border-2 border-dashed text-muted border-border">
              Selecciona un equipo para configurar sus productos
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
