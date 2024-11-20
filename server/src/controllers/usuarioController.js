// src/controllers/usuarioController.js
const Usuario = require('../models/Usuario');

const usuarioController = {
    // Get all users
    getUsers: async (req, res) => {
        try {
            const usuarios = await Usuario.find()
                .populate('servicio')
                .select('-password')
                .sort('nombre');
            
            res.json({
                exito: true,
                usuarios: usuarios.map(usuario => ({
                    id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    servicio: usuario.servicio,
                    rol: usuario.rol,
                    especialidad: usuario.especialidad,
                    activo: usuario.activo,
                    ultimoAcceso: usuario.ultimoAcceso
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
    },

    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const usuario = await Usuario.findById(req.params.id)
                .populate('servicio')
                .select('-password');

            if (!usuario) {
                return res.status(404).json({
                    exito: false,
                    error: 'Usuario no encontrado'
                });
            }

            res.json({
                exito: true,
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    servicio: usuario.servicio,
                    rol: usuario.rol,
                    activo: usuario.activo,
                    ultimoAcceso: usuario.ultimoAcceso
                }
            });
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al obtener usuario',
                detalles: error.message
            });
        }
    },

    getUsersByServicio: async (req, res) => {
        try {
            const usuarios = await Usuario.findByServicio(req.params.servicio)
                .populate('id')
                .select('-password')
                .sort('nombre')
            if (!usuarios) {
                return res.status(404).json({
                    exito: false,
                    error: 'Usuario no encontrado'
                });
            }
        
            res.json({
                exito: true,
                usuario: {
                    id: usuarios._id,
                    nombre: usuarios.nombre,
                    email: usuarios.email,
                    servicio: usuarios.servicio,
                    rol: usuarios.rol,
                    activo: usuarios.activo,
                    ultimoAcceso: usuarios.ultimoAcceso
                }
            });
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al obtener usuarios por servicio',
                detalles: error.message
            });
        }
    },

    // Update user
    updateUser: async (req, res) => {
        try {
            const { rol, nombre, email, servicio } = req.body;
            
            // Check if email exists if it's being updated
            if (email) {
                const emailExists = await Usuario.findOne({ 
                    email, 
                    _id: { $ne: req.params.id } 
                });
                
                if (emailExists) {
                    return res.status(400).json({
                        exito: false,
                        error: 'El email ya está en uso'
                    });
                }
            }
            
            const usuario = await Usuario.findByIdAndUpdate(
                req.params.id,
                {
                    ...(rol && { rol }),
                    ...(nombre && { nombre }),
                    ...(email && { email }),
                    ...(servicio && { servicio }),
                    ultimoAcceso: new Date()
                },
                { new: true, runValidators: true }
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
                    activo: usuario.activo,
                    ultimoAcceso: usuario.ultimoAcceso
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
    },

    // Toggle user active status
    toggleUserStatus: async (req, res) => {
        try {
            const usuario = await Usuario.findById(req.params.id);
            
            if (!usuario) {
                return res.status(404).json({
                    exito: false,
                    error: 'Usuario no encontrado'
                });
            }

            usuario.activo = !usuario.activo;
            await usuario.save();

            res.json({
                exito: true,
                mensaje: `Usuario ${usuario.activo ? 'activado' : 'desactivado'} exitosamente`,
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    servicio: usuario.servicio,
                    rol: usuario.rol,
                    activo: usuario.activo,
                    ultimoAcceso: usuario.ultimoAcceso
                }
            });
        } catch (error) {
            console.error('Error al cambiar estado del usuario:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al cambiar estado del usuario',
                detalles: error.message
            });
        }
    },
    deactivateUser: async (req, res) => {
        try {
            const usuario = await Usuario.findById(req.params.id);
            
            if (!usuario) {
                return res.status(404).json({
                    exito: false,
                    error: 'Usuario no encontrado'
                });
            }

            usuario.activo = false;
            await usuario.save();

            res.json({
                exito: true,
                mensaje: 'Usuario desactivado exitosamente',
                data: {
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
    },

    reactivateUser: async (req, res) => {
        try {
            const usuario = await Usuario.findById(req.params.id);
            
            if (!usuario) {
                return res.status(404).json({
                    exito: false,
                    error: 'Usuario no encontrado'
                });
            }

            usuario.activo = true;
            await usuario.save();

            res.json({
                exito: true,
                mensaje: 'Usuario reactivado exitosamente',
                data: {
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
    },

    deleteUser: async (req, res) => {
        try {
            const usuario = await Usuario.findById(req.params.id);
            
            if (!usuario) {
                return res.status(404).json({
                    exito: false,
                    error: 'Usuario no encontrado'
                });
            }
    
            await Usuario.findByIdAndDelete(req.params.id);
    
            res.json({
                exito: true,
                mensaje: 'Usuario eliminado exitosamente',
                data: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    servicio: usuario.servicio,
                    rol: usuario.rol
                }
            });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al eliminar usuario',
                detalles: error.message
            });
        }
    }

};

module.exports = usuarioController;