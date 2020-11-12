//==================================================================//
//===================   Rutas en el servidor    ====================//
//==================================================================//
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {


    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //===================== Si el usuario es incorrecto =============//
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o password incorrectos'
                }
            });
        }
        //====================== bcrpt ===================//
        //============ Al no poder hacer el proceso inverso =====//
        //================= Se toma la password y se vuelve a encriptar y se compara usando bcrypt.compareSync =====//
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o password incorrecto'
                }
            });
        }
        let token = jwt.sign({
            usuario: usuarioDB

        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        //UsuarioDB es el Payload---> lo que contiene el registro en si: el id,nombre,email, etc
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});








































module.exports = app;