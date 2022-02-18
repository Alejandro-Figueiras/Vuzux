const uuidv4 = require('uuid').v4;
const CargadorInformacion = require('../explorador/CargadorInformacion');
const path = require('path');
const CargarConfiguracion = require('../Configuracion/CargadorConfiguracion');
const fs = require('fs');
const ffmpeg = require("fluent-ffmpeg");

module.exports = class DivisorArchivos {

    static async dividirVideo(entrada) {
        const ext = path.extname(entrada)
        const nombre = path.basename(entrada, ext)

        const uuid = uuidv4();
        let infoStreams = await CargadorInformacion.getVideoInfo(entrada);

        let salidas = [];
        const duracionTotal = infoStreams.streams[0].duration;
        const spf = 30; // segundos por fragmento !SPF
        for (let i = 0; i < duracionTotal / spf; i++) {
            console.log("Formando parte ", i);
            const out = path.join(`${CargarConfiguracion.ruta}/videos/${uuid}__${i}.mp4`);

            const inicio = i * spf;
            const final = (((i + 1) * spf) > duracionTotal)?duracionTotal:(((i + 1) * spf)+0.234);
            if (!fs.existsSync(path.dirname(out))) fs.mkdirSync(path.dirname(out))
            await new Promise(resolve => {
                ffmpeg(entrada)
                    .outputOptions(["-movflags", "+faststart","-preset", "ultrafast", "-ss", `${inicio}`, "-to", `${final}`, "-vcodec", "libx264", "-acodec", "copy"]).save(out)
                    .on("end", () => {
                        salidas[i] = out;
                        resolve();
                    }).on('error', function(err) {
                        console.log('An error occurred: ' + err.message);
                    })
            })
        }

        return salidas;
    }

}