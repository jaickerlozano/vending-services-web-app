
import { useState, useEffect } from 'react';
import { db } from '../services/db';
import BarChart from '../components/BarChart';
import { Filter, Calendar } from 'lucide-react';

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    netIncome: 0,
    salesByPlaza: [],
    salesByDate: []
  });

  // Global Filters
  const [plazas, setPlazas] = useState([]);
  const [machines, setMachines] = useState([]);
  const [filterPlaza, setFilterPlaza] = useState('all');
  const [filterMachine, setFilterMachine] = useState('all');

  // Supply Report State (Legacy filters kept for time period, but grouping might be redundant if we filter globally)
  const [supplyReport, setSupplyReport] = useState([]);
  const [supplyFilter, setSupplyFilter] = useState('30days'); // 7days, 30days, quarter
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    // Load initial data for filters
    setPlazas(db.getPlazas());
    setMachines(db.getMachines());
  }, []);

  useEffect(() => {
    refreshReports();
  }, [filterPlaza, filterMachine, supplyFilter]);

  const refreshReports = () => {
    const allSales = db.getSales();
    const allInventoryLogs = db.getInventory();
    
    // 1. FILTER DATA BASED ON SELECTION
    let filteredSales = allSales;
    let filteredInventory = allInventoryLogs;

    if (filterPlaza !== 'all') {
      // Filter Sales by Plaza
      filteredSales = filteredSales.filter(sale => {
         const m = machines.find(mac => mac.id === sale.machineId);
         return m && String(m.plazaId) === String(filterPlaza);
      });
      // Filter Inventory by Plaza
      filteredInventory = filteredInventory.filter(log => {
         // Try to use the direct plazaId if saved, otherwise fallback to machine lookup
         if (log.plazaId) return String(log.plazaId) === String(filterPlaza);
         const m = machines.find(mac => mac.id === log.machineId);
         return m && String(m.plazaId) === String(filterPlaza);
      });
    }

    if (filterMachine !== 'all') {
       filteredSales = filteredSales.filter(sale => String(sale.machineId) === String(filterMachine));
       filteredInventory = filteredInventory.filter(log => String(log.machineId) === String(filterMachine));
    }

    setInventory(filteredInventory); // Update table with filtered data
    
    // --- FINANCIAL METRICS (CALCULATED ON FILTERED DATA) ---
    let totalSales = 0;
    filteredSales.forEach(sale => totalSales += sale.total);

    let totalExpenses = 0;
    filteredInventory.forEach(log => {
      if (log.type === 'restock' && log.totalCost) {
        totalExpenses += Number(log.totalCost);
      }
    });

    const netIncome = totalSales - totalExpenses;

    // Charts Data (Always based on filtered context)
    const salesByPlazaMap = {};
    const salesByDateMap = {};
    filteredSales.forEach(sale => {
       const machine = machines.find(m => m.id === sale.machineId);
       if (machine) {
         const plaza = plazas.find(p => p.id === machine.plazaId);
         if (plaza) salesByPlazaMap[plaza.name] = (salesByPlazaMap[plaza.name] || 0) + sale.total;
       }
       const dateKey = new Date(sale.date).toLocaleDateString();
       salesByDateMap[dateKey] = (salesByDateMap[dateKey] || 0) + sale.total;
    });

    setStats({
      totalSales,
      totalExpenses,
      netIncome,
      salesByPlaza: Object.entries(salesByPlazaMap).map(([k, v]) => ({ label: k, value: v, color: '#3b82f6' })),
      salesByDate: Object.entries(salesByDateMap).map(([k, v]) => ({ label: k, value: v, color: '#10b981' })).slice(-7)
    });
    setSales(filteredSales.reverse());

    // --- SUPPLY CONSUMPTION REPORT (Apply Time Filter + Global Filters) ---
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0); 
    
    if (supplyFilter === '7days') startDate.setDate(now.getDate() - 7);
    else if (supplyFilter === '30days') startDate.setDate(now.getDate() - 30);
    else if (supplyFilter === 'quarter') startDate.setDate(now.getDate() - 90);

    const supplyLogs = filteredInventory.filter(log => {
      const logDate = new Date(log.date);
      return log.category === 'supply' && log.type === 'restock' && logDate >= startDate;
    });
    
    // Just group by Total for simplicity in this filtered view, or keep functionality?
    // Let's just list items since we are likely looking at a specific context.
    // If Global Filter is 'All', we group by 'Total'.
    // Actually, user might still want to know "Which machine consumed what" inside a Plaza.
    // Let's simplify and just group by Item Name (Total) for the filtered scope.
    
    const supplyUsage = {}; 
    supplyLogs.forEach(log => {
      if (!supplyUsage[log.itemName]) {
        supplyUsage[log.itemName] = { qty: 0, unit: log.unit || '' };
      }
      supplyUsage[log.itemName].qty += log.quantity;
    });

    const formattedSupplyReport = [{
       group: 'Resumen (Filtro Actual)',
       items: Object.entries(supplyUsage).map(([name, data]) => ({ name, qty: data.qty, unit: data.unit })).sort((a,b) => b.qty - a.qty)
    }];

    setSupplyReport(formattedSupplyReport.filter(g => g.items.length > 0));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>Reportes y Métricas</h1>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Análisis de rendimiento financiero (Flujo de Caja)</p>
        
        {/* GLOBAL FILTERS */}
        <div style={{ padding: '1rem', backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
           <div style={{ flex: 1, minWidth: '200px' }}>
             <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>Filtrar por Plaza</label>
             <select 
               className="input" 
               value={filterPlaza} 
               onChange={(e) => {
                 setFilterPlaza(e.target.value);
                 setFilterMachine('all'); // Reset machine when plaza changes
               }}
             >
               <option value="all">Todas las Plazas</option>
               {plazas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
           </div>
           
           <div style={{ flex: 1, minWidth: '200px' }}>
             <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>Filtrar por Máquina</label>
             <select 
                className="input" 
                value={filterMachine} 
                onChange={(e) => setFilterMachine(e.target.value)}
                disabled={filterPlaza === 'all' && machines.length > 10} // Optional: user can still pick if they want
             >
               <option value="all">Todas las Máquinas</option>
               {machines
                  .filter(m => filterPlaza === 'all' || String(m.plazaId) === String(filterPlaza))
                  .map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))
               }
             </select>
           </div>
           
           <button 
             className="btn btn-ghost" 
             style={{ height: '38px', marginTop: '1.25rem' }} 
             onClick={() => { setFilterPlaza('all'); setFilterMachine('all'); }}
             title="Limpiar Filtros"
           >
             <Filter size={16} /> Limpiar
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Sales Card */}
        <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>Ingresos (Ventas)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${stats.totalSales.toFixed(2)}</div>
        </div>
        
        {/* Expenses Card */}
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>Egresos (Reposición)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>-${stats.totalExpenses?.toFixed(2) || '0.00'}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Costo de insumos/snack cargados</div>
        </div>

        {/* Net Income Card */}
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>Ingreso Neto (Caja)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stats.netIncome >= 0 ? '#10b981' : '#ef4444' }}>
            ${stats.netIncome?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Ventas - Gastos de Reposición</div>
        </div>
      </div>

      {/* SUPPLY REPORT SECTION */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3>Consumo de Insumos</h3>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} className="text-muted" />
              <select className="input" style={{ padding: '0.25rem' }} value={supplyFilter} onChange={(e) => setSupplyFilter(e.target.value)}>
                <option value="7days">Últimos 7 días</option>
                <option value="30days">Últimos 30 días</option>
                <option value="quarter">Últimos 90 días</option>
              </select>
            </div>
          </div>
        </div>

        {supplyReport.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f9fafb', border: '1px dashed var(--color-border)' }}>
             <p className="text-muted">No se encontraron cargas de insumos en este periodo.</p>
             <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Verifique que ha registrado movimientos de tipo 'Reposición' en máquinas de Café.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {supplyReport.map((groupData) => (
              <div key={groupData.group}>
                <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.25rem' }}>
                  {groupData.group}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                  {groupData.items.map(item => (
                    <div key={item.name} style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '8px' }}>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.name}</div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {item.qty} <span style={{fontSize: '0.8rem', fontWeight: 400}}>{item.unit || ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DEBUG / AUDIT TABLE FOR SUPPLIES */}
        <div style={{ marginTop: '2rem' }}>
          <h4 className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Detalle de Cargas (Últimos movimientos)</h4>
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f3f4f6' }}>
                <tr>
                   <th style={{ padding: '0.5rem' }}>Fecha</th>
                   <th style={{ padding: '0.5rem' }}>Categoría</th>
                   <th style={{ padding: '0.5rem' }}>Máquina</th>
                   <th style={{ padding: '0.5rem' }}>Ítem</th>
                   <th style={{ padding: '0.5rem' }}>Cant.</th>
                </tr>
              </thead>
              <tbody>
                 {inventory
                    .filter(log => log.type === 'restock')
                    .sort((a,b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map((log, idx) => (
                   <tr key={idx} style={{ borderTop: '1px solid var(--color-border)' }}>
                     <td style={{ padding: '0.5rem' }}>{new Date(log.date).toLocaleString()}</td>
                     <td style={{ padding: '0.5rem' }}>
                        <span style={{ 
                          padding: '0.1rem 0.3rem', borderRadius: '4px',
                          backgroundColor: log.category === 'supply' ? '#dbeafe' : '#f3f4f6',
                          color: log.category === 'supply' ? '#1e40af' : '#374151'
                        }}>
                          {log.category === 'supply' ? 'Insumo' : 'Producto'}
                        </span>
                     </td>
                     <td style={{ padding: '0.5rem' }}>{log.machineName}</td>
                     <td style={{ padding: '0.5rem' }}>{log.itemName}</td>
                     <td style={{ padding: '0.5rem', fontWeight: 600 }}>{log.quantity}</td>
                   </tr>
                 ))}
                 {inventory.filter(log => log.type === 'restock').length === 0 && (
                   <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>Sin datos brutos</td></tr>
                 )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Ventas por Plaza</h3>
          <BarChart data={stats.salesByPlaza} />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Histórico Ventas</h3>
          <BarChart data={stats.salesByDate} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Log de Transacciones</h3>
        {sales.length === 0 ? (
          <div className="text-muted">No hay registros de ventas.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '0.75rem' }}>Fecha</th>
                  <th style={{ padding: '0.75rem' }}>Total</th>
                  <th style={{ padding: '0.75rem' }}>Ítems</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 10).map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem' }}>{new Date(s.date).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>${s.total.toFixed(2)}</td>
                    <td style={{ padding: '0.75rem' }}>{s.items.length} productos</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
