// Centralized API base URL — override via VITE_API_URL env var for production.
// The 'http://localhost:8000' fallback is for local development only.
// In production, always set VITE_API_URL to the actual backend server.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Función para poder reutilizar en todas las peticiones de obtención de datos
export const loadDataFromAPI = async (endpoint, setData) => {
    try {
      const response = await fetch(`${API_BASE}/api/${endpoint}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Verificar si la respuesta es OK
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      throw error;
    }
};

export const postDataToAPI = async (endpoint, newData, setData) => {
  try {
    const response = await fetch(`${API_BASE}/api/${endpoint}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();
    setData(result);
  } catch (error) {
    console.error('Error al guardar:', error);
    throw error;
  }
};

export const deleteDataFromAPI = async (endpoint, id) => {
  try {
    const response = await fetch(`${API_BASE}/api/${endpoint}/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error al eliminar:', error);
    throw error;
  }
};

export const updateDataFromAPI = async (endpoint, id, data) => {
  try {
    const response = await fetch(`${API_BASE}/api/${endpoint}/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar:', error);
    throw error;
  }
};

export const loadOptionsFromAPI = async (setData) => {
  try {
    const response = await fetch(`${API_BASE}/api/products/options/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error('Error al cargar opciones:', error);
    throw error;
  }
};

export { API_BASE };
