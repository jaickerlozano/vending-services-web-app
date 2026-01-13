import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Plus, Trash2, Save } from 'lucide-react';

export default function Sales() {
  const [plazas, setPlazas] = useState([]);
  const [machines, setMachines] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [selectedPlaza, setSelectedPlaza] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setPlazas(db.getPlazas());
    setProducts(db.getProducts());
  }, []);

  useEffect(() => {
    if (selectedPlaza) {
      setMachines(db.getMachines().filter(m => m.plazaId === parseInt(selectedPlaza)));
    } else {
      setMachines([]);
    }
    // Reset selection when plaza changes
    setSelectedMachine('');
    setCart([]);
  }, [selectedPlaza]);

  useEffect(() => {
    if (selectedMachine) {
      const machine = machines.find(m => m.id === parseInt(selectedMachine));
      const allProducts = db.getProducts();
      
      // Filter products based on machine configuration
      // Filter products based on machine configuration or type
      if (machine && machine.products && machine.products.length > 0) {
        setProducts(allProducts.filter(p => machine.products.includes(p.id)));
      } else if (machine) {
        // Fallback: Filter by Category matching Machine Type
        setProducts(allProducts.filter(p => p.category === machine.type));
      } else {
        setProducts([]);
      }
    } else {
      setProducts([]);
    }
    setCart([]);
  }, [selectedMachine, machines]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = () => {
    if (!selectedMachine || cart.length === 0) return;

    const saleData = {
      machineId: parseInt(selectedMachine),
      items: cart,
      total: cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
    };

    db.addSale(saleData);
    alert('Venta registrada correctamente');
    setCart([]);
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>Registro de Ventas</h1>
          <p className="text-muted">Ingresa las ventas diarias por equipo</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Selection Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Ubicación</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Plaza</label>
                <select 
                  className="input" 
                  value={selectedPlaza} 
                  onChange={(e) => setSelectedPlaza(e.target.value)}
                >
                  <option value="">Seleccionar Plaza...</option>
                  {plazas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Equipo / Máquina</label>
                <select 
                  className="input" 
                  value={selectedMachine} 
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  disabled={!selectedPlaza}
                >
                  <option value="">Seleccionar Máquina...</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.type === 'coffee' ? 'Café' : 'Snack'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
             <h3 style={{ marginBottom: '1rem' }}>Productos</h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
               {products.map(product => (
                 <button 
                   key={product.id}
                   onClick={() => addToCart(product)}
                   className="btn"
                   style={{ 
                     backgroundColor: 'var(--color-surface-hover)', 
                     border: '1px solid var(--color-border)',
                     flexDirection: 'column',
                     alignItems: 'flex-start',
                     padding: '1rem'
                   }}
                 >
                   <span style={{ fontWeight: 600 }}>{product.name}</span>
                   <span style={{ color: 'var(--color-accent)', fontSize: '0.875rem' }}>${product.price.toFixed(2)}</span>
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Resumen Venta */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              Resumen
              <span style={{ color: 'var(--color-accent)' }}>${total.toFixed(2)}</span>
            </h3>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                Selecciona productos para agregar a la venta
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>${item.price.toFixed(2)} c/u</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => updateQty(item.id, -1)}>-</button>
                      <span style={{ fontWeight: 600, minWidth: '1.5rem', textAlign: 'center' }}>{item.qty}</span>
                      <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => updateQty(item.id, 1)}>+</button>
                      <button className="btn btn-ghost" style={{ color: 'var(--color-error)', padding: '0.25rem' }} onClick={() => removeItem(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '2rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                onClick={handleSave}
                disabled={!selectedMachine || cart.length === 0}
              >
                <Save size={20} />
                Registrar Venta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
