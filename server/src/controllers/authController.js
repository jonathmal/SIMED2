const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

const authController = {
  // Login user
  login: async (req, res) => {
    try {
      console.log('Login attempt received:', { email: req.body.email }); // Log login attempt
      
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        console.log('Missing credentials:', { email: !!email, password: !!password });
        return res.status(400).json({
          exito: false,
          message: 'Email y contraseña son requeridos'
        });
      }
  
      // Find user and include password field
      const user = await Usuario.findOne({ email: email.toLowerCase().trim() })
        .select('+password')
        .populate('servicio');
      
      console.log('User found:', { found: !!user, email }); // Log if user was found
  
      // Check if user exists
      if (!user) {
        return res.status(401).json({
          exito: false,
          message: 'Credenciales inválidas'
        });
      }
  
      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      console.log('Password validation:', { isValid: isPasswordValid, email }); // Log password validation result
      
      if (!isPasswordValid) {
        return res.status(401).json({
          exito: false,
          message: 'Credenciales inválidas'
        });
      }
  
      // Generate token
      const token = jwt.sign(
        { 
          id: user._id,
          rol: user.rol,
          servicio: user.servicio?._id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      // Create user data object without sensitive information
      const userData = {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        servicio: user.servicio,
        especialidad: user.especialidad
      };
  
      console.log('Login successful:', { email: userData.email, rol: userData.rol }); // Log successful login
  
      // Send successful response
      return res.json({
        exito: true,
        message: 'Login exitoso',
        token,
        usuario: userData
      });
  
    } catch (error) {
      // Detailed error logging
      console.error('Login error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Send a properly formatted error response
      return res.status(500).json({
        exito: false,
        message: 'Error en el servidor al procesar el login',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
};

module.exports = authController;