const express = require('express');

const app = express();

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

const colecciones = [
    Hospital.collection.name,
    Medico.collection.name,
    Usuario.collection.name
];

// ====================================
// Búsqueda por colección
// ====================================
app.get('/coleccion/:coleccion/:termino', (req, res, next) => {

    const termino = req.params.termino;
    const coleccion = req.params.coleccion;
    const regexp = new RegExp(termino, 'i');
    var promesa;

    if (colecciones.indexOf(coleccion) < 0) {

        return res.status(404).json({
            ok: false,
            mensaje: `La colección ${coleccion} solicitada no existe`,
            errors: { message: "Colección no existente" }
        });

    }

    if (coleccion === Usuario.collection.name) {
        promesa = buscarUsuarios(regexp);
    }

    if (coleccion === Hospital.collection.name) {
        promesa = buscarHospitales(regexp);
    }

    if (coleccion === Medico.collection.name) {
        promesa = buscarMedicos(regexp);
    }

    promesa.then(resp => {
            res.status(200).json({
                ok: true,
                [coleccion]: resp
            });
        })
        .catch(err => {
            res.status(500).json({
                ok: false,
                mensaje: 'Error realizando la búsqueda',
                errors: err
            });
        });

});

// ====================================
// Búsqueda general
// ====================================
app.get('/todo/:termino', (req, res, next) => {

    const termino = req.params.termino;
    const regexp = new RegExp(termino, 'i');

    Promise.all([
            buscarHospitales(regexp),
            buscarMedicos(regexp),
            buscarUsuarios(regexp)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        })
        .catch(err => {
            res.status(500).json({
                ok: false,
                mensaje: 'Error realizando la búsqueda',
                errors: err
            });
        });


    // buscarHospitales(regexp).then(hospitales => {

    //     res.status(200).json({
    //         ok: true,
    //         hospitales
    //     });

    // });
});

function buscarHospitales(regexp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regexp })
            .populate('usuario', 'nombre apellido email img')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }

            });
    });
}

function buscarMedicos(regexp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regexp })
            .populate('usuario', 'nombre apellido email img')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }

            });
    });
}

function buscarUsuarios(regexp) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre apellido email role img')
            .or([{ nombre: regexp }, { email: regexp }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;