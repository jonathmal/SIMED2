const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Ruta para login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Intento de login:', email);

    const usuario = await Usuario.findOne({ email }).select('+password').populate('servicio');
    
    if (!usuario || !usuario.activo) {
      console.log('Usuario no encontrado o inactivo');
      return res.status(401).json({
        exito: false,
        error: 'Credenciales inválidas'
      });
    }

    const passwordValido = await usuario.comparePassword(password);
    if (!passwordValido) {
      console.log('Contraseña inválida');
      return res.status(401).json({
        exito: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log('Login exitoso para:', email);

    res.json({
      exito: true,
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        servicio: usuario.servicio,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al iniciar sesión',
      detalles: error.message
    });
  }
});

// Ruta para registro de usuarios
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, servicio, rol } = req.body;
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({
        exito: false,
        error: 'El usuario ya existe'
      });
    }

    // Crear nuevo usuario
    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      servicio,
      rol
    });

    res.status(201).json({
      exito: true,
      mensaje: 'Usuario creado exitosamente',
      data: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        servicio: usuario.servicio,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(400).json({
      exito: false,
      error: 'Error al crear usuario',
      detalles: error.message
    });
  }
});

// Ruta para desactivar usuario (soft delete)
router.patch('/users/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Verificar que el usuario que hace la petición sea ADMIN
    // if (req.usuario.rol !== 'ADMIN') {
    //   return res.status(403).json({
    //     exito: false,
    //     error: 'No tiene permisos para realizar esta acción'
    //   });
    // }

    const usuario = await Usuario.findByIdAndUpdate(id, 
      { activo: false },
      { new: true }
    );
    
    if (!usuario) {
      return res.status(404).json({
        exito: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Usuario desactivado exitosamente',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        servicio: usuario.servicio,
        rol: usuario.rol,
        activo: usuario.activo
      }
    });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al desactivar usuario',
      detalles: error.message
    });
  }
});
// Ruta para obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .populate('servicio')
      .select('-password'); // Excluimos el password
    
    res.json({
      exito: true,
      usuarios: usuarios.map(usuario => ({
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        servicio: usuario.servicio,
        rol: usuario.rol,
        activo: usuario.activo
      }))
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al obtener usuarios',
      detalles: error.message
    });
  }
});

// Ruta para actualizar usuario
router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, nombre, email, servicio } = req.body;
    
    const usuario = await Usuario.findByIdAndUpdate(
      id,
      {
        ...(rol && { rol }),
        ...(nombre && { nombre }),
        ...(email && { email }),
        ...(servicio && { servicio }),
        activo: true
      },
      { new: true }
    ).populate('servicio');
    
    if (!usuario) {
      return res.status(404).json({
        exito: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Usuario actualizado exitosamente',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        servicio: usuario.servicio,
        rol: usuario.rol,
        activo: usuario.activo
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al actualizar usuario',
      detalles: error.message
    });
  }
});

// Ruta para reactivar usuario
router.patch('/users/:id/reactivate', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Verificar que el usuario que hace la petición sea ADMIN
    // if (req.usuario.rol !== 'ADMIN') {
    //   return res.status(403).json({
    //     exito: false,
    //     error: 'No tiene permisos para realizar esta acción'
    //   });
    // }

    const usuario = await Usuario.findByIdAndUpdate(id, 
      { activo: true },
      { new: true }
    );
    
    if (!usuario) {
      return res.status(404).json({
        exito: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Usuario reactivado exitosamente',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        servicio: usuario.servicio,
        rol: usuario.rol,
        activo: usuario.activo
      }
    });
  } catch (error) {
    console.error('Error al reactivar usuario:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al reactivar usuario',
      detalles: error.message
    });
  }
});

module.exports = router;