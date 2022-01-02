const fs = require("fs");
const ffprobe = require("ffprobe");
const ffprobePath = require("./../nativos/ffprobe-static/index").path;
const Thumbnails = require("./../thumbnails/Thumbnails");
const package_path = require("path");
const Configuracion = require("../configuracion/Configuracion");


module.exports = class CargadorInformacion {

    static getVideoInfo(path) {
        return new Promise((response, reject) => {
            ffprobe(path, {path: ffprobePath}).then(info => {
                response(info);
            }).catch(err => reject(err));
        });
    }

    static getVideoTemplate(path = "") {
        const partes = path.split("\\");
        path = "";
        for (let i = 0; i < partes.length; i++) {
            if (i != 0) path += "/"
            path += partes[i];
        }
        return new Promise((response, reject) => {
            this.getVideoInfo(path).then(info => {
                const stat = fs.statSync(path);
                let partes_n = path.split("/")
                let nombre_partes = partes_n[partes_n.length - 1].split(".");
                let nombre = "";
                for (let i = 0; i < nombre_partes.length - 1; i++) {
                    if (i != 0) nombre += ".";
                    nombre += nombre_partes[i];
                }
                let ext = package_path.extname(path);
                if (Configuracion.datos.archivos[path] != undefined) {
                    let obj = Configuracion.datos.archivos[path];

                    if (obj.ruta != path || obj.nombre != nombre || obj.ext != ext ||
                        obj.width != info.streams[0].width || obj.height != info.streams[0].height ||
                        obj.duracion != info.streams[0].duration || obj.size != stat.size ||
                        obj.thumbnail == "" ||  !fs.existsSync(obj.thumbnail)) {
                            Thumbnails.crear(path, info.streams[0].duration).then(thumbnailPath => {
                                // el mismo de abajo xddd
                                let template = {
                                    ruta: path,
                                    nombre, 
                                    ext,
                                    width: info.streams[0].width,
                                    height: info.streams[0].height,
                                    duracion: info.streams[0].duration,
                                    visto: obj.visto | 0,
                                    size: stat.size,
                                    thumbnail: thumbnailPath,
                                    vistoUltimaVez: obj.vistoUltimaVez | 0,
                                    ultimoVolumen: obj.ultimoVolumen | 1
                                }
            
                                Configuracion.datos.archivos[path] = template;
                                response({template, guardar: true});
                            }).catch(err => reject(err));
                        } else {
                            response({template: obj, guardar:false});
                        }
                } else {
                    Thumbnails.crear(path, info.streams[0].duration).then(thumbnailPath => {
                        // el mismo de arriba xddd
                        let template = {
                            ruta: path,
                            nombre, 
                            ext,
                            width: info.streams[0].width,
                            height: info.streams[0].height,
                            duracion: info.streams[0].duration,
                            visto: 0,
                            size: stat.size,
                            thumbnail: thumbnailPath,
                            vistoUltimaVez: 0,
                            ultimoVolumen: 1
                        }
    
                        Configuracion.datos.archivos[path] = template;
                        response({template, guardar: true});
                    }).catch(err => reject(err));
                }

            }).catch(err => reject(err));
            
            
        })
    }

}