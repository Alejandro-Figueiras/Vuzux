const CargarConfiguracion = require("../configuracion/CargadorConfiguracion")
const ffmpeg = require("fluent-ffmpeg");
const fs = require('fs');
const path = require('path');

module.exports = class Convertidor {

    static async mov2mp4(entrada) {
        const banderasIniciales = ["-pix_fmt", "yuv420p", "-movflags", "+faststart"];

        const ext = path.extname(entrada)
        const nombre = path.basename(entrada, ext)

        const out = path.join(`${CargarConfiguracion.ruta}/videos/${nombre}.mp4`);

        if (!fs.existsSync(path.dirname(out))) fs.mkdirSync(path.dirname(out))
        await new Promise(resolve => {
            ffmpeg(entrada)
                .outputOptions([...banderasIniciales, "-vcodec", "libx264", "-preset", "ultrafast", "-acodec", "copy"]).save(out)
                .on("end", () => {
                    resolve()
                });
        })

        return out;
    }

}