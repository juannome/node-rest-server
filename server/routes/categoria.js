const express = require('express');
//===========================//
let app = express();
//===========================//
let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

//De aqui se crearan Objetos con la palabra new -- Se usa mayuscula porque es estandar de nomenclatura Se importa el modelo(el usuarioSchema de la carpeta model)
let Categoria = require('../models/categoria');
//===========================================================================//


//========================================================================================//
//================================   GET 1   ============================================//
//======================================================================================//

app.get('/categoria', verificaToken, (req, res) => {
    //=================================//
    // Mostrar todas las categorias
    //=================================//
    //.find({ SE PUEDEN ESPECIFICAR QUE QUEREMOS FILTRAR, como activos, etc })
    Categoria.find({})
        //Sort () ordena de manera alfabetica 
        .sort('descripcion')
        //Populate()revisa que id o objetcId hay en la categoria que estoy solicitando y me permitira cargar informacion
        //Populate(Primer argumento es el usuario, segundo argumento lo que quiero que se vea del usuario, el id sale por default) 
        .populate('usuario', 'nombre email')
        //exec --> execute --> funcion de mongoose
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            //Conteo para que me diga cuantos registros hay en la DB = si se especifica en el Categoria.find({AQUI}) se puede filtrar por la caracteristica que se necesite
            //Ojo se debe tambien agregar en el Categoria.count({AQUI} el mismo parametro del find
            Categoria.count({ status: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo

                });
            });
        });
});

app.get('/categoria/:id', verificaToken, (req, res) => {
    //Categoria.finID(...)
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Id no es valido'
                }
            });
        }
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


//=================================//
//Crear nueva categoria
//=================================//
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id

    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }
        // if the category is not created
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});
//=================================//
//============ PUT ================//
//=================================//

app.put('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //actualziar categoria
    let id = req.params.id;
    let body = req.body;

    let desCategoria = {
        descripcion: body.descripcion
    };
    //Se adiciona {new: true}--{new es un objeto por eso va entre llaves} para que se haga el update en postman <---------> {runValidators: true} Se usa para validar los roles
    Categoria.findByIdAndUpdate(id, desCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});
//=================================//
//========== DELETE ==============//
//=================================//
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no Existe'
                }
            });
        }
        res.json({
            ok: true,
            categoria: {
                message: 'Categoria Borrada'
            }
        });
    });
});


module.exports = app;