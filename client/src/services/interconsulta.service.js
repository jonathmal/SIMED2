import { apiService } from './api.service';

export const interconsultaService = {
  // Get all interconsultas (admin only)
  getAllAdmin: async () => {
    try {
      console.log('Attempting to fetch admin interconsultas');
      const response = await apiService.get('/server/interconsultas/admin/todas');
      console.log('Admin interconsultas response:', response);
      
      if (!response.exito) {
        throw new Error(response.error || 'Error al obtener las interconsultas');
      }
      
      return response;
    } catch (error) {
      console.error('Error in getAllAdmin:', error);
      throw error;
    }
  },

  // Get interconsultas for a specific service
  getAllByService: async (servicioId) => {
    try {
      console.log('Attempting to fetch service interconsultas for:', servicioId);
      const response = await apiService.get(`/server/interconsultas/recibidas/${servicioId}`);
      console.log('Service interconsultas response:', response);
      
      if (!response.exito) {
        throw new Error(response.error || 'Error al obtener las interconsultas');
      }
      
      return response;
    } catch (error) {
      console.error('Error in getAllByService:', error);
      throw error;
    }
  },

  // Get a single interconsulta by ID
  getById: async (id) => {
    try {
      const response = await apiService.get(`/server/interconsultas/${id}`);
      if (!response.exito) {
        throw new Error(response.error || 'Error al obtener la interconsulta');
      }
      return response;
    } catch (error) {
      console.error('Error fetching interconsulta:', error);
      throw error;
    }
  },

  // Get interconsultas received by a service
  getInterconsultasRecibidas: async (servicioId) => {
    try {
      const response = await apiService.get(`/server/interconsultas/recibidas/${servicioId}`);
      if (!response.exito) {
        throw new Error(response.error || 'Error al obtener las interconsultas recibidas');
      }
      return response;
    } catch (error) {
      console.error('Error fetching received interconsultas:', error);
      throw error;
    }
  },

  // Get interconsultas sent by a service
  getInterconsultasEnviadas: async (servicioId) => {
    try {
      const response = await apiService.get(`/server/interconsultas/enviadas/${servicioId}`);
      if (!response.exito) {
        throw new Error(response.error || 'Error al obtener las interconsultas enviadas');
      }
      return response;
    } catch (error) {
      console.error('Error fetching sent interconsultas:', error);
      throw error;
    }
  },

  // Search interconsultas by patient history number
  buscarPorHistoria: async (numeroHistoria) => {
    try {
      const response = await apiService.get(`/server/interconsultas/buscar/historia/${numeroHistoria}`);
      if (!response.exito) {
        throw new Error(response.error || 'Error al buscar interconsultas por historia');
      }
      return response;
    } catch (error) {
      console.error('Error searching interconsultas by history:', error);
      throw error;
    }
  },

  // Create a new interconsulta
  crearInterconsulta: async (data) => {
    try {
      console.log('Creating interconsulta with data:', data);
      const response = await apiService.post('/server/interconsultas/crear', data);
      if (!response.exito) {
        throw new Error(response.error || 'Error al crear la interconsulta');
      }
      return response;
    } catch (error) {
      console.error('Error creating interconsulta:', error);
      throw error;
    }
  },

  // Add a note to an interconsulta
  agregarNota: async (id, nota) => {
    try {
      const response = await apiService.post(`/server/interconsultas/${id}/notas`, { nota });
      if (!response.exito) {
        throw new Error(response.error || 'Error al agregar la nota');
      }
      return response;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },

  // Update interconsulta status
  actualizarEstado: async (id, estado) => {
    try {
      const response = await apiService.put(`/server/interconsultas/${id}/estado`, { estado });
      if (!response.exito) {
        throw new Error(response.error || 'Error al actualizar el estado');
      }
      return response;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  // Mark notifications as read
  marcarNotificacionesLeidas: async (id) => {
    try {
      const response = await apiService.put(`/server/interconsultas/${id}/notificaciones/leer`);
      if (!response.exito) {
        throw new Error(response.error || 'Error al marcar notificaciones como leídas');
      }
      return response;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  },

  // Filter interconsultas
  filtrarInterconsultas: async (filters) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await apiService.get(`/server/interconsultas/filtrar?${queryString}`);
      if (!response.exito) {
        throw new Error(response.error || 'Error al filtrar interconsultas');
      }
      return response;
    } catch (error) {
      console.error('Error filtering interconsultas:', error);
      throw error;
    }
  },
};