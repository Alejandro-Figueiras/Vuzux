const { app, BrowserWindow, Menu, ipcMain, globalShortcut} = require("electron");
const url = require("url");
const path = require("path");
const Configuracion = require("./configuracion/Configuracion");
const Explorador = require("./explorador/Explorador");
const fs = require("fs");
const CargadorInformacion = require("./explorador/CargadorInformacion");
const Reproductor = require("./Reproductor");

let ventanaInicial, reproductor;
Configuracion.iniciar();

const iniciar = async() => {
    await Explorador.explorarPersonalizados();
    Configuracion.guardarCambios();
    await actualizarCarpetas();
    return 0;
}

const actualizarCarpetas = async() => {
    return new Promise(async(resolve, reject) => {
        for (let directorio of Object.values(Configuracion.datos.directorios)) {
            for (let video of directorio.videos) {
                console.log(video);
                let stat = fs.statSync(video);
                if (Configuracion.datos.archivos[video] == undefined || Configuracion.datos.archivos[video].size != stat.size || !fs.existsSync(Configuracion.datos.archivos[video].thumbnail)) {
                    try {
                        await CargadorInformacion.getVideoTemplate(video);
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
            for (let subdir of Object.values(directorio.subdirectorios)) {
                for (let video of subdir.videos) {
                    let stat = fs.statSync(video);
                    if (Configuracion.datos.archivos[video] == undefined || Configuracion.datos.archivos[video].size != stat.size || !fs.existsSync(Configuracion.datos.archivos[video].thumbnail)) {
                        try {
                            await CargadorInformacion.getVideoTemplate(video);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            }
        }
        Configuracion.guardarCambios();
        ventanaInicial.webContents.send("respuesta:finished", {
            datos: Configuracion.datos
        })
        resolve();
    })
}

const instanciarVentanaInicial = () => {
    ventanaInicial = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        width:853,
        height:480,
        minWidth: 853,
        minHeight: 480,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#101214',
            symbolColor: '#ffffff',
        },
        title: "Vuzux",
        icon: "./assets/icon.png"
    });
    
    
    ventanaInicial.loadURL(url.format({
        pathname: path.join(__dirname + "/interfaz/index.html"),
        protocol: "file",
        slashes: true,
    }));
    
    // Dev Tools
    globalShortcut.register('Ctrl+D', () => {
        ventanaInicial.toggleDevTools();
    })
    
    // let mainMenu = Menu.buildFromTemplate(templateMenu);
    // Menu.setApplicationMenu(mainMenu);
    Menu.setApplicationMenu(null);
    ventanaInicial.on("closed", () => {
        Configuracion.guardarCambios();
        app.quit();
    })
    
    ipcMain.on("start", async(e, obj) => {
        await iniciar();
        ventanaInicial.webContents.send("start:finished", {
            datos: Configuracion.datos
        })
    })
    
    ipcMain.on("getInfoEspecifica", async(e, obj) => {
        for (let video of obj.pendientes) {
            try {
                await CargadorInformacion.getVideoTemplate(video);
            } catch (e) {
                console.log(e);
            }
        }
        ventanaInicial.webContents.send("getInfoEspecifica:finished", {
            datos: Configuracion.datos
        })
    })

    ipcMain.on("reproducir", async(e, obj) => {
        reproducir(obj.template);
    })

    ipcMain.on("agregar-carpeta", async(e, obj) => {
        let dir = await Explorador.agregarCarpeta(ventanaInicial);
        const partes = dir[0].split("\\");
        let path = "";
        for (let i = 0; i < partes.length; i++) {
            if (i != 0) path += "/"
            path += partes[i];
        }
        if (Configuracion.datos.directorios[path] == undefined) Configuracion.datos.directorios[path] = {
            path,
            videos: [],
            subdirectorios: []
        }
        ventanaInicial.webContents.send("agregar-carpeta:finished", Configuracion.datos);
        console.log("Agregado completado");
        Explorador.explorarPersonalizados().then(() => {
            ventanaInicial.webContents.send("respuesta:finished", {
                datos: Configuracion.datos
            })
            actualizarCarpetas();
        })

    })
    
}

const reproducir = (template) => {
    if (reproductor == null) reproductor = new Reproductor(template, () => {
        ventanaInicial.webContents.send("respuesta:finished", {
            datos: Configuracion.datos
        })
    });

    reproductor.start(template);
}

const singleLock = app.requestSingleInstanceLock();

if (!singleLock) {
    app.quit();
} else {
    app.on("second-instance", (event, argv) => {
        console.log("segunda bkn");
    })

    // lo normal
    app.on("ready", () => {
        instanciarVentanaInicial();
    })
}