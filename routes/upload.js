const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    const tipo = req.params.tipo;
    const id = req.params.id;

    const colecciones = ['hospitales', 'medicos', 'usuarios'];

    if (colecciones.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            errors: { message: 'Tipo de colección no válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Fichero no seleccionado',
            errors: { message: 'Debes seleccionar una imagen' }
        });
    }

    // Obtener nombre de archivo
    const archivo = req.files.imagen;
    const nombreArchivoSplit = archivo.name.split('.');
    const extension = nombreArchivoSplit[nombreArchivoSplit.length - 1];

    // Solo estas extensiones son aceptadas
    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    const nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    // Mover el archivo del temporal a un path
    const path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, (err) => {

        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido'
        // });

    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al recuperar el usuario',
                    errors: err
                });
            }

            if (!usuario) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Usuario con id ${id} no encontrado`,
                    errors: { message: 'Usuario no encontrado' }
                });
            }

            const pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe se elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error guardando la imagen',
                            errors: err
                        });
                    }
                });
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el usuario',
                        errors: err
                    });
                }

                usuarioActualizado.password = ";)";
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });

        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al recuperar el medico',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Medico con id ${id} no encontrado`,
                    errors: { message: 'Medico no encontrado' }
                });
            }

            const pathViejo = './uploads/medicos/' + medico.img;

            // Si existe se elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error guardando la imagen',
                            errors: err
                        });
                    }
                });
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el medico',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });

        });

    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al recuperar el hospital',
                    errors: err
                });
            }

            if (!hospital) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Hospital con id ${id} no encontrado`,
                    errors: { message: 'Hospital no encontrado' }
                });
            }

            const pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe se elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error guardando la imagen',
                            errors: err
                        });
                    }
                });
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el hospital',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });

        });
    }
}

module.exports = app;