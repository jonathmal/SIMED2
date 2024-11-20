// src/middleware/validate.js
const { body, validationResult } = require('express-validator');

// Middleware to check for validation errors
const validarRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            exito: false,
            error: errors.array()[0].msg
        });
    }
    next();
};

// Validation rules for interconsulta creation/update
const validarInterconsulta = [
    body('paciente.nombre')
        .notEmpty()
        .withMessage('El nombre del paciente es requerido')
        .trim(),
    
    body('paciente.edad')
        .isInt({ min: 0, max: 150 })
        .withMessage('La edad debe ser un número válido entre 0 y 150'),
    
    body('paciente.numeroHistoria')
        .notEmpty()
        .withMessage('El número de historia es requerido')
        .trim(),
    
    body('servicioSolicitante')
        .isMongoId()
        .withMessage('Servicio solicitante inválido'),
    
    body('servicioDestino')
        .isMongoId()
        .withMessage('Servicio destino inválido')
        .custom((value, { req }) => {
            if (value === req.body.servicioSolicitante) {
                throw new Error('El servicio destino no puede ser igual al solicitante');
            }
            return true;
        }),
    
    body('objetivoConsulta')
        .notEmpty()
        .withMessage('El objetivo de la consulta es requerido')
        .trim(),
    
    body('historiaClinica')
        .notEmpty()
        .withMessage('La historia clínica es requerida')
        .trim(),
    
    validarRequest
];

// Validation rules for user creation/update
const validarUsuario = [
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .trim(),
    
    body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    
    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    
    body('servicio')
        .isMongoId()
        .withMessage('Servicio inválido'),
    
    body('rol')
        .isIn(['MEDICO', 'JEFE_SERVICIO', 'ADMIN'])
        .withMessage('Rol inválido'),
    
    validarRequest
];

// Validation rules for service creation/update
const validarServicio = [
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .trim(),
    
    body('descripcion')
        .notEmpty()
        .withMessage('La descripción es requerida')
        .trim(),
    
    body('tipo')
        .isIn([
            'MEDICINA_INTERNA',
            'CIRUGIA',
            'PEDIATRIA',
            'GINECOLOGIA',
            'CARDIOLOGIA',
            'NEUROLOGIA',
            'TRAUMATOLOGIA',
            'PSIQUIATRIA'
        ])
        .withMessage('Tipo de servicio inválido'),
    
    body('jefe.nombre')
        .notEmpty()
        .withMessage('El nombre del jefe es requerido')
        .trim(),
    
    body('jefe.email')
        .isEmail()
        .withMessage('Email del jefe inválido')
        .normalizeEmail(),
    
    body('jefe.telefono')
        .notEmpty()
        .withMessage('El teléfono del jefe es requerido')
        .trim(),
    
    validarRequest
];

module.exports = {
    validarRequest,
    validarInterconsulta,
    validarUsuario,
    validarServicio
};