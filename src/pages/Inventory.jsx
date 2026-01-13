import { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Box, AlertTriangle, Save, History, RefreshCw, PlusCircle, X, Trash2, Edit2, ShieldAlert, FileText } from 'lucide-react';

export default function Inventory() {
  const { user } = useAuth();
  const [machines, setMachines] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [plazas, setPlazas] = useState([]); // New state for Plazas
  const [logs, setLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedItem, setSelectedItem] = useState(''); 
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState('');
  const [actionType, setActionType] = useState('restock'); // 'restock' or 'expired'

  // Quick Add removed - managed in /supplies
  // const [showNewSupplyModal, setShowNewSupplyModal] = useState(false);
  // const [newSupplyName, setNewSupplyName] = useState('');
  // const [newSupplyUnit, setNewSupplyUnit] = useState('unid');
  // const [newSupplyCost, setNewSupplyCost] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editReason, setEditReason] = useState('');

  // Audit Modal State
  const [showAuditModal, setShowAuditModal] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  // Helper to calculate cost safely
  // Helper to calculate cost safely
  const calculateTotalCost = (itemId, qty) => {
    if (!itemId || !qty || actionType !== 'restock') return;
    
    // Safety check for machines/data availability
    // Use loose equality for ID matching to handle string/number differences
    const machine = machines.find(m => m.id == selectedMachine);
    if (!machine) return;

    let unitCost = 0;
    if (machine.type === 'coffee') {
      const s = supplies.find(sup => sup.id == itemId);
      unitCost = s?.cost || 0;
    } else {
      const p = products.find(prod => prod.id == itemId);
      unitCost = p?.cost || 0;
    }

    if (unitCost > 0) {
      setTotalCost((unitCost * Number(qty)).toFixed(2));
    }
  };

  const refreshData = () => {
    setMachines(db.getMachines() || []);
    setProducts(db.getProducts() || []);
    setSupplies(db.getSupplies() || []);
    setPlazas(db.getPlazas() || []); // Load Plazas
    setLogs((db.getInventory() || []).sort((a, b) => new Date(b.date) - new Date(a.date)));
    setAuditLogs((db.getAuditLogs() || []).sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  // Submit State using Ref for synchronous blocking
  const [isSubmitting, setIsSubmitting] = useState(false); // For UI feedback
  const isSubmittingRef = useRef(false); // For logical blocking

  // Derived state
  const selectedMachineData = machines.find(m => m.id === Number(selectedMachine));
  const isCoffeeMachine = selectedMachineData?.type === 'coffee';
  const currentPlazaName = plazas.find(p => p.id == selectedMachineData?.plazaId)?.name || 'Sin Plaza asignada';

  const handleSave = async () => {
    // Synchronous check against ref
    if (!selectedMachine || !selectedItem || isSubmittingRef.current) return; 

    // Lock immediately
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      let itemName = 'Desconocido';
      
      if (isCoffeeMachine) {
        const supply = supplies.find(s => s.id === Number(selectedItem));
        if (supply) itemName = supply.name;
      } else {
        const product = products.find(p => p.id === Number(selectedItem));
        if (product) itemName = product.name;
      }

      // Find Plaza Info - Use loose equality
      const plaza = plazas.find(p => p.id == selectedMachineData?.plazaId);

      const inventoryLog = {
        machineId: Number(selectedMachine),
        itemId: Number(selectedItem),
        itemName: itemName,
        machineName: selectedMachineData?.name || 'Máquina',
        plazaId: plaza?.id || null, 
        plazaName: plaza?.name || 'Sin Plaza', 
        quantity: Number(quantity),
        type: actionType,
        category: isCoffeeMachine ? 'supply' : 'product',
        totalCost: actionType === 'restock' ? (Number(totalCost) || 0) : 0
      };
      
      // Delay to ensure UI updates and prevent rapid clicks
      await new Promise(r => setTimeout(r, 500));

      if (editingId) {
         if (!editReason) {
           alert('Por favor ingrese un motivo para la corrección');
           isSubmittingRef.current = false;
           setIsSubmitting(false);
           return;
         }
         db.updateInventoryLog(editingId, inventoryLog, user?.name, editReason);
         setEditingId(null);
         setEditReason('');
         alert('Registro actualizado');
      } else {
         db.addInventoryLog(inventoryLog);
         // Don't show alert for standard add to speed up workflow? Or keep it?
         // Keeping it simple for now, maybe use toast later.
         console.log('Movimiento registrado');
      }
      
      refreshData();
      setQuantity(1);
      setTotalCost('');
      if (editingId) setSelectedMachine('');
      
    } catch (error) {
      console.error(error);
      alert('Error al guardar el registro');
    } finally {
      // Release lock
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };
// ...
// Inside the render, inside the form, AFTER Machine Selector, BEFORE Item Selector
// This is to satisfy "Opcion de Plaza" visibility
/* 
   We will insert this block via replacement chunks 
*/
  const handleEdit = (log) => {
    setEditingId(log.id);
    setSelectedMachine(log.machineId);
    setSelectedItem(log.itemId);
    setQuantity(log.quantity);
    setTotalCost(log.totalCost || '');
    setActionType(log.type);
    setEditReason('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    const reason = prompt('¿Está seguro de eliminar este registro? Ingrese el motivo:');
    if (reason !== null) { 
      if (!reason) {
         alert('Debe ingresar un motivo para eliminar el registro.');
         return;
      }
      db.deleteInventoryLog(id, user?.name, reason);
      refreshData();
    }
  };

  const handleClearAll = () => {
    if (!confirm('ADVERTENCIA: ¿Estás seguro de que quieres BORRAR TODO el historial de inventario? Esta acción no se puede deshacer.')) {
      return;
    }
    const password = prompt('Por seguridad, ingrese la contraseña de administrador:');
    if (password === 'admin') { 
       db.clearInventory(user?.name);
       refreshData();
       alert('El inventario ha sido reiniciado por completo.');
    } else {
       alert('Contraseña incorrecta. Acción cancelada.');
    }
  };

  const getUnitLabel = () => {
    if (!isCoffeeMachine) return '';
    if (!selectedItem) return '(Kg / L / Unid)';
    const s = supplies.find(sup => sup.id === Number(selectedItem));
    return s?.unit ? `(${s.unit})` : '(Unid)';
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditReason('');
    setQuantity(1);
    setTotalCost('');
    setSelectedMachine('');
    setSelectedItem('');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>Control de Inventario</h1>
           <p className="text-muted">Gestión de reposiciones y registro de mermas</p>
        </div>
        
        {user?.role === 'admin' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setShowAuditModal(true)} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
              <FileText size={16} /> Ver Auditoría
            </button>
            <button onClick={handleClearAll} className="btn" style={{ backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.8rem' }}>
              <ShieldAlert size={16} /> Reiniciar Inventario
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '2rem' }}>
        
        {/* INPUT FORM */}
        <div className="card" style={{ height: 'fit-content', border: editingId ? '2px solid var(--color-primary)' : 'none' }}>
          
          {editingId && (
             <div style={{ marginBottom: '1rem', backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '4px', color: '#1e40af', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span>Editando registro...</span>
               <button onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={16}/></button>
             </div>
          )}

          {/* Action Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
            <button 
              className={`btn ${actionType === 'restock' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1 }}
              onClick={() => setActionType('restock')}
            >
              <RefreshCw size={18} /> Reposición
            </button>
            <button 
              className={`btn ${actionType === 'expired' ? 'btn-ghost' : 'btn-ghost'}`} 
              style={{ 
                flex: 1, 
                backgroundColor: actionType === 'expired' ? '#fee2e2' : 'transparent',
                color: actionType === 'expired' ? '#ef4444' : 'inherit'
              }}
              onClick={() => setActionType('expired')}
            >
              <AlertTriangle size={18} /> Mermas
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Machine Selector */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Máquina</label>
              <select 
                className="input" 
                value={selectedMachine} 
                onChange={(e) => {
                  setSelectedMachine(e.target.value);
                  setSelectedItem('');
                }}
              >
                <option value="">-- Seleccionar Máquina --</option>
                {machines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.type === 'coffee' ? 'Café' : 'Snack'})
                  </option>
                ))}
              </select>
            </div>

            {/* Plaza Display (Read Only) */}
            {selectedMachine && (
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                 <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                   Ubicación (Plaza)
                 </label>
                 <div style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                   {currentPlazaName}
                 </div>
              </div>
            )}

            {/* Item Selector (Conditional) */}
            {selectedMachine && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem' }}>
                    {isCoffeeMachine ? 'Insumo' : 'Producto'}
                  </label>
                  {isCoffeeMachine && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      Gestione costos en <a href="/supplies" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Insumos</a>
                    </div>
                  )}
                </div>

                <select 
                  className="input" 
                  value={selectedItem} 
                  onChange={(e) => {
                    const newItemId = e.target.value;
                    setSelectedItem(newItemId);
                    calculateTotalCost(newItemId, quantity);
                  }}
                >
                  <option value="">-- Seleccionar --</option>
                  {isCoffeeMachine ? (
                    supplies.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.unit || 'unid'}) - ${s.cost || 0}
                      </option>
                    ))
                  ) : (
                    products
                      .filter(p => p.category === 'snack') 
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))
                  )}
                </select>
              </div>
            )}

            {/* Quantity Input */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Cantidad {getUnitLabel()}
              </label>
              <input 
                type="number" 
                min="0.1" 
                step="0.1"
                className="input" 
                value={quantity} 
                onChange={(e) => {
                  const newQty = e.target.value;
                  setQuantity(newQty);
                  calculateTotalCost(selectedItem, newQty);
                }} 
              />
            </div>

            {/* Cost Input (Only for Restock - Read Only) */}
            {actionType === 'restock' && (
              <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#166534' }}>
                   Costo Total (Calculado)
                 </label>
                 <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <div style={{ position: 'relative', flex: 1 }}>
                     <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#166534' }}>$</span>
                     <input 
                       type="number" 
                       className="input" 
                       style={{ paddingLeft: '1.5rem', borderColor: '#bbf7d0', backgroundColor: '#dcfce7', cursor: 'not-allowed' }}
                       value={totalCost} 
                       readOnly
                       placeholder="0.00"
                     />
                   </div>
                   <div style={{ fontSize: '0.8rem', color: '#166534', flex: 1 }}>
                     * Basado en el costo unitario definido en Insumos.
                   </div>
                 </div>
              </div>
            )}
            
            {/* Reason Input (Only when Editing) */}
            {editingId && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  Motivo de la corrección <span style={{color: 'red'}}>*</span>
                </label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Ej. Error de dedo, Mal conteo..."
                  value={editReason} 
                  onChange={(e) => setEditReason(e.target.value)} 
                  required
                />
              </div>
            )}

            <button 
              className="btn"
              style={{ 
                marginTop: '1rem', 
                backgroundColor: actionType === 'restock' ? 'var(--color-primary)' : '#ef4444',
                color: 'white',
                opacity: isSubmitting ? 0.7 : 1
              }}
              onClick={handleSave}
              disabled={!selectedMachine || !selectedItem || isSubmitting}
            >
              <Save size={18} />
              {isSubmitting ? 'Guardando...' : (editingId ? 'Actualizar Registro' : (actionType === 'restock' ? 'Registrar Movimiento' : 'Registrar Merma'))}
            </button>
            {editingId && (
              <button 
                className="btn btn-ghost" 
                onClick={cancelEdit}
                style={{ width: '100%' }}
              >
                Cancelar Edición
              </button>
            )}
          </div>
        </div>

        {/* LOGS HISTORY */}
        <div>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} /> Historial Reciente
          </h3>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Fecha</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Detalle</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Tipo</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No hay movimientos recientes</td>
                  </tr>
                ) : (
                  logs.slice(0, 10).map((log, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: editingId === log.id ? '#eff6ff' : 'transparent' }}>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        <div>{new Date(log.date).toLocaleDateString()}</div>
                        <div style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)'}}>{log.plazaName || ''}</div>
                        <div style={{fontSize: '0.7rem', color: 'var(--color-text-muted)'}}>{log.machineName}</div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        <span style={{ fontWeight: 500 }}>{log.quantity}</span> {log.category === 'supply' ? '' : 'unid'} x {log.itemName}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                         <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '99px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: log.type === 'restock' ? '#dcfce7' : '#fee2e2',
                          color: log.type === 'restock' ? '#166534' : '#991b1b'
                        }}>
                          {log.type === 'restock' ? 'Carga' : 'Merma'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                         <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                           <button onClick={() => handleEdit(log)} className="btn-ghost" style={{ padding: '0.25rem' }} title="Editar">
                             <Edit2 size={16} />
                           </button>
                           <button onClick={() => handleDelete(log.id)} className="btn-ghost" style={{ padding: '0.25rem', color: '#ef4444' }} title="Eliminar">
                             <Trash2 size={16} />
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AUDIT LOG MODAL */}
      {showAuditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} /> Historial de Cambios (Auditoría)
              </h3>
              <button className="btn btn-ghost" onClick={() => setShowAuditModal(false)}><X size={20} /></button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                   <th style={{ padding: '0.75rem' }}>Fecha/Hora</th>
                   <th style={{ padding: '0.75rem' }}>Responsable</th>
                   <th style={{ padding: '0.75rem' }}>Acción</th>
                   <th style={{ padding: '0.75rem' }}>Detalle</th>
                   <th style={{ padding: '0.75rem' }}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No hay registros de auditoría</td></tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem' }}>{new Date(log.date).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 500 }}>{log.user}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          padding: '0.15rem 0.4rem', borderRadius: '4px',
                          backgroundColor: log.action === 'DELETE' ? '#fee2e2' : '#dbeafe',
                          color: log.action === 'DELETE' ? '#b91c1c' : '#1e40af',
                          fontSize: '0.7rem', fontWeight: 600
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>{log.details}</td>
                      <td style={{ padding: '0.75rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>{log.reason || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setShowAuditModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
