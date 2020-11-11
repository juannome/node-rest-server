const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is no a valid role'

};
let Schema = mongoose.Schema;
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'name needed']
    },
    email: {

        type: String,
        unique: true,
        required: [true, 'email needed']

    },
    password: {
        type: String,
        required: [true, 'password needed']

    },
    img: {
        type: String,
        required: [false, 'No needed']
    },
    role: {
        type: String,
        default: 'User_role',
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

usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} should be unique' });
module.exports = mongoose.model('Usuario', usuarioSchema);