import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { DollarSign, Box, AlertCircle, ShoppingBag } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    salesToday: 0,
    salesTotal: 0,
    stockAlerts: 0,
    complaintsPending: 0
  });
  const [plazasData, setPlazasData] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({ coffee: [], snack: [] });

  useEffect(() => {
    const sales = db.getSales();
    const inventory = db.getInventory();
    const complaints = db.getComplaints();
    const plazas = db.getPlazas();
    const machines = db.getMachines();
    const supplies = db.getSupplies();
    const products = db.getProducts();

    // --- STATS ---
    const today = new Date().toDateString();
    const todaySales = sales
      .filter(s => new Date(s.date).toDateString() === today)
      .reduce((acc, curr) => acc + curr.total, 0);
    const totalSales = sales.reduce((acc, curr) => acc + curr.total, 0);
    const pendingComplaints = complaints.filter(c => c.status === 'pending').length;

    setStats({
      salesToday: todaySales,
      salesTotal: totalSales,
      stockAlerts: 0, 
      complaintsPending: pendingComplaints
    });

    // --- PLAZAS DATA ---
    const plazasWithMachines = plazas.map(p => ({
      ...p,
      machines: machines.filter(m => m.plazaId === p.id)
    }));
    setPlazasData(plazasWithMachines);

    // --- INVENTORY SUMMARY ---
    // Aggregate by item
    const invMap = {}; // { itemId_type: { name, qty, unit, type } }

    // Initialize with all definitions to show 0 if no logs
    supplies.forEach(s => {
      invMap[`supply_${s.id}`] = { name: s.name, qty: 0, unit: s.unit || '', type: 'coffee' };
    });
    // For snacks, usually many products, let's just track those with logs or all if few
    // Let's initialize all snacsk
    products.filter(p => p.category === 'snack').forEach(p => {
       invMap[`product_${p.id}`] = { name: p.name, qty: 0, unit: 'unid', type: 'snack' };
    });

    inventory.forEach(log => {
      const key = `${log.category}_${log.itemId}`;
      if (invMap[key]) {
        if (log.type === 'restock') invMap[key].qty += log.quantity;
        else if (log.type === 'expired') invMap[key].qty -= log.quantity;
      }
    });

    const coffeeInv = Object.values(invMap).filter(i => i.type === 'coffee').sort((a,b) => a.name.localeCompare(b.name));
    const snackInv = Object.values(invMap).filter(i => i.type === 'snack').sort((a,b) => a.name.localeCompare(b.name));

    setInventorySummary({ coffee: coffeeInv, snack: snackInv });

  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '12px', 
        backgroundColor: `${color}20`, 
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-muted" style={{ fontSize: '0.875rem' }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>Dashboard</h1>
        <p className="text-muted">Bienvenido de nuevo, {user?.name}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Ventas Hoy" value={`$${stats.salesToday.toFixed(2)}`} icon={DollarSign} color="#10b981" />
        <StatCard title="Ventas Totales" value={`$${stats.salesTotal.toFixed(2)}`} icon={ShoppingBag} color="#3b82f6" />
        <StatCard title="Alertas" value={stats.stockAlerts} icon={Box} color="#f59e0b" />
        <StatCard title="Reclamos Pendientes" value={stats.complaintsPending} icon={AlertCircle} color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* PLAZAS OVERVIEW */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Plazas y Equipos</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
             {plazasData.length === 0 ? (
               <div className="card text-muted">No hay plazas registradas.</div>
             ) : (
               plazasData.map(plaza => (
                 <div key={plaza.id} className="card">
                   <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>{plaza.name}</h4>
                   {plaza.machines.length === 0 ? (
                     <p className="text-muted" style={{ fontSize: '0.875rem' }}>Sin máquinas asignadas</p>
                   ) : (
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                       {plaza.machines.map(m => (
                         <span key={m.id} style={{ 
                           padding: '0.25rem 0.5rem', 
                           backgroundColor: m.type === 'coffee' ? '#fef3c7' : '#dbeafe', 
                           color: m.type === 'coffee' ? '#92400e' : '#1e40af',
                           borderRadius: '6px',
                           fontSize: '0.75rem',
                           fontWeight: 500,
                           display: 'flex', alignItems: 'center', gap: '0.25rem'
                         }}>
                            {m.type === 'coffee' ? '☕' : '🍫'} {m.name}
                         </span>
                       ))}
                     </div>
                   )}
                 </div>
               ))
             )}
          </div>
        </div>

        {/* INVENTORY OVERVIEW */}
        <div>
           <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Resumen de Inventario</h3>
           <div className="card" style={{ maxHeight: '500px', overflowY: 'auto' }}>
             
             <div style={{ marginBottom: '1.5rem' }}>
               <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Insumos Café</h4>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                 {inventorySummary.coffee.map((item, i) => (
                   <div key={i} style={{ backgroundColor: 'var(--color-bg)', padding: '0.5rem', borderRadius: '6px' }}>
                     <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.name}</div>
                     <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.qty} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{item.unit}</span></div>
                   </div>
                 ))}
                 {inventorySummary.coffee.length === 0 && <span className="text-muted">No hay insumos</span>}
               </div>
             </div>

             <div>
               <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Snacks / Productos</h4>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                 {inventorySummary.snack.map((item, i) => (
                   <div key={i} style={{ backgroundColor: 'var(--color-bg)', padding: '0.5rem', borderRadius: '6px' }}>
                     <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.name}</div>
                     <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.qty} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>Unid</span></div>
                   </div>
                 ))}
                 {inventorySummary.snack.length === 0 && <span className="text-muted">No hay snacks</span>}
               </div>
             </div>

           </div>
        </div>

      </div>
    </div>
  );
}
