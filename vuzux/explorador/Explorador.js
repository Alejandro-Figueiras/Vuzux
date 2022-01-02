const { dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const Configuracion = require("../configuracion/Configuracion");
const CargadorInformacion = require("./CargadorInformacion");
    

module.exports = class Explorador {

    static ignore = {
        "C:/ProgramData":"C:/ProgramData",
        "C:/Program Files":"C:/Program Files",
        "C:/Program Files (x86)":"C:/Program Files (x86)",
        "C:/Windows":"C:/Windows"
    }

    static explorarDirectorio(ruta = "") {
        const videos = [], directorios = [];
        
        try {
            if (!fs.existsSync(ruta)) return {videos:[],directorios:[]};
            if (fs.existsSync(ruta+ ((ruta[ruta.length-1]=='\\' || ruta[ruta.length-1]=='/')?"":"/") + ".nomedia")) return {videos:[],directorios:[]};

            let files = fs.readdirSync(ruta);
            for (let file of files) {
                try {
                    const rutaFile = ruta+ ((ruta[ruta.length-1]=='\\' || ruta[ruta.length-1]=='/')?"":"/") + file;
                    let status = fs.statSync(rutaFile);
    
                    if (status.isDirectory()) {
                        let plantilla = {
                            ruta: rutaFile
                        }
                        directorios.push(plantilla)
                    } else {
                        let ext = path.extname(rutaFile);
                        if (!(ext == ".mp4" || ext == ".mkv"|| ext == ".avi" || ext == ".mpg" || ext == ".m4v" || ext == ".flv")) continue;
                        if (status.size < 1024) continue;
                        let plantilla = {
                            ruta: rutaFile,
                            directorio: ruta,
                            size: status.size,
                            ext
                        }
                        videos.push(plantilla);
                    }
                } catch (e) {}
            }
        } catch (e) {}

        console.log(ruta, videos, directorios);
        return {videos, directorios};
    }

    static getDirectorioInfo(ruta) {
        const videos = [];
        if (this.ignore[ruta] != undefined) return {path: ruta, videos, size};
        if (fs.existsSync(ruta+ ((ruta[ruta.length-1]=='\\' || ruta[ruta.length-1]=='/')?"":"/") + ".nomedia")) return {videos:[],directorios:[]};

        try {
            let files = fs.readdirSync(ruta);
            for (let file of files) {
                try {
                    const rutaFile = ruta+ ((ruta[ruta.length-1]=='\\' || ruta[ruta.length-1]=='/')?"":"/") + file;
                    let status = fs.statSync(rutaFile);
    
                    if (!status.isDirectory()) {
                        let ext = path.extname(rutaFile);
                        if (!(ext == ".mp4" || ext == ".mkv"|| ext == ".avi" || ext == ".mpg" || ext == ".m4v" || ext == ".flv")) continue;
                        videos.push(rutaFile);
                    }
                } catch (e) {}
            }
        } catch (e) {}

        return {path: ruta, videos};
    }

    static explorarPath(ruta = "") {
        const explorar = (path = "") => {
            let {videos, directorios} = this.explorarDirectorio(path);
            for (const dir of directorios) {
                for (const response of explorar(dir.ruta)) videos.push(response);
            }
            return videos;
        }
        return explorar(ruta);

    }

    static parseSize(bytes = 0) {
        let salida = "";
        if (bytes <= (1024 * 1024)) {
            // kilobytes
            salida = (bytes / 1024).toFixed(2)+"kB";
        } else if (bytes <= (1024 * 1024 * 1024)) {
            // megabytes
            salida = (bytes / (1024 * 1024)).toFixed(2)+"MB";
        } else if (bytes <= (1024 * 1024 * 1024 * 1024)) {
            // gigabytes
            salida = (bytes / (1024 * 1024 * 1024)).toFixed(2)+"GB";
        } else {
            // terabytes
            salida = (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)+"TB";
        } 
        return salida;
    }

    static parseTime(segundos = 0) {
        let segs = parseInt(segundos%60);
        let mins = parseInt(segundos/60%60);
        let horas = parseInt(segundos/3600%60);
        return `${(horas < 10)?"0":""}${horas}:${(mins < 10)?"0":""}${parseInt(mins)}:${(segs < 10)?"0":""}${parseInt(segs)}`;
    }

    static comprobarExistenciaPath(path = "") {
        try {
            return fs.existsSync(path);
        } catch (e) {
            return false;
        }
    }

    static comprobarVideos(videos = []) {
        let final = [];
        let guardar = false;
        for (const video of videos) {
            try {
                if (fs.existsSync(video.ruta)) {
                    let {template, guardarNew} = CargadorInformacion.getVideoTemplate(video.ruta);
                    final.push(template);
                    if (guardarNew) guardar = true;
                }
            } catch (e) {}
        }
        if (guardar) Configuracion.guardarCambios();
        return final;
    }

    static explorarPersonalizadosSync() {
        for(const dirPadre of Object.values(Configuracion.datos.directorios)) {
            let dirPadreInfo = this.explorarDirectorio(dirPadre.path);
            let dir = {
                path: dirPadre.path,
                videos: [],
                subdirectorios: {}
            }
            for (const vid of dirPadreInfo.videos) {
                dir.videos.push(vid.ruta)
            }
            for (const subdir of dirPadreInfo.directorios) {
                if (Configuracion.datos.directorios[subdir.ruta] != undefined) continue;
                let videos = Explorador.explorarPath(subdir.ruta+"/");
                for (const video of videos) {
                    if (dir.subdirectorios[video.directorio] == undefined) {
                        dir.subdirectorios[video.directorio] = {
                            path: video.directorio,
                            videos: [video.ruta]
                        }
                    } else {
                        dir.subdirectorios[video.directorio].videos.push(video.ruta)
                    }
                }
            }
            Configuracion.datos.directorios[dirPadre.path] = dir;
        }
        Configuracion.guardarCambios();
    }

    static explorarPersonalizados() {
        return new Promise((response, reject) => {
            response(this.explorarPersonalizadosSync());
        })
    }

    static agregarCarpeta(ventana) {
        return new Promise(async(resolve, reject) => {
            let directorio = await dialog.showOpenDialogSync(ventana, {
                properties: ["openDirectory"]
            });
            if (directorio) {
                resolve(directorio);
            } else {
                reject(directorio);
            }
        })
    }
}