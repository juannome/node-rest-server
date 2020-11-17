//========== Aqui se creara una funcion que ejecute la verificacon del TOKEN =======//

//==================== requires ============//
const jwt = require('jsonwebtoken');

//=================== verificar TOKEN ========//
// next se encaga de que el programa se siga ejecutando
let verificaToken = (req, res, next) => {

    let token = req.get('Authorization');
    //jwt.verify ----> Codigo para recuperar toda la informacion directamente, pide 3  cosas ( token, string-heroku, callback = (err,decode) )
    jwt.verify(token, process.env.SEED, (err, decode) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token invalido'
                }
            });
        }
        req.usuario = decode.usuario;
        next();
    });

};
//==================== Verifica AdminRole ============//
let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es Administrador'
            }
        });

    }

};


module.exports = {
    verificaToken,
    verificaAdmin_Role
};