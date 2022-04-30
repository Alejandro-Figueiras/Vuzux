const CC = require("../configuracion/CargadorConfiguracion");
const uuid = require("uuid").v4;
const fs = require("fs");
const genThumbnail = require('simple-thumbnail');
const sharp = require("sharp");
const sizeOf = require('image-size');
const Configuracion = require("../configuracion/Configuracion");

module.exports = class Thumbnails {

    static crear(path = "", duracion = 0) {
        return new Promise((resolve, reject) => {
            try {
                const id = uuid();
                let salida = CC.ruta + "thumbnails/" + id + "_uncrop.png";
                let salidaFinal = CC.ruta + "thumbnails/" + id + ".png";
                let duracionCustom = 0
                if (duracion < 45) duracionCustom = parseInt(duracion/10);
                if (duracionCustom > 45) duracionCustom = 42;
                if (duracionCustom) console.log("Duracion Custom:", duracionCustom);
                console.log(`INFO: Generando thumbnail para ${path} en ${salidaFinal}`);
                genThumbnail(path, salida, '640x?', {path:Configuracion.ffmpegPath, seek:(duracion < 45)?`00:00:${duracionCustom}.00`:"00:00:42.23"})
                .then(async() => {
                    const size = await sizeOf(salida);
                    let w, h;
                    if (size.width >= size.height) {
                        w = parseInt(size.height*16/9);
                        h = parseInt(size.height);
                    } else {
                        h = parseInt(size.width*9/16);
                        w = parseInt(size.width);
                    }
    
                    if (w > size.width) w = size.width;
                    if (h > size.height) h = size.height;
    
                    sharp(salida).extract({ width: w, height: h, left: size.width - w, top: size.height - h}).toFile(salidaFinal)
                    .then(() => {
                        fs.unlinkSync(salida);
                        console.log(`INFO: Generada thumbnail para ${path} en ${salidaFinal}`);
                        resolve(salidaFinal);
                    })
                    .catch(err => {
                        fs.unlinkSync(salida);
                        console.log(`ERROR: ${err}`);
                        resolve("../assets/interfaz/miniatura.png");
                        reject(err);
                    });
                })
                .catch(err => {
                    resolve("../assets/interfaz/miniatura.png")
                    reject(err);
                })
            } catch (e) {
                resolve("../assets/interfaz/miniatura.png");
            }
        });
        
    }
}