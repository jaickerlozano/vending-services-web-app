import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Edit2, Save, X, Plus, Trash2, Package, Coffee, Cookie } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('coffee'); // 'coffee' | 'snack'
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  // New Product State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', provider: '', cost: '', price: '', productType: '' });

  useEffect(() => {
    refreshProducts();
  }, []);

  const refreshProducts = () => {
    setProducts(db.getProducts());
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    db.addProduct({
      name: newProduct.name,
      provider: newProduct.provider,
      category: activeTab, // Auto-assign to current tab category
      productType: newProduct.productType, // New sub-type
      cost: parseFloat(newProduct.cost) || 0,
      price: parseFloat(newProduct.price) || 0
    });

    setNewProduct({ name: '', provider: '', cost: '', price: '', productType: '' });
    setShowAddForm(false);
    refreshProducts();
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar producto?')) {
      db.deleteProduct(id);
      refreshProducts();
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

  const saveEdit = () => {
    db.updateProduct(editingId, {
      name: editForm.name,
      provider: editForm.provider,
      category: editForm.category,
      productType: editForm.productType,
      cost: parseFloat(editForm.cost),
      price: parseFloat(editForm.price)
    });
    setEditingId(null);
    refreshProducts();
  };

  const filteredProducts = products.filter(p => p.category === activeTab);
  
  const PRODUCT_TYPES = [
    'Bebidas', 'Lácteos', 'Golosinas', 'Snacks', 'Bollería', 'No Comestibles', 'Otros'
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>Productos</h1>
          <p className="text-muted">Gestión por tipo de máquina</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? 'Cancelar' : `Nuevo Producto (${activeTab === 'coffee' ? 'Café' : 'Snack'})`}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
        <button
          onClick={() => setActiveTab('coffee')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'coffee' ? '2px solid var(--color-accent)' : '2px solid transparent',
            color: activeTab === 'coffee' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Coffee size={20} /> Máquinas de Café
        </button>
        <button
          onClick={() => setActiveTab('snack')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'snack' ? '2px solid var(--color-accent)' : '2px solid transparent',
            color: activeTab === 'snack' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Cookie size={20} /> Máquinas de Snacks
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-accent)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Agregar a: {activeTab === 'coffee' ? 'Café' : 'Snacks'}</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: activeTab === 'snack' ? 'minmax(200px, 1.5fr) 1fr 1fr 1fr 1fr auto' : 'minmax(200px, 1.5fr) 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Nombre</label>
              <input 
                className="input" 
                placeholder="Nombre del producto"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
            </div>
            
            {activeTab === 'snack' && (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Tipo</label>
                <select
                  className="input"
                  value={newProduct.productType}
                  onChange={(e) => setNewProduct({...newProduct, productType: e.target.value})}
                >
                  <option value="">Seleccionar...</option>
                  {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Proveedor</label>
              <input 
                className="input" 
                placeholder="Ej. Nestlé"
                value={newProduct.provider}
                onChange={(e) => setNewProduct({...newProduct, provider: e.target.value})}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Costo ($)</label>
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
              <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Venta ($)</label>
              <input 
                type="number" step="0.1" 
                className="input" 
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
              Guardar
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Producto</th>
              {activeTab === 'snack' && <th style={{ padding: '1rem' }}>Tipo</th>}
              <th style={{ padding: '1rem' }}>Proveedor</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Costo</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Venta</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Margen</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={activeTab === 'snack' ? 7 : 6} style={{ padding: '2rem', textAlign: 'center' }}>No hay productos en esta categoría</td></tr>
            ) : filteredProducts.map(product => {
              const isEditing = editingId === product.id;
              const margin = product.price - product.cost;

              return (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {/* Name */}
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    {isEditing ? (
                      <div>
                        <input 
                          className="input" 
                          style={{ marginBottom: '0.25rem' }}
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        />
                         {/* Optional Category Switcher during Edit uses internal logic, maybe hide here or keep? 
                             Keeping category switch allows moving from coffee to snack. 
                             If moving to snack, type might correspond. If moving to coffee, type is ignored. */}
                        <select 
                          style={{ fontSize: '0.75rem', padding: '0.25rem' }}
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        >
                          <option value="coffee">Café (Máq)</option>
                          <option value="snack">Snack (Máq)</option>
                        </select>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={16} className="text-muted" />
                        {product.name}
                      </div>
                    )}
                  </td>
                  
                  {/* Type - Only for Snacks */}
                  {activeTab === 'snack' && (
                    <td style={{ padding: '1rem' }}>
                      {isEditing ? (
                        <select 
                          className="input" 
                          value={editForm.productType || ''}
                          onChange={(e) => setEditForm({...editForm, productType: e.target.value})}
                        >
                           <option value="">-</option>
                           {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ) : (
                        <span className="text-muted">{product.productType || '-'}</span>
                      )}
                    </td>
                  )}

                  {/* Provider */}
                  <td style={{ padding: '1rem' }}>
                    {isEditing ? (
                      <input 
                        className="input" 
                        value={editForm.provider || ''}
                        onChange={(e) => setEditForm({...editForm, provider: e.target.value})}
                      />
                    ) : (
                      <span className="text-muted">{product.provider || '-'}</span>
                    )}
                  </td>
                  
                  {/* Cost */}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {isEditing ? (
                      <input 
                        type="number" step="0.1" 
                        className="input" 
                        style={{ width: '80px', padding: '0.25rem', textAlign: 'right' }}
                        value={editForm.cost}
                        onChange={(e) => setEditForm({...editForm, cost: e.target.value})}
                      />
                    ) : (
                      `$${product.cost.toFixed(2)}`
                    )}
                  </td>
                  
                  {/* Price */}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {isEditing ? (
                      <input 
                        type="number" step="0.1" 
                        className="input" 
                        style={{ width: '80px', padding: '0.25rem', textAlign: 'right' }}
                        value={editForm.price}
                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                      />
                    ) : (
                      <span style={{ fontWeight: 600 }}>${product.price.toFixed(2)}</span>
                    )}
                  </td>
                  
                  {/* Margin */}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ color: margin > 0 ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                      ${margin.toFixed(2)}
                    </div>
                    {product.price > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {((margin / product.price) * 100).toFixed(1)}%
                      </div>
                    )}
                  </td>
                  
                  {/* Actions */}
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button className="btn btn-primary" style={{ padding: '0.25rem' }} onClick={saveEdit}>
                          <Save size={16} />
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={cancelEdit}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => startEdit(product)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--color-error)' }} onClick={() => handleDelete(product.id)}>
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
