import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { loadDataFromAPI } from '../services/api';

export default function ManagePlazas() {
  const [plazas, setPlazas] = useState([]);
  const [newPlazaName, setNewPlazaName] = useState('');
  const locationEndpoint = 'locations';

  useEffect(() => {
    loadDataFromAPI(locationEndpoint, setPlazas);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPlazaName.trim()) {
      alert('Por favor ingresa un nombre para la plaza');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/locations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newPlazaName,
          address: ''
        })
      });

      if (response.ok) {
        setNewPlazaName('');
        await loadDataFromAPI(locationEndpoint, setPlazas);
        alert('Plaza agregada correctamente');
      } else {
        const errorData = await response.json();
        console.error('Error al agregar la plaza:', errorData);
        alert('Error al agregar la plaza: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta plaza?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/locations/${id}/`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadDataFromAPI(locationEndpoint, setPlazas);
          alert('Plaza eliminada correctamente');
        } else {
          const errorData = await response.json();
          alert('No se pudo eliminar: ' + JSON.stringify(errorData));
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error de conexión al eliminar la plaza');
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>Gestionar Plazas</h1>
        <p className="text-muted">Añadir o eliminar ubicaciones para tus equipos</p>
      </div>

      <div className="card">
        <form 
          onSubmit={handleSubmit} 
          style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}
          >
          <div style={{ position: 'relative', flex: 1 }}>
            <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
            <input 
              className="input" 
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Nombre de la nueva plaza"
              value={newPlazaName}
              onChange={(e) => setNewPlazaName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> Agregar
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {plazas.map(plaza => (
            <div key={plaza.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '1rem', 
              backgroundColor: 'var(--color-bg)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}>
              <span style={{ fontWeight: 500 }}>{plaza.name}</span>
              <button 
                className="btn btn-ghost" 
                style={{ color: 'var(--color-error)' }}
                onClick={() => handleDelete(plaza.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {plazas.length === 0 && <div className="text-muted" style={{ textAlign: 'center' }}>No hay plazas registradas</div>}
        </div>
      </div>
    </div>
  );
}
