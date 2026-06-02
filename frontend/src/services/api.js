// Función para poder reutilizar en todas las peticiones de obtención de datos
export const loadDataFromAPI = async (endpoint, setData) => {
    try {
      const response = await fetch(`http://localhost:8000/api/${endpoint}/`, {
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
      console.error('Error al cargar supplies:', error);
      // Aquí puedes ver exactamente qué está fallando
    }
};