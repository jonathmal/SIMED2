// src/models/Interconsulta.js
const mongoose = require('mongoose');

// Nota schema definition
const notaSchema = new mongoose.Schema({
    contenido: {
        type: String,
        required: true,
        trim: true
    },
    servicio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Servicio',
        required: true
    },
    autor: {
        type: String,
        required: true,
        trim: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

// Main interconsulta schema
const interconsultaSchema = new mongoose.Schema({
    paciente: {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        edad: {
            type: Number,
            required: true,
            min: [0, 'La edad no puede ser negativa'],
            max: [150, 'La edad parece ser inválida']
        },
        numeroHistoria: {
            type: String,
            required: true,
            unique: true,
            trim: true
        }
    },
    servicioSolicitante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    servicioDestino: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    objetivoConsulta: {
        type: String,
        required: true,
        trim: true
    },
    historiaClinica: {
        type: String,
        required: true,
        trim: true
    },
    estadoClinico: {
        subjetivo: {
            type: String,
            required: true,
            trim: true
        },
        signosVitales: {
            presionArterial: String,
            frecuenciaCardiaca: String,
            frecuenciaRespiratoria: String,
            temperatura: String,
            saturacionOxigeno: String
        }
    },
    laboratorios: {
        fechaUltimos: Date,
        resultados: {
            type: String,
            required: true,
            trim: true
        },
        observaciones: {
            type: String,
            trim: true
        }
    },
    imagenologia: {
        fecha: Date,
        tipo: String,
        descripcion: {
            type: String,
            required: true,
            trim: true
        },
        hallazgosRelevantes: {
            type: String,
            required: true,
            trim: true
        }
    },
    antecedentesPersonales: {
        type: String,
        required: true,
        trim: true
    },
    antecedentesFamiliares: {
        type: String,
        required: true,
        trim: true
    },
    alergias: {
        type: String,
        default: 'Ninguna conocida',
        trim: true
    },
    medicamentos: {
        preHospitalarios: {
            type: String,
            default: 'Ninguno',
            trim: true
        },
        hospitalarios: {
            type: String,
            default: 'Ninguno',
            trim: true
        }
    },
    estado: {
        type: String,
        enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'],
        default: 'PENDIENTE'
    },
    prioridad: {
        type: String,
        enum: ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'],
        default: 'MEDIA'
    },
    notas: [notaSchema],
    notificaciones: [{
        mensaje: String,
        fecha: { type: Date, default: Date.now },
        leida: { type: Boolean, default: false }
    }],
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual fields
interconsultaSchema.virtual('tiempoTranscurrido').get(function() {
    return Math.floor((Date.now() - this.fechaCreacion) / (1000 * 60 * 60 * 24)); // Days
});

interconsultaSchema.virtual('tiempoUltimaActualizacion').get(function() {
    return Math.floor((Date.now() - this.fechaActualizacion) / (1000 * 60 * 60)); // Hours
});

interconsultaSchema.virtual('diasEnEstado').get(function() {
    return Math.floor((Date.now() - this.fechaActualizacion) / (1000 * 60 * 60 * 24));
});

interconsultaSchema.virtual('notificacionesPendientes').get(function() {
    return this.notificaciones.filter(n => !n.leida).length;
});

// Methods
interconsultaSchema.methods.estaActiva = function() {
    return ['PENDIENTE', 'EN_PROCESO'].includes(this.estado);
};

interconsultaSchema.methods.puedeSerModificada = function() {
    return this.estado !== 'COMPLETADA' && this.estado !== 'CANCELADA';
};

interconsultaSchema.methods.esUrgente = function() {
    return this.prioridad === 'URGENTE' || this.prioridad === 'ALTA';
};

// Middlewares
interconsultaSchema.pre('save', function(next) {
    this.fechaActualizacion = Date.now();
    next();
});

// Ensure servicioSolicitante and servicioDestino are different
interconsultaSchema.pre('validate', function(next) {
    if (this.servicioSolicitante && this.servicioDestino &&
        this.servicioSolicitante.toString() === this.servicioDestino.toString()) {
        next(new Error('El servicio solicitante no puede ser igual al servicio destino'));
    }
    next();
});

// Indexes
interconsultaSchema.index({ 'paciente.numeroHistoria': 1 });
interconsultaSchema.index({ estado: 1 });
interconsultaSchema.index({ prioridad: 1 });
interconsultaSchema.index({ fechaCreacion: -1 });
interconsultaSchema.index({ servicioSolicitante: 1, estado: 1 });
interconsultaSchema.index({ servicioDestino: 1, estado: 1 });
interconsultaSchema.index({ 'paciente.nombre': 'text' }); // Text search for patient names

// Statics
interconsultaSchema.statics.pendientesPorServicio = function(servicioId) {
    return this.find({
        servicioDestino: servicioId,
        estado: 'PENDIENTE'
    }).sort({ fechaCreacion: 1 });
};

interconsultaSchema.statics.urgentes = function() {
    return this.find({
        prioridad: { $in: ['ALTA', 'URGENTE'] },
        estado: { $in: ['PENDIENTE', 'EN_PROCESO'] }
    }).sort({ fechaCreacion: 1 });
};

module.exports = mongoose.model('Interconsulta', interconsultaSchema);