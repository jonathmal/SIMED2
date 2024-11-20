const express = require('express');
const router = express.Router();
const Interconsulta = require('../models/Interconsulta');
const { protegerRuta, restringirA } = require('../middleware/auth');

// Proteger todas las rutas
router.use(protegerRuta);

// Filtrar interconsultas
router.get('/filtrar', restringirA('MEDICO', 'JEFE_SERVICIO', 'ADMIN'), async (req, res) => {
    try {
        const { estado, prioridad, servicio, tipoFiltro, servicioSolicitante, servicioDestino } = req.query;
        
        console.log('Query params received:', {
            tipoFiltro,
            servicioSolicitante,
            servicioDestino,
            estado,
            prioridad,
            servicio
        });

        const filtro = {};

        // Aplicar filtros básicos
        if (estado) filtro.estado = estado;
        if (prioridad) filtro.prioridad = prioridad;

        // Aplicar filtro según el tipo
        if (tipoFiltro === 'enviadas' && servicioSolicitante) {
            filtro.servicioSolicitante = servicioSolicitante;
        } else if (tipoFiltro === 'recibidas' && servicioDestino) {
            filtro.servicioDestino = servicioDestino;
        }

        // Si es un filtro de servicio general (para ADMIN)
        if (servicio) {
            filtro.$or = [
                { servicioSolicitante: servicio },
                { servicioDestino: servicio }
            ];
        }

        console.log('Filtro construido:', filtro);

        const interconsultas = await Interconsulta.find(filtro)
            .populate('servicioSolicitante', 'nombre')
            .populate('servicioDestino', 'nombre')
            .sort({ fechaCreacion: -1 });

        console.log(`Encontradas ${interconsultas.length} interconsultas`);

        res.json({
            exito: true,
            data: interconsultas
        });
    } catch (error) {
        console.error('Error en filtrado:', error);
        res.status(500).json({
            exito: false,
            error: 'Error al filtrar interconsultas',
            detalles: error.message
        });
    }
});

// Crear nueva interconsulta
router.post('/crear', restringirA('MEDICO', 'JEFE_SERVICIO', 'ADMIN'), async (req, res) => {
    try {
        const interconsulta = new Interconsulta(req.body);
        await interconsulta.save();
        
        const interconsultaCompleta = await Interconsulta.findById(interconsulta._id)
            .populate('servicioSolicitante', 'nombre')
            .populate('servicioDestino', 'nombre');

        res.status(201).json({
            exito: true,
            mensaje: 'Interconsulta creada exitosamente',
            data: interconsultaCompleta
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            error: 'Error al crear la interconsulta',
            detalles: error.message
        });
    }
});

// Obtener interconsultas recibidas por un servicio
router.get('/recibidas/:servicioId', restringirA('MEDICO', 'JEFE_SERVICIO', 'ADMIN'), async (req, res) => {
    try {
        const interconsultas = await Interconsulta.find({
            servicioDestino: req.params.servicioId
        })
        .populate('servicioSolicitante', 'nombre')
        .populate('servicioDestino', 'nombre')
        .sort({ fechaCreacion: -1 });

        res.json({
            exito: true,
            data: interconsultas
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            error: 'Error al obtener las interconsultas recibidas',
            detalles: error.message
        });
    }
});

// Obtener todas las interconsultas (solo ADMIN)
router.get('/admin/todas', restringirA('ADMIN'), async (req, res) => {
    try {
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

        res.json({
            exito: true,
            data: interconsultas
        });
    } catch (error) {
        console.error('Error fetching admin interconsultas:', error);
        res.status(500).json({
            exito: false,
            error: 'Error al obtener las interconsultas',
            detalles: error.message
        });
    }
});

// Obtener interconsultas enviadas por un servicio
router.get('/enviadas/:servicioId', restringirA('MEDICO', 'JEFE_SERVICIO', 'ADMIN'), async (req, res) => {
    try {
        const interconsultas = await Interconsulta.find({
            servicioSolicitante: req.params.servicioId
        })
        .populate('servicioSolicitante', 'nombre')
        .populate('servicioDestino', 'nombre')
        .sort({ fechaCreacion: -1 });

        res.json({
            exito: true,
            data: interconsultas
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            error: 'Error al obtener las interconsultas enviadas',
            detalles: error.message
        });
    }
});

// Actualizar estado de una interconsulta
router.put('/:id/estado', restringirA('MEDICO', 'JEFE_SERVICIO', 'ADMIN'), async (req, res) => {
    try {
        const { estado } = req.body;
        if (!['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'].includes(estado)) {
            return res.status(400).json({
                exito: false,
                error: 'Estado no válido'
            });
        }

        const interconsulta = await Interconsulta.findByIdAndUpdate(
            req.params.id,
            { 
                estado,
                fechaActualizacion: Date.now()
            },
            { new: true }
        )
        .populate('servicioSolicitante', 'nombre')
        .populate('servicioDestino', 'nombre');

        if (!interconsulta) {
            return res.status(404).json({
                exito: false,
                error: 'Interconsulta no encontrada'
            });
        }

        res.json({
            exito: true,
            mensaje: 'Estado actualizado exitosamente',
            data: interconsulta
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            error: 'Error al actualizar el estado',
            detalles: error.message
        });
    }
});

// Obtener detalles de una interconsulta específica
router.get('/:id', restringirA('MEDICO', 'JEFE_SERVICIO', 'ADMIN'), async (req, res) => {
    try {
        const interconsulta = await Interconsulta.findById(req.params.id)
            .populate('servicioSolicitante', 'nombre')
            .populate('servicioDestino', 'nombre');

        if (!interconsulta) {
            return res.status(404).json({
                exito: false,
                error: 'Interconsulta no encontrada'
            });
        }

        res.json({
            exito: true,
            data: interconsulta
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            error: 'Error al obtener la interconsulta',
            detalles: error.message
        });
    }
});

// Agregar una nota/respuesta a una interconsulta
router.post('/:id/notas', restringirA('MEDICO', 'JEFE_SERVICIO', 'ADMIN'), async (req, res) => {
    try {
        const { contenido, servicio, autor } = req.body;
        
        const interconsulta = await Interconsulta.findByIdAndUpdate(
            req.params.id,
            { 
                $push: { 
                    notas: { contenido, servicio, autor },
                    notificaciones: {
                        mensaje: `Nueva nota agregada por ${autor}`,
                        fecha: new Date()
                    }
                },
                fechaActualizacion: Date.now()
            },
            { new: true }
        )
        .populate('servicioSolicitante', 'nombre')
        .populate('servicioDestino', 'nombre')
        .populate('notas.servicio', 'nombre');

        if (!interconsulta) {
            return res.status(404).json({
                exito: false,
                error: 'Interconsulta no encontrada'
            });
        }

        res.json({
            exito: true,
            mensaje: 'Nota agregada exitosamente',
            data: interconsulta
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            error: 'Error al agregar la nota',
            detalles: error.message
        });
    }
});

// Buscar interconsultas por número de historia
router.get('/buscar/historia/:numeroHistoria', restringirA('MEDICO', 'JEFE_SERVICIO', 'ADMIN'), async (req, res) => {
    try {
        const interconsultas = await Interconsulta.find({
            'paciente.numeroHistoria': req.params.numeroHistoria
        })
        .populate('servicioSolicitante', 'nombre')
        .populate('servicioDestino', 'nombre')
        .sort({ fechaCreacion: -1 });

        res.json({
            exito: true,
            data: interconsultas
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            error: 'Error al buscar interconsultas',
            detalles: error.message
        });
    }
});

// Marcar notificaciones como leídas
router.put('/:id/notificaciones/leer', restringirA('MEDICO', 'JEFE_SERVICIO', 'ADMIN'), async (req, res) => {
    try {
        const interconsulta = await Interconsulta.findByIdAndUpdate(
            req.params.id,
            {
                'notificaciones.$[].leida': true
            },
            { new: true }
        );

        if (!interconsulta) {
            return res.status(404).json({
                exito: false,
                error: 'Interconsulta no encontrada'
            });
        }

        res.json({
            exito: true,
            mensaje: 'Notificaciones marcadas como leídas',
            data: interconsulta
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            error: 'Error al marcar notificaciones',
            detalles: error.message
        });
    }
});

module.exports = router;