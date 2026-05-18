import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Complaints() {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [description, setDescription] = useState('');
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    setMachines(db.getMachines());
    const allComplaints = db.getComplaints();
    const allMachines = db.getMachines();
    const allPlazas = db.getPlazas(); // Fetch plazas

    // Enrich with machine names and plaza names
    const enriched = allComplaints.map(c => {
      const machine = allMachines.find(m => m.id === c.machineId);
      const plaza = machine ? allPlazas.find(p => p.id === machine.plazaId) : null;
      
      return {
        ...c,
        machineName: machine?.name || 'Máquina Desconocida',
        plazaName: plaza?.name || 'Sin Plaza'
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setComplaints(enriched);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !selectedMachine) return;

    const newClaim = {
      machineId: parseInt(selectedMachine),
      description,
      status: 'pending' // pending, resolved
    };

    db.addComplaint(newClaim);
    
    // Refresh local
    const machine = machines.find(m => m.id === parseInt(selectedMachine));
    const plazas = db.getPlazas();
    const plaza = machine ? plazas.find(p => p.id === machine.plazaId) : null;

    const savedClaim = {
      ...newClaim,
      id: Date.now(), // approximation for UI update
      date: new Date().toISOString(),
      machineName: machine?.name,
      plazaName: plaza?.name
    };
    
    setComplaints([savedClaim, ...complaints]);
    setDescription('');
    setSelectedMachine('');
    alert('Reclamo registrado');
  };

  const toggleStatus = (id) => {
    // In a real app we'd call an update method in DB
    const currentDb = db.getDb();
    const idx = currentDb.complaints.findIndex(c => c.id === id);
    if (idx !== -1) {
      currentDb.complaints[idx].status = currentDb.complaints[idx].status === 'pending' ? 'resolved' : 'pending';
      db.saveDb(currentDb);
      
      setComplaints(prev => prev.map(c => 
        c.id === id ? { ...c, status: c.status === 'pending' ? 'resolved' : 'pending' } : c
      ));
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>Registro de Reclamos</h1>
        <p className="text-muted">Gestión de incidencias y reportes de clientes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* New Complaint Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1rem' }}>Nuevo Reclamo</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Máquina Afectada</label>
              <select 
                className="input" 
                value={selectedMachine} 
                onChange={(e) => setSelectedMachine(e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Descripción del Problema</label>
              <textarea 
                className="input" 
                rows="4"
                placeholder="Ej: Monedero trabado, producto no cae..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Registrar Incidencia
            </button>
          </form>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {complaints.length === 0 ? (
             <div className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>No hay reclamos registrados</div>
          ) : (
            complaints.map(complaint => (
              <div key={complaint.id} className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  marginTop: '0.25rem',
                  color: complaint.status === 'pending' ? 'var(--color-error)' : 'var(--color-success)' 
                }}>
                  {complaint.status === 'pending' ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>{complaint.plazaName} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>•</span> {complaint.machineName}</h4>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(complaint.date).toLocaleDateString()}</span>
                  </div>
                  
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
                    {complaint.description}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                      onClick={() => toggleStatus(complaint.id)}
                      className={`btn ${complaint.status === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.25rem 0.75rem', 
                        height: 'auto',
                        backgroundColor: complaint.status === 'resolved' ? '#dcfce7' : undefined,
                        color: complaint.status === 'resolved' ? '#166534' : undefined,
                        border: complaint.status === 'resolved' ? '1px solid #bbf7d0' : undefined
                      }}
                    >
                      {complaint.status === 'pending' ? 'Marcar como Resuelto' : 'Resuelto (Clic para reabrir)'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
