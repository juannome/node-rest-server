//============================Requires ================//
const express = require('express');
//De aqui se crearan Objetos con la palabra new -- Se usa mayuscula porque es estandar de nomenclatura Se importa el modelo(el usuarioSchema de la carpeta model)
const Usuario = require('../models/usuario');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

//===========================//
const app = express();
//========================================================================================//
//=====Require===Encriptador__password==========//
const bcrypt = require('bcrypt');
//========================================================================================//
// Underscore " _ ": Libreria con funcionalidades 
const _ = require('underscore');




//========================================================================================//
//================================   GET     ============================================//
//======================================================================================//


// El middleware va entre el primer argumento ('/usuario') y el callback  (req, res)

//No se esta ejecutando la funcion del middleware, se esta indicando que ese es el middleware que se disparara cuando se quiera accesar esa ruta
app.get('/usuario', verificaToken, (req, res) => {
    //desde que registro quiere, parametros opcionales caen dentro de un Objeto en el req llamado .query ===> req.query
    let desde = req.query.desde || 0;
    desde = Number(desde);
    //Limite hasta que registro  si no especifico tomara 5, parametros opcionales caen dentro de un Objeto en el req llamado .query ===> req.query
    let limite = req.query.limite || 5;
    limite = Number(limite);
    //.find({ SE PUEDEN ESPECIFICAR QUE QUEREMOS FILTRAR, como activos, etc })
    Usuario.find({ status: true }, 'nombre email img role status google')
        .skip(desde)
        .limit(limite)
        //exec --> execute --> funcion de mongoose
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            //Conteo para que me diga cuantos registros hay en la DB = si se especifica en el Usuario.find({AQUI}) se puede filtrar por la caracteristica que se necesite
            //Ojo se debe tambien agregar en el Usuario.count({AQUI} el mismo parametro del find

            Usuario.count({ status: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });

        });


});
//========================================================================================//
//================================   POST    ============================================//
//======================================================================================//
app.post('/usuario', [verificaToken, verificaAdmin_Role], (req, res) => {

    let body = req.body;

    //Crea una nueva Instancia del usuarioSchema con todas las propiedrades de Mongoose
    let usuario = new Usuario({
        //Paso todos los parametros que yo deseo
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    //Grabar en la base de datos 
    //UsuarioDB es la respuesta del usuario que se grabo en mongo (si es negativa err 'ok:false' o Si es positiva'ok: true')
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

//========================================================================================//
//=================================   PUT    ============================================//
//======================================================================================//
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;
    // pick - Este regresa una copia del objeto filtrando solo los valores que yo quiero
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'status']);
    //Se adiciona {new: true}--{new es un objeto por eso va entre llaves} para que se haga el update en postman <---------> {runValidators: true} Se usa para validar los roles
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

//========================================================================================//
//=======================   DELETE - ELIMINA_REGISTRO  ==================================//
//======================================================================================//
// app.delete('/usuario/:id', function(req, res) {
//     let id = req.params.id;
//     Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
//         if (err) {
//             return res.status(400).json({
//                 ok: false,
//                 err
//             });
//         }
//         if (!usuarioBorrado) {
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: 'Usuario no encontrado'
//                 }
//             });
//         }
//         res.json({
//             ok: true,
//             usuario: usuarioBorrado
//         });
//     });
// });

///=======================================================================================///
///============================   DELETE CAMBIO_STATUS  =================================///
///=======================================================================================///

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    // Aprovechando las propiedades del findByIdAndUpdate se usa  $set: { 'status': false } para cambiar status en este caso de true a false 
    Usuario.findByIdAndUpdate(id, { $set: { 'status': false }, new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});


module.exports = app;