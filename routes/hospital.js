const express = require('express');

const mdAutentificacion = require('../middlewares/autenticacion');

const app = express();

const Hospital = require('../models/hospital');

// ====================================
// Obtener todos los hospitales
// ====================================
app.get('/', (req, res, next) => {

    var limit = req.query.limit || 5;
    limit = Number(limit);
    var offset = req.query.offset || 0;
    offset = Number(offset);

    Hospital.find({})
        .skip(offset)
        .limit(limit)
        .populate('usuario', 'nombre apellido email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.countDocuments({}, (err, conteo) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando hospitales',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        hospitales,
                        limit,
                        offset,
                        total: conteo
                    });
                });
            }
        );
});

// ====================================
// Crear hospital
// ====================================
app.post('/', mdAutentificacion.verificaToken, (req, res) => {

    const body = req.body;

    const hospital = new Hospital({
        nombre: body.nombre,
        // img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// ====================================
// Actualizar hospital
// ====================================
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {

    const id = req.params.id;
    const body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(404).json({
                ok: false,
                mensaje: `Hospital con id ${id} no existe`,
                errors: { message: 'Hospital no encontrado' }
            });
        }

        hospital.nombre = body.nombre;
        // hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error guardando hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });
});

// ====================================
// Borrar hospital
// ====================================
app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {

    const id = req.params.id;

    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error eliminando hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con ese id',
                errors: { message: 'No existe el hospital' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;