import { useState, useEffect } from 'react';
import { Edit2, Save, X, Plus, Trash2, Package, Coffee, Cookie } from 'lucide-react';
import { loadDataFromAPI, postDataToAPI, deleteDataFromAPI, updateDataFromAPI, loadOptionsFromAPI } from '../services/api';
import { ENDPOINTS } from '../utils/endpoints';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [typeMachine, setTypeMachine] = useState('coffee');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    type: '', 
    type_machine: 'coffee', 
    supplier: '',
    cost: '',
    price: '', 
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [productTypes, setProductTypes] = useState([]);
  const [typeMachines, setTypeMachines] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadDataFromAPI(ENDPOINTS.products, setProducts),
          loadOptionsFromAPI((data) => {
            setProductTypes(data.types);
            setTypeMachines(data.machines);
          }),
        ]);
      } catch (error) {
        showMessage('error', 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!newProduct.name.trim()) {
      showMessage('error', 'Por favor ingresa un nombre para el producto');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: newProduct.name,
        type_machine: typeMachine,
        supplier: newProduct.supplier || '',
        cost: parseFloat(newProduct.cost) || 0,
        price: parseFloat(newProduct.price) || 0,
      };
      
      // El tipo se asigna según type_machine (lógica en backend)
      if (typeMachine === 'snack' && newProduct.type) {
        payload.type = newProduct.type;
      } else if (typeMachine === 'coffee') {
        payload.type = 'cafe';
      }
      
      await postDataToAPI(ENDPOINTS.products, payload, () => {
        setNewProduct({ name: '', type: '', type_machine: typeMachine, supplier: '', cost: '', price: '' });
        setShowAddForm(false);
        loadDataFromAPI(ENDPOINTS.products, setProducts);
        showMessage('success', 'Producto agregado correctamente');
      });
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      setLoading(true);
      try {
        await deleteDataFromAPI(ENDPOINTS.products, id);
        await loadDataFromAPI(ENDPOINTS.products, setProducts);
        showMessage('success', 'Producto eliminado correctamente');
      } catch (error) {
        console.error('Error:', error);
        showMessage('error', 'Error de conexión');
      } finally {
        setLoading(false);
      }
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    setLoading(true);
    
    if (!editForm.name.trim()) {
      showMessage('error', 'El nombre del producto es requerido');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: editForm.name,
        type: editForm.type || 'cafe',
        type_machine: editForm.type_machine || typeMachine,
        supplier: editForm.supplier || '',
        cost: parseFloat(editForm.cost) || 0,
        price: parseFloat(editForm.price) || 0,
      };

      await updateDataFromAPI(ENDPOINTS.products, editingId, payload);
      setEditingId(null);
      setEditForm({});
      await loadDataFromAPI(ENDPOINTS.products, setProducts);
      showMessage('success', 'Producto actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => p.type_machine === typeMachine);

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl text-primary">Productos</h1>
          <p className="text-muted">Gestión por tipo de máquina</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading}
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? 'Cancelar' : `Nuevo Producto (${typeMachine === 'coffee' ? 'Café' : 'Snack'})`}
        </button>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg mb-4 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-border">
        <button
          onClick={() => setTypeMachine('coffee')}
          className="flex items-center gap-2 p-4 bg-transparent border-none border-b-2 font-semibold cursor-pointer"
          style={{
            borderBottomColor: typeMachine === 'coffee' ? 'var(--color-accent)' : 'transparent',
            color: typeMachine === 'coffee' ? 'var(--color-accent)' : 'var(--color-text-muted)',
          }}
        >
          <Coffee size={20} /> Máquinas de Café
        </button>
        <button
          onClick={() => setTypeMachine('snack')}
          className="flex items-center gap-2 p-4 bg-transparent border-none border-b-2 font-semibold cursor-pointer"
          style={{
            borderBottomColor: typeMachine === 'snack' ? 'var(--color-accent)' : 'transparent',
            color: typeMachine === 'snack' ? 'var(--color-accent)' : 'var(--color-text-muted)',
          }}
        >
          <Cookie size={20} /> Máquinas de Snacks
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-8 border border-accent">
          <h3 className="mb-4">Agregar a: {typeMachine === 'coffee' ? 'Café' : 'Snacks'}</h3>
          <form onSubmit={handleAdd} className="grid gap-4 items-end"
            style={{ gridTemplateColumns: typeMachine === 'snack' ? 'minmax(200px, 1.5fr) 1fr 1fr 1fr 1fr auto' : 'minmax(200px, 1.5fr) 1fr 1fr 1fr auto' }}
          >
            <div>
              <label className="text-xs font-semibold mb-1 block">Nombre</label>
              <input 
                className="input" 
                placeholder="Nombre del producto"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
            </div>
            
            {typeMachine === 'snack' && (
              <div>
                <label className="text-xs font-semibold mb-1 block">Tipo</label>
                <select
                  className="input"
                  value={newProduct.type}
                  onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}
                >
                  <option value="">Seleccionar...</option>
                  {productTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold mb-1 block">Proveedor</label>
              <input 
                className="input" 
                placeholder="Ej. Nestlé"
                value={newProduct.supplier}
                onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Costo ($)</label>
              <input 
                type="number" step="0.1" 
                className="input" 
                placeholder="0.00"
                value={newProduct.cost}
                onChange={(e) => setNewProduct({...newProduct, cost: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Venta ($)</label>
              <input 
                type="number" step="0.1" 
                className="input" 
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary h-[42px]" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-4">Producto</th>
              {typeMachine === 'snack' && <th className="p-4">Tipo</th>}
              <th className="p-4">Proveedor</th>
              <th className="p-4 text-right">Costo</th>
              <th className="p-4 text-right">Venta</th>
              <th className="p-4 text-right">Margen</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={typeMachine === 'snack' ? 7 : 6} className="p-8 text-center">No hay productos en esta categoría</td></tr>
            ) : filteredProducts.map(product => {
              const isEditing = editingId === product.id;

              return (
                <tr key={product.id} className="border-b border-border">
                  {/* Name */}
                  <td className="p-4 font-medium">
                    {isEditing ? (
                      <div>
                        <input 
                          className="input mb-1"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        />
                         {/* Optional Category Switcher during Edit uses internal logic, maybe hide here or keep? 
                             Keeping category switch allows moving from coffee to snack. 
                             If moving to snack, type might correspond. If moving to coffee, type is ignored. */}
                        <select 
                          className="text-xs p-1"
                          value={editForm.type_machine || ''}
                          onChange={(e) => setEditForm({...editForm, type_machine: e.target.value})}
                        >
                          <option value="coffee">Café (Máq)</option>
                          <option value="snack">Snack (Máq)</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-muted" />
                        {product.name}
                      </div>
                    )}
                  </td>
                  
                  {/* Type - Only for Snacks */}
                  {typeMachine === 'snack' && (
                    <td className="p-4">
                      {isEditing ? (
                        <select 
                          className="input" 
                          value={editForm.type || ''}
                          onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                        >
                           <option value="">-</option>
                           {productTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      ) : (
                        <span className="text-muted">
                          {productTypes.find(t => t.value === product.type)?.label || product.type || '-'}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Provider */}
                  <td className="p-4">
                    {isEditing ? (
                      <input 
                        className="input" 
                        value={editForm.supplier || ''}
                        onChange={(e) => setEditForm({...editForm, supplier: e.target.value})}
                      />
                    ) : (
                      <span className="text-muted">{product.supplier || '-'}</span>
                    )}
                  </td>
                  
                  {/* Cost */}
                  <td className="p-4 text-right">
                    {isEditing ? (
                      <input 
                        type="number" step="0.1" 
                        className="input w-20 p-1 text-right"
                        value={editForm.cost || ''}
                        onChange={(e) => setEditForm({...editForm, cost: e.target.value})}
                      />
                    ) : (
                      `$${product.cost}`
                    )}
                  </td>
                  
                  {/* Price */}
                  <td className="p-4 text-right">
                    {isEditing ? (
                      <input 
                        type="number" step="0.1" 
                        className="input w-20 p-1 text-right"
                        value={editForm.price || ''}
                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                      />
                    ) : (
                      <span className="font-semibold">${product.price}</span>
                    )}
                  </td>
                  
                  {/* Margin */}
                  <td className="p-4 text-right">
                    <div className="font-semibold" style={{ color: product.margin > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                      ${product.margin?.toFixed(2) || '0.00'}
                    </div>
                    {product.price > 0 && (
                      <div className="text-xs text-muted">
                        {product.margin_percentage?.toFixed(2) || '0.00'}%
                      </div>
                    )}
                  </td>
                  
                  {/* Actions */}
                  <td className="p-4 text-center">
                    {isEditing ? (
                      <div className="flex justify-center gap-2">
                        <button className="btn btn-primary p-1" onClick={saveEdit} disabled={loading}>
                          <Save size={16} />
                        </button>
                        <button className="btn btn-ghost p-1" onClick={cancelEdit} disabled={loading}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button className="btn btn-ghost p-1" onClick={() => startEdit(product)} disabled={loading}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-ghost p-1 text-error" onClick={() => handleDelete(product.id)} disabled={loading}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
