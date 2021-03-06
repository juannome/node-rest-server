//========== requires ============//
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

//Paquete que trae node para hacer direccionar 
const path = require('path');
//============ configuracion =========//
require('./config/config');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


//Habilitar carpeta Public para ser accedida
//Se debe implementar el middleware de expreess + path para hacer publico todo el directorio

app.use(express.static(path.resolve(__dirname, '../public')));


//=====Se configuran globalmente las rutas ======//
app.use(require('./routes/index'));


mongoose.connect(process.env.URL_DB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
    (err, res) => {
        if (err) throw err;
        console.log('Base de datos Online!');
    });

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
});