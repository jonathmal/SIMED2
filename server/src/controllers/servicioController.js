// src/controllers/serviceController.js
const Service = require('../models/Service');
const Usuario = require('../models/Usuario');
const Interconsulta = require('../models/Interconsulta');

const serviceController = {
    // Get all services
    getServices: async (req, res) => {
        try {
            const { activo } = req.query;
            const filtro = {};
            
            if (activo !== undefined) {
                filtro.activo = activo === 'true';
            }

            const servicios = await Service.find(filtro).sort('nombre');

            res.json({
                exito: true,
                data: servicios
            });
        } catch (error) {
            console.error('Error al obtener servicios:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al obtener servicios',
                detalles: error.message
            });
        }
    },

    // Get service by ID
    getServiceById: async (req, res) => {
        try {
            const servicio = await Service.findById(req.params.id);

            if (!servicio) {
                return res.status(404).json({
                    exito: false,
                    error: 'Servicio no encontrado'
                });
            }

            res.json({
                exito: true,
                data: servicio
            });
        } catch (error) {
            console.error('Error al obtener servicio:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al obtener servicio',
                detalles: error.message
            });
        }
    },

    // Create new service
    createService: async (req, res) => {
        try {
            const servicio = await Service.create(req.body);

            res.status(201).json({
                exito: true,
                mensaje: 'Servicio creado exitosamente',
                data: servicio
            });
        } catch (error) {
            console.error('Error al crear servicio:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al crear servicio',
                detalles: error.message
            });
        }
    },

    // Update service
    updateService: async (req, res) => {
        try {
            const servicio = await Service.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!servicio) {
                return res.status(404).json({
                    exito: false,
                    error: 'Servicio no encontrado'
                });
            }

            res.json({
                exito: true,
                mensaje: 'Servicio actualizado exitosamente',
                data: servicio
            });
        } catch (error) {
            console.error('Error al actualizar servicio:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al actualizar servicio',
                detalles: error.message
            });
        }
    },

    // Toggle service status
    toggleServiceStatus: async (req, res) => {
        try {
            const servicio = await Service.findById(req.params.id);

            if (!servicio) {
                return res.status(404).json({
                    exito: false,
                    error: 'Servicio no encontrado'
                });
            }

            servicio.activo = !servicio.activo;
            await servicio.save();

            res.json({
                exito: true,
                mensaje: `Servicio ${servicio.activo ? 'activado' : 'desactivado'} exitosamente`,
                data: servicio
            });
        } catch (error) {
            console.error('Error al cambiar estado del servicio:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al cambiar estado del servicio',
                detalles: error.message
            });
        }
    },

    // Get users in a service
    getServiceUsers: async (req, res) => {
        try {
            const usuarios = await Usuario.find({
                servicio: req.params.id,
                activo: true
            })
            .select('-password')
            .sort('nombre');

            res.json({
                exito: true,
                total: usuarios.length,
                data: usuarios
            });
        } catch (error) {
            console.error('Error al obtener usuarios del servicio:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al obtener usuarios del servicio',
                detalles: error.message
            });
        }
    },

    // Get service statistics
    getServiceStats: async (req, res) => {
        try {
            const servicioId = req.params.id;

            const [enviadas, recibidas, usuarios] = await Promise.all([
                Interconsulta.countDocuments({ servicioSolicitante: servicioId }),
                Interconsulta.countDocuments({ servicioDestino: servicioId }),
                Usuario.countDocuments({ servicio: servicioId, activo: true })
            ]);

            const pendientes = await Interconsulta.countDocuments({
                servicioDestino: servicioId,
                estado: 'PENDIENTE'
            });

            const urgentes = await Interconsulta.countDocuments({
                servicioDestino: servicioId,
                estado: { $in: ['PENDIENTE', 'EN_PROCESO'] },
                prioridad: { $in: ['ALTA', 'URGENTE'] }
            });

            res.json({
                exito: true,
                data: {
                    interconsultas: {
                        enviadas,
                        recibidas,
                        pendientes,
                        urgentes
                    },
                    usuarios
                }
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al obtener estadísticas del servicio',
                detalles: error.message
            });
        }
    }
};

module.exports = serviceController;