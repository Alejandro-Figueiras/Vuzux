const { BrowserWindow, ipcMain } = require("electron");
const url = require('url');
const path = require('path');
const Configuracion = require("./configuracion/Configuracion");
const CargadorInformacion = require("./explorador/CargadorInformacion");


module.exports = class Reproductor {

    constructor(template = {ruta: 0, nombre: 0, ext: 0, width: 0, height: 0, duracion: 0, visto: 0, size: 0, thumbnail: 0}, cb) {
        this.ventana = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enablePreferredSizeMode: true
            },
            width: 771,
            height: 480,
            minWidth: 771,
            minHeight: 480,
            titleBarStyle: 'hidden',
            titleBarOverlay: {
                color: '#101214',
                symbolColor: '#ffffff',
            },
            title: template.nombre + " Vuzux",
            icon: "./assets/icon.png"
        });

        this.ventana.toggleDevTools();

        this.ventana.loadURL(url.format({
            pathname: path.join(__dirname + "/interfaz/reproductor.html"),
            protocol: "file",
            slashes: true,
        }));

        // this.ventana.toggleDevTools();

        this.ventana.on("close", e => {
            e.preventDefault();
            this.ventana.hide();
            this.ventana.webContents.send("repro:close", {});
        })

        ipcMain.on("repro:fullscreen", () => {
            this.ventana.setFullScreen(!this.ventana.isFullScreen())
            this.ventana.webContents.send("repro:fullscreenRespuesta", {status: this.ventana.isFullScreen()});
        })

        ipcMain.on("repro:updateInfo", async(e, datos) => {
            if (Configuracion.datos.archivos[datos.ruta] == undefined) await CargadorInformacion.getVideoTemplate(datos.ruta);
            if (Configuracion.datos.archivos[datos.ruta].visto | 0 < datos.visto) Configuracion.datos.archivos[datos.ruta].visto = datos.visto;
            Configuracion.datos.archivos[datos.ruta].ultimoVolumen = datos.ultimoVolumen;
            Configuracion.datos.archivos[datos.ruta].vistoUltimaVez = datos.vistoUltimaVez;
            console.log("Actualizado");
            cb();
        })

    }

    start(template) {
        console.log("Reproducir: " + template.nombre);
        if (!this.ventana.isVisible()) this.ventana.show();
        this.ventana.title = template.nombre + " Vuzux";
        console.log("Sending...");
        if (this.listo) {
            this.ventana.webContents.send("repro:start", template);
        } else {
            ipcMain.on("repro:listo", () => {
                this.listo = true;
                this.ventana.webContents.send("repro:start", template);
            })
        }

    }

}