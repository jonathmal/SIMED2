// src/controllers/interconsultaController.js
const Interconsulta = require('../models/Interconsulta');

const interconsultaController = {
    // Filtrar interconsultas with enhanced filtering
    filtrarInterconsultas: async (req, res) => {
        try {
            const { 
                estado, 
                prioridad, 
                servicio, 
                tipoFiltro, 
                servicioSolicitante, 
                servicioDestino,
                fechaInicio,
                fechaFin 
            } = req.query;
            
            const filtro = {};

            // Filtros básicos
            if (estado) filtro.estado = estado;
            if (prioridad) filtro.prioridad = prioridad;

            // Filtro por fecha
            if (fechaInicio || fechaFin) {
                filtro.fechaCreacion = {};
                if (fechaInicio) filtro.fechaCreacion.$gte = new Date(fechaInicio);
                if (fechaFin) filtro.fechaCreacion.$lte = new Date(fechaFin);
            }

            // Aplicar restricciones basadas en el rol del usuario
            if (req.usuario.rol !== 'ADMIN') {
                // Para usuarios no admin, solo pueden ver interconsultas de su servicio
                if (tipoFiltro === 'enviadas') {
                    filtro.servicioSolicitante = req.usuario.servicio;
                } else if (tipoFiltro === 'recibidas') {
                    filtro.servicioDestino = req.usuario.servicio;
                } else {
                    // Si no se especifica tipo, mostrar ambas
                    filtro.$or = [
                        { servicioSolicitante: req.usuario.servicio },
                        { servicioDestino: req.usuario.servicio }
                    ];
                }
            } else {
                // Para admin, aplicar filtros si se especifican
                if (tipoFiltro === 'enviadas' && servicioSolicitante) {
                    filtro.servicioSolicitante = servicioSolicitante;
                } else if (tipoFiltro === 'recibidas' && servicioDestino) {
                    filtro.servicioDestino = servicioDestino;
                } else if (servicio) {
                    filtro.$or = [
                        { servicioSolicitante: servicio },
                        { servicioDestino: servicio }
                    ];
                }
            }

            console.log('Filtros aplicados:', filtro);

            let interconsultas;
            if (req.query.urgentes === 'true') {
                interconsultas = await Interconsulta.urgentes();
            } else {
                interconsultas = await Interconsulta.find(filtro)
                    .populate('servicioSolicitante', 'nombre')
                    .populate('servicioDestino', 'nombre')
                    .sort({ fechaCreacion: -1 });
            }

            const interconsultasConVirtuales = interconsultas.map(ic => ({
                ...ic.toObject(),
                tiempoTranscurrido: ic.tiempoTranscurrido,
                tiempoUltimaActualizacion: ic.tiempoUltimaActualizacion,
                diasEnEstado: ic.diasEnEstado,
                notificacionesPendientes: ic.notificacionesPendientes
            }));

            res.json({
                exito: true,
                total: interconsultas.length,
                data: interconsultasConVirtuales
            });
        } catch (error) {
            console.error('Error en filtrado:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al filtrar interconsultas',
                detalles: error.message
            });
        }
    },

    // Crear nueva interconsulta with validation
    crearInterconsulta: async (req, res) => {
        try {
            // Verificar que el usuario tiene permiso para crear con el servicio solicitante
            if (req.usuario.rol !== 'ADMIN' && req.body.servicioSolicitante !== req.usuario.servicio) {
                return res.status(403).json({
                    exito: false,
                    error: 'No tiene permiso para crear interconsultas para otro servicio'
                });
            }

            const interconsulta = new Interconsulta(req.body);

            // Validate services are different
            if (!interconsulta.puedeSerModificada()) {
                return res.status(400).json({
                    exito: false,
                    error: 'Los servicios solicitante y destino no pueden ser iguales'
                });
            }

            await interconsulta.save();
            
            const interconsultaCompleta = await Interconsulta.findById(interconsulta._id)
                .populate('servicioSolicitante', 'nombre')
                .populate('servicioDestino', 'nombre');

            const response = {
                ...interconsultaCompleta.toObject(),
                tiempoTranscurrido: interconsultaCompleta.tiempoTranscurrido,
                diasEnEstado: interconsultaCompleta.diasEnEstado,
                notificacionesPendientes: interconsultaCompleta.notificacionesPendientes
            };

            res.status(201).json({
                exito: true,
                mensaje: 'Interconsulta creada exitosamente',
                data: response
            });
        } catch (error) {
            console.error('Error al crear interconsulta:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al crear la interconsulta',
                detalles: error.message
            });
        }
    },

    // Get interconsultas recibidas
    getInterconsultasRecibidas: async (req, res) => {
        try {
            console.log('User data:', {
                rol: req.usuario.rol,
                servicio: req.usuario.servicio,
                requestedService: req.params.servicioId
            });

            // Determine which service ID to use
            let servicioId;
            if (req.usuario.rol === 'ADMIN') {
                servicioId = req.params.servicioId;
            } else {
                servicioId = req.usuario.servicio;
                
                // Fix: Compare as strings
                if (req.params.servicioId.toString() !== req.usuario.servicio.toString()) {
                    return res.status(403).json({
                        exito: false,
                        error: 'No tiene permiso para ver interconsultas de otros servicios'
                    });
                }
            }

            if (!servicioId) {
                return res.status(400).json({
                    exito: false,
                    error: 'ID de servicio no válido'
                });
            }

            const interconsultas = req.query.pendientes === 'true' 
                ? await Interconsulta.pendientesPorServicio(servicioId)
                : await Interconsulta.find({
                    servicioDestino: servicioId
                })
                .populate('servicioSolicitante', 'nombre')
                .populate('servicioDestino', 'nombre')
                .sort({ fechaCreacion: -1 });

            const interconsultasConVirtuales = interconsultas.map(ic => ({
                ...ic.toObject(),
                tiempoTranscurrido: ic.tiempoTranscurrido,
                diasEnEstado: ic.diasEnEstado,
                notificacionesPendientes: ic.notificacionesPendientes
            }));

            res.json({
                exito: true,
                total: interconsultas.length,
                data: interconsultasConVirtuales
            });
        } catch (error) {
            console.error('Error getting received interconsultas:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al obtener las interconsultas recibidas',
                detalles: error.message
            });
        }
    },

    // Get interconsultas enviadas
    getInterconsultasEnviadas: async (req, res) => {
        try {
            console.log('User data:', {
                rol: req.usuario.rol,
                servicio: req.usuario.servicio,
                requestedService: req.params.servicioId
            });

            let servicioId;
            if (req.usuario.rol === 'ADMIN') {
                servicioId = req.params.servicioId;
            } else {
                servicioId = req.usuario.servicio;
                
                if (req.params.servicioId !== req.usuario.servicio) {
                    return res.status(403).json({
                        exito: false,
                        error: 'No tiene permiso para ver interconsultas de otros servicios'
                    });
                }
            }

            if (!servicioId) {
                return res.status(400).json({
                    exito: false,
                    error: 'ID de servicio no válido'
                });
            }

            const interconsultas = await Interconsulta.find({
                servicioSolicitante: servicioId
            })
            .populate('servicioSolicitante', 'nombre')
            .populate('servicioDestino', 'nombre')
            .sort({ fechaCreacion: -1 });

            const interconsultasConVirtuales = interconsultas.map(ic => ({
                ...ic.toObject(),
                tiempoTranscurrido: ic.tiempoTranscurrido,
                diasEnEstado: ic.diasEnEstado,
                notificacionesPendientes: ic.notificacionesPendientes
            }));

            res.json({
                exito: true,
                total: interconsultas.length,
                data: interconsultasConVirtuales
            });
        } catch (error) {
            console.error('Error getting sent interconsultas:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al obtener las interconsultas enviadas',
                detalles: error.message
            });
        }
    },

    // Get all interconsultas (admin)
    getAllInterconsultas: async (req, res) => {
        try {
            if (req.usuario.rol !== 'ADMIN') {
                return res.status(403).json({
                    exito: false,
                    error: 'Solo los administradores pueden ver todas las interconsultas'
                });
            }

            const { servicio } = req.query;
            let filtro = {};
            
            if (servicio) {
                filtro.$or = [
                    { servicioSolicitante: servicio },
                    { servicioDestino: servicio }
                ];
            }

            const interconsultas = await Interconsulta.find(filtro)
                .populate('servicioSolicitante', 'nombre')
                .populate('servicioDestino', 'nombre')
                .sort({ fechaCreacion: -1 });

            const interconsultasConVirtuales = interconsultas.map(ic => ({
                ...ic.toObject(),
                tiempoTranscurrido: ic.tiempoTranscurrido,
                diasEnEstado: ic.diasEnEstado,
                notificacionesPendientes: ic.notificacionesPendientes
            }));

            res.json({
                exito: true,
                total: interconsultas.length,
                data: interconsultasConVirtuales
            });
        } catch (error) {
            console.error('Error getting all interconsultas:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al obtener las interconsultas',
                detalles: error.message
            });
        }
    },

    // Get by ID
    getById: async (req, res) => {
        try {
            const interconsulta = await Interconsulta.findById(req.params.id)
                .populate('servicioSolicitante', 'nombre')
                .populate('servicioDestino', 'nombre')
                .populate('notas.servicio', 'nombre');

            if (req.usuario.rol !== 'ADMIN' && 
                req.usuario.servicio.toString() !== interconsulta.servicioSolicitante._id.toString() &&
                req.usuario.servicio.toString() !== interconsulta.servicioDestino._id.toString()) {
                return res.status(403).json({
                    exito: false,
                    error: 'No tiene permiso para ver esta interconsulta'
                });
            }

            // Verificar permisos
            if (req.usuario.rol !== 'ADMIN' && 
                req.usuario.servicio !== interconsulta.servicioSolicitante.toString() &&
                req.usuario.servicio !== interconsulta.servicioDestino.toString()) {
                return res.status(403).json({
                    exito: false,
                    error: 'No tiene permiso para ver esta interconsulta'
                });
            }

            res.json({
                exito: true,
                data: {
                    ...interconsulta.toObject(),
                    tiempoTranscurrido: interconsulta.tiempoTranscurrido,
                    diasEnEstado: interconsulta.diasEnEstado,
                    notificacionesPendientes: interconsulta.notificacionesPendientes
                }
            });
        } catch (error) {
            console.error('Error getting interconsulta by ID:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al obtener la interconsulta',
                detalles: error.message
            });
        }
    },

    // Update status
    actualizarEstado: async (req, res) => {
        try {
            const { estado } = req.body;
            const interconsulta = await Interconsulta.findById(req.params.id);

            if (!interconsulta) {
                return res.status(404).json({
                    exito: false,
                    error: 'Interconsulta no encontrada'
                });
            }

            // Verificar permisos
            if (req.usuario.rol !== 'ADMIN' && 
                req.usuario.servicio !== interconsulta.servicioSolicitante.toString() &&
                req.usuario.servicio !== interconsulta.servicioDestino.toString()) {
                return res.status(403).json({
                    exito: false,
                    error: 'No tiene permiso para modificar esta interconsulta'
                });
            }

            if (!interconsulta.puedeSerModificada()) {
                return res.status(400).json({
                    exito: false,
                    error: 'La interconsulta no puede ser modificada en su estado actual'
                });
            }

            interconsulta.estado = estado;
            await interconsulta.save();

            const interconsultaActualizada = await Interconsulta.findById(interconsulta._id)
                .populate('servicioSolicitante', 'nombre')
                .populate('servicioDestino', 'nombre');

            res.json({
                exito: true,
                mensaje: 'Estado actualizado exitosamente',
                data: {
                    ...interconsultaActualizada.toObject(),
                    tiempoTranscurrido: interconsultaActualizada.tiempoTranscurrido,
                    diasEnEstado: interconsultaActualizada.diasEnEstado
                }
            });
        } catch (error) {
            console.error('Error updating status:', error);
            res.status(500).json({
                exito: false,
                error: 'Error al actualizar el estado',
                detalles: error.message
            });}
        },
    
        // Add note
        agregarNota: async (req, res) => {
            try {
                const { contenido, servicio, autor } = req.body;
                const interconsulta = await Interconsulta.findById(req.params.id);
    
                if (!interconsulta) {
                    return res.status(404).json({
                        exito: false,
                        error: 'Interconsulta no encontrada'
                    });
                }
    
                // Verificar permisos
                if (req.usuario.rol !== 'ADMIN' && 
                    req.usuario.servicio !== interconsulta.servicioSolicitante.toString() &&
                    req.usuario.servicio !== interconsulta.servicioDestino.toString()) {
                    return res.status(403).json({
                        exito: false,
                        error: 'No tiene permiso para agregar notas a esta interconsulta'
                    });
                }
    
                if (!interconsulta.puedeSerModificada()) {
                    return res.status(400).json({
                        exito: false,
                        error: 'No se pueden agregar notas a una interconsulta completada o cancelada'
                    });
                }
                
                interconsulta.notas.push({ contenido, servicio, autor });
                interconsulta.notificaciones.push({
                    mensaje: `Nueva nota agregada por ${autor}`,
                    fecha: new Date()
                });
                await interconsulta.save();
    
                const interconsultaActualizada = await Interconsulta.findById(req.params.id)
                    .populate('servicioSolicitante', 'nombre')
                    .populate('servicioDestino', 'nombre')
                    .populate('notas.servicio', 'nombre');
    
                res.json({
                    exito: true,
                    mensaje: 'Nota agregada exitosamente',
                    data: {
                        ...interconsultaActualizada.toObject(),
                        tiempoTranscurrido: interconsultaActualizada.tiempoTranscurrido,
                        diasEnEstado: interconsultaActualizada.diasEnEstado,
                        notificacionesPendientes: interconsultaActualizada.notificacionesPendientes
                    }
                });
            } catch (error) {
                console.error('Error adding note:', error);
                res.status(500).json({
                    exito: false,
                    error: 'Error al agregar la nota',
                    detalles: error.message
                });
            }
        },
    
        // Search by history number
        buscarPorHistoria: async (req, res) => {
            try {
                let filtro = {
                    'paciente.numeroHistoria': req.params.numeroHistoria
                };
    
                // Para usuarios no admin, agregar restricción por servicio
                if (req.usuario.rol !== 'ADMIN') {
                    filtro.$or = [
                        { servicioSolicitante: req.usuario.servicio },
                        { servicioDestino: req.usuario.servicio }
                    ];
                }
    
                const interconsultas = await Interconsulta.find(filtro)
                    .populate('servicioSolicitante', 'nombre')
                    .populate('servicioDestino', 'nombre')
                    .sort({ fechaCreacion: -1 });
    
                const interconsultasConVirtuales = interconsultas.map(ic => ({
                    ...ic.toObject(),
                    tiempoTranscurrido: ic.tiempoTranscurrido,
                    diasEnEstado: ic.diasEnEstado,
                    notificacionesPendientes: ic.notificacionesPendientes
                }));
    
                res.json({
                    exito: true,
                    total: interconsultas.length,
                    data: interconsultasConVirtuales
                });
            } catch (error) {
                console.error('Error searching by history:', error);
                res.status(500).json({
                    exito: false,
                    error: 'Error al buscar interconsultas',
                    detalles: error.message
                });
            }
        },
    
        // Mark notifications as read
        marcarNotificacionesLeidas: async (req, res) => {
            try {
                const interconsulta = await Interconsulta.findById(req.params.id);
                
                if (!interconsulta) {
                    return res.status(404).json({
                        exito: false,
                        error: 'Interconsulta no encontrada'
                    });
                }
    
                // Verificar permisos
                if (req.usuario.rol !== 'ADMIN' && 
                    req.usuario.servicio !== interconsulta.servicioSolicitante.toString() &&
                    req.usuario.servicio !== interconsulta.servicioDestino.toString()) {
                    return res.status(403).json({
                        exito: false,
                        error: 'No tiene permiso para marcar notificaciones en esta interconsulta'
                    });
                }
    
                interconsulta.notificaciones.forEach(notif => {
                    notif.leida = true;
                });
                
                await interconsulta.save();
    
                res.json({
                    exito: true,
                    mensaje: 'Notificaciones marcadas como leídas',
                    data: {
                        ...interconsulta.toObject(),
                        notificacionesPendientes: 0
                    }
                });
            } catch (error) {
                console.error('Error marking notifications as read:', error);
                res.status(500).json({
                    exito: false,
                    error: 'Error al marcar notificaciones',
                    detalles: error.message
                });
            }
        }
    };
    
    module.exports = interconsultaController;