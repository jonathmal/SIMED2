// client/src/services/auth.service.js
import { apiService } from './api.service';

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'usuario',
  SERVICE: 'servicio'
};

export const authService = {
  login: async (credentials) => {
    try {
      const response = await apiService.post('/auth/login', {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password
      });
      
      if (response.exito && response.token && response.usuario) {
        await authService.setSession(response);
        return response;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  setSession: async (authData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, authData.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.usuario));
      
      if (authData.usuario.servicio) {
        localStorage.setItem(STORAGE_KEYS.SERVICE, JSON.stringify(authData.usuario.servicio));
      }
    } catch (error) {
      console.error('Error setting session:', error);
      throw new Error('Error al guardar la sesión');
    }
  },

  clearSession: () => {
    try {
      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },

  logout: async () => {
    try {
      // Optional: Call logout endpoint if you have one
      // await apiService.post('/auth/logout');
      authService.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear session even if logout request fails
      authService.clearSession();
    }
  },

  getCurrentUser: () => {
    try {
      const usuario = localStorage.getItem(STORAGE_KEYS.USER);
      return usuario ? JSON.parse(usuario) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  getServicio: () => {
    try {
      const servicio = localStorage.getItem(STORAGE_KEYS.SERVICE);
      return servicio ? JSON.parse(servicio) : null;
    } catch (error) {
      console.error('Error getting service:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const usuario = localStorage.getItem(STORAGE_KEYS.USER);
      return !!(token && usuario);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  hasRole: (requiredRole) => {
    try {
      const user = authService.getCurrentUser();
      return user && user.rol === requiredRole;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  },

  // New method to check multiple roles
  hasAnyRole: (requiredRoles) => {
    try {
      const user = authService.getCurrentUser();
      return user && requiredRoles.includes(user.rol);
    } catch (error) {
      console.error('Error checking roles:', error);
      return false;
    }
  },

  // New method to validate token expiration
  validateToken: () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) return false;
      
      // You could add JWT decode and expiration check here if needed
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
};