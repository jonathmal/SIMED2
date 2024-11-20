// src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const servicio = require('../models/Servicio');

// Obtener todos los servicios
router.get('/', async (req, res) => {
    try {
        const servicios = await servicio.find().sort('nombre');
        res.json({
            exito: true,
            data: servicios
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            error: 'Error al obtener los servicios',
            detalles: error.message
        });
    }
});

// Obtener un servicio específico
router.get('/:id', async (req, res) => {
    try {
        const servicio = await servicio.findById(req.params.id);
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
        res.status(500).json({
            exito: false,
            error: 'Error al obtener el servicio',
            detalles: error.message
        });
    }
});

// Crear un nuevo servicio
router.post('/', async (req, res) => {
    try {
        const servicio = new servicio(req.body);
        await servicio.save();
        res.status(201).json({
            exito: true,
            mensaje: 'Servicio creado exitosamente',
            data: servicio
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            error: 'Error al crear el servicio',
            detalles: error.message
        });
    }
});

// Actualizar un servicio
router.put('/:id', async (req, res) => {
    try {
        const servicio = await servicio.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
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
        res.status(400).json({
            exito: false,
            error: 'Error al actualizar el servicio',
            detalles: error.message
        });
    }
});

// Eliminar un servicio
router.delete('/:id', async (req, res) => {
    try {
        const servicio = await servicio.findByIdAndDelete(req.params.id);
        
        if (!servicio) {
            return res.status(404).json({
                exito: false,
                error: 'Servicio no encontrado'
            });
        }

        res.json({
            exito: true,
            mensaje: 'Servicio eliminado exitosamente',
            data: servicio
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            error: 'Error al eliminar el servicio',
            detalles: error.message
        });
    }
});

// Buscar servicios por nombre
router.get('/buscar/:nombre', async (req, res) => {
    try {
        const servicios = await servicio.find({
            nombre: { $regex: req.params.nombre, $options: 'i' }
        }).sort('nombre');

        res.json({
            exito: true,
            data: servicios
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            error: 'Error al buscar servicios',
            detalles: error.message
        });
    }
});

module.exports = router;