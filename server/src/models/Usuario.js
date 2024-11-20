const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['ADMIN', 'JEFE_SERVICIO', 'MEDICO'], required: true },
    servicio: { type: mongoose.Schema.Types.ObjectId, ref: 'Servicio', required: function () { return this.rol !== 'ADMIN'; } },
    especialidad: { type: String, required: function () { return this.rol === 'MEDICO'; } },
    activo: { type: Boolean, default: true },  
    ultimoAcceso: { type: Date, default: Date.now }, 
}, { timestamps: true });

usuarioSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

usuarioSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('Usuario', usuarioSchema);
