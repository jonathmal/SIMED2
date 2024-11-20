// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const Usuario = require('../models/Usuario');

// Remove these lines as they create circular references
// const auth = protegerRuta;
// const checkRole = restringirA;

const protegerRuta = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new ErrorResponse('No autorizado - No hay token', 401));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.usuario = await Usuario.findById(decoded.id).select('-password');
            
            if (!req.usuario || !req.usuario.activo) {
                return next(new ErrorResponse('No autorizado - Usuario inválido o inactivo', 401));
            }
            
            next();
        } catch (err) {
            return next(new ErrorResponse('No autorizado - Token inválido', 401));
        }
    } catch (err) {
        return next(new ErrorResponse('Error al autenticar usuario', 500));
    }
};

const restringirA = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.usuario.rol)) {
            return next(new ErrorResponse('No tiene permisos para realizar esta acción', 403));
        }
        next();
    };
};

module.exports = {
    protegerRuta,
    restringirA
};