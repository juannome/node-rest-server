//==================================================================//
//===================   Rutas en el servidor    ====================//
//==================================================================//
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Using a Google API Client Library
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../models/usuario');
const e = require('express');
const { response } = require('express');
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
        //Se renueva el token 
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


//Configuraciones de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };

}

app.post('/google', async(req, res) => {
    //Se recibe el token
    let token = req.body.idtoken;
    // Con el token se manda a llamar la funcion de 'GOOGLE'--> (verify)
    let googleUser = await verify(token)
        //Si el token es invalido o hay algun error
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });
    //Verifico si en mi base de datos tengo un usuario con ese correo
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (usuarioDB) {
            //Si existe y no se autenticado por google, quiere decir que se autentico normal  por usuario y contrasenia
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        mesagge: 'Debe usar su autenticacion normal'
                    }
                });
            } else {
                //Si el usuario se autentico por google renuevo el token
                let token = jwt.sign({
                    usuario: usuarioDB

                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //Si el usuario no existe en nuestra base de datos, es decir, es la primera vez que se va autenticar
            let usuario = new Usuario();
            //Se crea un nuevo objeto (usuario) con todas sus propiedades
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            usuario.password = ':)';

            //usuario.save para grabarlo en la base de datos
            usuario.save((err, usuarioDB) => {
                //error
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                //genera nuevo token
                let token = jwt.sign({
                    usuario: usuarioDB

                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                //respuesta
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});


































module.exports = app;