const express = require('express');
const app = express();




//=====Se configuran las rutas ======//
app.use(require('./producto'));
app.use(require('./categoria'));
app.use(require('./usuario'));
app.use(require('./login'));



module.exports = app;