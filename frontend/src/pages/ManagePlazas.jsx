import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { loadDataFromAPI, postDataToAPI, deleteDataFromAPI } from '../services/api';
import { ENDPOINTS } from '../utils/endpoints';

export default function ManagePlazas() {
  const [plazas, setPlazas] = useState([]);
  const [newPlazaName, setNewPlazaName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await loadDataFromAPI(ENDPOINTS.locations, setPlazas);
      } catch (error) {
        showMessage('error', 'Error al cargar plazas');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPlazaName.trim()) {
      showMessage('error', 'Por favor ingresa un nombre para la plaza');
      return;
    }

    try {
      await postDataToAPI(ENDPOINTS.locations, {
        name: newPlazaName,
        address: ''
      }, () => {
        setNewPlazaName('');
        loadDataFromAPI(ENDPOINTS.locations, setPlazas);
        showMessage('success', 'Plaza agregada correctamente');
      });
    } catch (error) {
      console.error('Error de conexión:', error);
      showMessage('error', 'Error de conexión con el servidor');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta plaza?')) {
      try {
        await deleteDataFromAPI(ENDPOINTS.locations, id);
        await loadDataFromAPI(ENDPOINTS.locations, setPlazas);
        showMessage('success', 'Plaza eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar:', error);
        showMessage('error', 'Error de conexión al eliminar la plaza');
      }
    }
  };

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl text-primary">Gestionar Plazas</h1>
        <p className="text-muted">Añadir o eliminar ubicaciones para tus equipos</p>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg mb-4 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      {loading && (
        <div className="p-4 mb-4 text-center text-muted">
          Cargando plazas...
        </div>
      )}

      <div className="card">
        <form 
          onSubmit={handleSubmit} 
          className="flex gap-4 mb-8"
        >
          <div className="relative flex-1">
            <MapPin size={18} className="absolute left-3 top-3 text-muted" />
            <input 
              className="input pl-10" 
              placeholder="Nombre de la nueva plaza"
              value={newPlazaName}
              onChange={(e) => setNewPlazaName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> Agregar
          </button>
        </form>

        <div className="flex flex-col gap-4">
          {plazas.map(plaza => (
            <div key={plaza.id} className="flex justify-between items-center p-4 rounded-md border border-border bg-bg">
              <span className="font-medium">{plaza.name}</span>
              <button 
                className="btn btn-ghost text-error" 
                onClick={() => handleDelete(plaza.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {plazas.length === 0 && <div className="text-muted text-center">No hay plazas registradas</div>}
        </div>
      </div>
    </div>
  );
}
