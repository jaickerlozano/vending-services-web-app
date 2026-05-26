export const loadDataFromAPI = async (endpoint, setData) => {
    try {
      const response = await fetch(`http://localhost:8000/api/${endpoint}/`);
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error al cargar las plazas:', error);
    }
};