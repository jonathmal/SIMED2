// server/src/models/servicio.js
const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        unique: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true
    },
    tipo: {
        type: String,
        required: [true, 'El tipo es requerido'],
        enum: [
            'MEDICINA_INTERNA',
            'CIRUGIA',
            'PEDIATRIA',
            'GINECOLOGIA',
            'CARDIOLOGIA',
            'NEUROLOGIA',
            'TRAUMATOLOGIA',
            'PSIQUIATRIA'
        ]
    },
    jefe: {
        nombre: {
            type: String,
            required: [true, 'El nombre del jefe es requerido']
        },
        email: {
            type: String,
            required: [true, 'El email del jefe es requerido'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Por favor ingrese un email válido'
            ]
        },
        telefono: {
            type: String,
            required: [true, 'El teléfono del jefe es requerido']
        }
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true  // This is the correct way to enable timestamps
});

// Add any methods if needed
servicioSchema.methods.toggleActive = function() {
    this.activo = !this.activo;
    return this.save();
};

module.exports = mongoose.model('Servicio', servicioSchema);