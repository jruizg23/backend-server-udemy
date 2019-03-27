const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

const app = express();

const Usuario = require('../models/usuario');


// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ====================================
// Login con Google
// ====================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.given_name,
        apellido: payload.family_name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async(req, res) => {

    const token = req.body.token;

    const googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido',
            });
        });

    // Comprobamos si el usuario existe y sino lo almacenamos en la BBDD:

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando usuario',
                errors: err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar el login normal'
                });
            } else {
                const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    access_token: token,
                    token_type: 'Bearer',
                    id: usuarioDB._id
                });
            }
        } else {
            // Creamos el usuario que no existe
            var usuario = new Usuario({
                nombre: googleUser.nombre,
                apellido: googleUser.apellido,
                email: googleUser.email,
                img: googleUser.img,
                google: true,
                password: ':)',
            });

            usuario.save((err, usuarioDB) => {

                const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error guardando usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    access_token: token,
                    token_type: 'Bearer',
                    id: usuarioDB._id
                });
            });
        }
    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Respuesta OK',
    //     googleUser
    // });
});

// ====================================
// Login normal
// ====================================
app.post('/', (req, res) => {

    const body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: { message: 'Credenciales incorrectas' }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: { message: 'Credenciales incorrectas' }
            });
        }

        // TODO: Crear token!!

        usuarioDB.password = '[~+_-_+~]';
        const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            access_token: token,
            token_type: 'Bearer',
            id: usuarioDB._id
        });

    });

});

module.exports = app;