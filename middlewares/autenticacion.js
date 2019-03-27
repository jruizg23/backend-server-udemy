const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

// ====================================
// Verificar token
// ====================================
exports.verificaToken = function(req, res, next) {
    // const token = req.query.token;

    var token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (!token) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token obligatorio',
            errors: { message: 'No se encuentra el token' }
        });
    }

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        // Podemos poner información que esté en el token en el request:
        req.usuario = decoded.usuario;

        next();
    });

};