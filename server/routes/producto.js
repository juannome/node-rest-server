const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
let app = express();
let Producto = require('../models/producto');
const _ = require('underscore');
const e = require('express');

//========================================================================================//
//=============================GET Productos ============================================//
//======================================================================================//

app.get('/producto', verificaToken, (req, res) => {
    //=================================//
    // Mostrar todas los productos
    //=================================//
    // desde que registro quiere, parametros opcionales caen dentro de un Objeto en el req llamado .query ===> req.query
    let desde = req.query.desde || 0;
    desde = Number(desde);
    //Limite hasta que registro  si no especifico tomara 5, parametros opcionales caen dentro de un Objeto en el req llamado .query ===> req.query
    let limite = req.query.limite || 5;
    limite = Number(limite);
    //.find({ SE PUEDEN ESPECIFICAR QUE QUEREMOS FILTRAR, como activos, etc })

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        //Sort () ordena de manera alfabetica 
        .sort('descripcion')
        //Populate()revisa que id o objetcId hay en la categoria que estoy solicitando y me permitira cargar informacion
        //Populate(Primer argumento es el usuario, segundo argumento lo que quiero que se vea del usuario, el id sale por default) 
        .populate('usuario', 'nombre')
        .populate('categoria', 'descripcion')
        //exec --> execute --> funcion de mongoose
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            //Conteo para que me diga cuantos registros hay en la DB = si se especifica en el Categoria.find({AQUI}) se puede filtrar por la caracteristica que se necesite
            //Ojo se debe tambien agregar en el Categoria.count({AQUI} el mismo parametro del find
            Producto.count({ disponible: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo

                });
            });
        });
});
//========================================================================================//
//============================= GET 1 Producto ==========================================//
//======================================================================================//

app.get('/producto/:id', verificaToken, (req, res) => {
    //Categoria.finID(...)
    let id = req.params.id;

    Producto.findById(id)
        .sort('descripcion')
        //Populate()revisa que id o objetcId hay en la categoria que estoy solicitando y me permitira cargar informacion
        //Populate(Primer argumento es el usuario, segundo argumento lo que quiero que se vea del usuario, el id sale por default) 
        .populate('usuario', 'nombre')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Producto no existe'
                    }
                });
            }
            if (!productoDB) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});
//=================================//
//Buscar productos
//=================================//
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    //termino se hace de condicion para matchar los nombres en la db
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex, disponible: true })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});
//=================================//
//Crear nuevo Producto
//=================================//

app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        usuario: req.usuario._id,
        categoria: body.categoria,
        descripcion: body.descripcion



    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // if the category is not created
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        return res.json({
            ok: true,
            producto: productoDB,
        });
    });
});
//=================================//
//Actualizar producto
//=================================//
app.put('/producto/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    // pick - Este regresa una copia del objeto filtrando solo los valores que yo quiero
    let body = _.pick(req.body, ['nombre', 'precioUni', 'categoria', 'descripcion', 'disponible']);
    //Se adiciona {new: true}--{new es un objeto por eso va entre llaves} para que se haga el update en postman <---------> {runValidators: true} Se usa para validar los roles
    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

///=======================================================================================///
///=========================   DELETE CAMBIO_DISPONIBILIDAD  =============================///
///=======================================================================================///

app.delete('/producto/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    // Aprovechando las propiedades del findByIdAndUpdate se usa  $set: { 'status': false } para cambiar status en este caso de true a false 
    Producto.findByIdAndUpdate(id, { $set: { 'disponible': false }, new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoBorrado,
            mensaje: 'producto Borrado'
        });
    });
});

module.exports = app;