// Require
const mongoose = require('mongoose');
//Plugin de mongoose que sirve para validar valores unicos, En este codigo se usa para validar que el 'Categoria' sea unico y no se pueda repetir

// Categorias

let Schema = mongoose.Schema;
let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'descripcion necesitada']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});



// Categoria -- contiene las propiedades --> categoriaSchema
module.exports = mongoose.model('Categoria', categoriaSchema);