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

// ====================================
// Verificar si es Administrador
// ====================================
exports.verificaRoleAdmin = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: { message: 'Acceso no autorizado' }
        });
    }
};

// ====================================
// Verificar si es Administrador o Mismo Usuario
// ====================================
exports.verificaRoleAdminOMismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || id === usuario._id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: { message: 'Acceso no autorizado' }
        });
    }
};