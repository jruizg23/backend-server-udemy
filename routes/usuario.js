const express = require('express');
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const SEED = require('../config/config').SEED;

const mdAutentificacion = require('../middlewares/autenticacion');

const app = express();

const Usuario = require('../models/usuario');

// ====================================
// Obtener todos los usuarios
// ====================================
app.get('/', (req, res, next) => {

    var limit = req.query.limit || 5;
    limit = Number(limit);
    var offset = req.query.offset || 0;
    offset = Number(offset);

    Usuario.find({}, 'nombre apellido email img role')
        .skip(offset)
        .limit(limit)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                Usuario.countDocuments({}, (err, conteo) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando usuarios',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        usuarios,
                        limit,
                        offset,
                        total: conteo
                    });
                });
            }
        );

});

// ====================================
// Actualizar usuario
// ====================================
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {

    const id = req.params.id;
    const body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(404).json({
                ok: false,
                mensaje: `Usuario con id ${id} no existe`,
                errors: { message: 'Usuario no encontrado' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.apellido = body.apellido;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });

});

// ====================================
// Crear un nuevo usuario
// ====================================
app.post('/', (req, res) => {

    const body = req.body;

    const usuario = new Usuario({
        nombre: body.nombre,
        apellido: body.apellido,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });

});

// ====================================
// Borrar un usuario por el id
// ====================================
app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {

    const id = req.params.id;
    Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error eliminando usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id',
                errors: { message: 'No existe el usuario' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;