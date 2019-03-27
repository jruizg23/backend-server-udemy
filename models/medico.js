const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medicoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre	es	necesaEl nombre es obligatorio'] },
    apellido: { type: String, required: false },
    img: { type: String, required: false },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El id usuario es un campo obligatorio']
    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'El id hospital es un campo obligatorio']
    }

});
module.exports = mongoose.model('Medico', medicoSchema);