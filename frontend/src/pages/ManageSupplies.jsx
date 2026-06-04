import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Coffee } from 'lucide-react';
import { loadDataFromAPI, postDataToAPI, updateDataFromAPI, deleteDataFromAPI } from '../services/api';
import { ENDPOINTS } from '../utils/endpoints';

export default function ManageSupplies() {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newSupply, setNewSupply] = useState({
    name: '',
    unit: 'unid',
    cost: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', unit: 'unid', cost: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await loadDataFromAPI(ENDPOINTS.supplies, setSupplies);
      } catch (error) {
        showMessage('error', 'Error al cargar insumos');
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

  const refreshData = async () => {
    setLoading(true);
    try {
      await loadDataFromAPI(ENDPOINTS.supplies, setSupplies);
    } catch (error) {
      showMessage('error', 'Error al recargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSupply.name) return;
    try {
      await postDataToAPI(ENDPOINTS.supplies, newSupply, () => {
        setNewSupply({ name: '', unit: 'unid', cost: '' });
        refreshData();
        showMessage('success', 'Insumo agregado correctamente');
      });
    } catch (error) {
      console.error('Error al guardar insumo:', error);
      showMessage('error', 'Error al guardar el insumo');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar insumo? Se eliminará de la lista de selección.')) {
      try {
        await deleteDataFromAPI(ENDPOINTS.supplies, id);
        refreshData();
        showMessage('success', 'Insumo eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar insumo:', error);
        showMessage('error', 'Error al eliminar el insumo');
      }
    }
  };

  const startEdit = (supply) => {
    setEditingId(supply.id);
    setEditForm({ name: supply.name, unit: supply.unit || 'unid', cost: supply.cost || '' });
  };

  const saveEdit = async () => {
    try {
      await updateDataFromAPI(ENDPOINTS.supplies, editingId, { 
        name: editForm.name, 
        unit: editForm.unit,
        cost: Number(editForm.cost) || 0
      });
      setEditingId(null);
      refreshData();
      showMessage('success', 'Insumo actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar insumo:', error);
      showMessage('error', 'Error al actualizar el insumo');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', unit: 'unid', cost: '' });
  };

  const units = [
    { value: 'unid', label: 'Unidades' },
    { value: 'kg', label: 'Kilogramos' },
    { value: 'g', label: 'Gramos' },
    { value: 'pqte', label: 'Paquete' },
    { value: 'frasco', label: 'Frasco' }
  ];

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl text-primary">Gestión de Insumos</h1>
        <p className="text-muted">Administra los insumos (materias primas) para máquinas de café</p>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg mb-4 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-[minmax(300px,1fr)_1.5fr] gap-8">
        
        {/* ADD FORM */}
        <div className="card h-fit">
          <h3 className="mb-4">Nuevo Insumo</h3>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div>
              <label className="block mb-2 text-sm">Nombre del Insumo</label>
              <input 
                className="input" 
                placeholder="Ej. Leche Descremada"
                value={newSupply.name}
                onChange={(e) => setNewSupply({...newSupply, name: e.target.value})}
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-2 text-sm">Unidad</label>
                <select 
                  className="input" 
                  value={newSupply.unit}
                  onChange={(e) => setNewSupply({...newSupply, unit: e.target.value})}
                >
                  {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block mb-2 text-sm">Costo Unit. ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="input" 
                  placeholder="0.00"
                  value={newSupply.cost}
                  onChange={(e) => setNewSupply({...newSupply, cost: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <Plus size={18} /> Agregar
            </button>
          </form>
          <div className="mt-6 text-sm text-muted">
            <p>Estos insumos aparecerán disponibles en la sección <strong>Inventario</strong> cuando selecciones una máquina de café.</p>
          </div>
        </div>

        {/* LIST */}
        <div className="card">
          <h3 className="mb-4 flex items-center gap-2">
            <Coffee size={20} className="text-muted" /> Catálogo de Insumos
          </h3>
          <div className="flex flex-col gap-2">
            {loading ? (
              <div className="text-muted text-center p-4">Cargando...</div>
            ) : supplies.length === 0 ? (
              <div className="text-muted text-center p-4">No hay insumos registrados</div>
            ) : supplies.map(supply => (
              <div key={supply.id} className="p-4 flex justify-between items-center border-b border-border">
                {editingId === supply.id ? (
                  <div className="flex gap-2 flex-1 mr-4 items-center flex-wrap">
                    <input 
                      className="input flex-[2] min-w-[120px]" 
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      autoFocus
                    />
                    <select 
                      className="input flex-1 min-w-[80px] p-2" 
                      value={editForm.unit}
                      onChange={(e) => setEditForm({...editForm, unit: e.target.value})}
                    >
                      {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                    <input 
                      type="number"
                      step="0.01"
                      className="input flex-1 min-w-[80px]" 
                      value={editForm.cost}
                      onChange={(e) => setEditForm({...editForm, cost: e.target.value})}
                      placeholder="Costo"
                    />
                    <div className="flex gap-1">
                      <button className="btn btn-primary p-2" onClick={saveEdit}><Save size={16} /></button>
                      <button className="btn btn-ghost p-2" onClick={cancelEdit}><X size={16} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between w-full items-center">
                    <div className="flex flex-col">
                      <span className="font-medium">{supply.name}</span>
                      <span className="text-xs text-muted">
                        {units.find(u => u.value === supply.unit)?.label || 'Unidades'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-primary">
                          ${Number(supply.cost || 0).toFixed(2)}
                        </div>
                        <div className="text-[0.7rem] text-muted">Costo Unit.</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost p-2" onClick={() => startEdit(supply)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-ghost p-2 text-error" onClick={() => handleDelete(supply.id)}>
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
