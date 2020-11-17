const mongoose = require('mongoose');
//Plugin de mongoose que sirve para validar valores unicos, En este codigo se usa para validar que el 'email' sea unico y no se pueda repetir
let uniqueValidator = require('mongoose-unique-validator');

//Realizando validaciones de Roles Correctos creando objeto rolesValidos para usar  'enum'
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
};

let Schema = mongoose.Schema;
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'nombre necesitado']
    },
    password: {
        type: String,
        required: [true, 'password necesitado']

    },
    email: {
        type: String,
        unique: true,
        required: [true, 'email necesitado']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    status: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

//======= Se excluye la password para que no aparezca visualmente al usuario ======//
usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObjetct = user.toObject();
    delete userObjetct.password;

    return userObjetct;
};
//pliguing UniqueValidator
usuarioSchema.plugin(uniqueValidator);

// Usuario -- contiene las propiedades --> usuarioSchema
module.exports = mongoose.model('Usuario', usuarioSchema);