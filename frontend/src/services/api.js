export const loadPlazasFromAPI = async (endpoint, setPlazas) => {
    try {
      const response = await fetch(`http://localhost:8000/api/${endpoint}/`);
      const data = await response.json();
      setPlazas(data);
    } catch (error) {
      console.error('Error al cargar las plazas:', error);
    }
};