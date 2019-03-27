const express = require('express');

const mdAutentificacion = require('../middlewares/autenticacion');

const app = express();

const Medico = require('../models/medico');

// ====================================
// Obtener todos los medicos
// ====================================
app.get('/', (req, res, next) => {

    var limit = req.query.limit || 5;
    limit = Number(limit);
    var offset = req.query.offset || 0;
    offset = Number(offset);

    Medico.find({}, (err, medicos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando meidocos',
                    errors: err
                });
            }


            Medico.countDocuments({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    medicos,
                    limit,
                    offset,
                    total: conteo
                });
            });

        })
        .skip(offset)
        .limit(limit)
        .populate('usuario', 'nombre apellido email')
        .populate('hospital');

});

// ====================================
// Crear medico
// ====================================
app.post('/', mdAutentificacion.verificaToken, (req, res) => {

    const body = req.body;
    const usuarioId = req.usuario._id;

    const medico = new Medico({
        nombre: body.nombre,
        apellido: body.apellido,
        // img: body.img,
        usuario: usuarioId,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

// ====================================
// Actualizar medico
// ====================================
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {

    const id = req.params.id;
    const body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(404).json({
                ok: false,
                mensaje: `Medico con id ${id} no existe`,
                errors: { message: 'Medico no encontrado' }
            });
        }

        medico.nombre = body.nombre;
        medico.apellido = body.apellido;
        // medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error guardando medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });
});

// ====================================
// Borrar medico
// ====================================
app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {

    const id = req.params.id;

    Medico.findByIdAndDelete(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error eliminando medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con ese id',
                errors: { message: 'No existe el medico' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;