const { app, BrowserWindow, Menu, ipcMain, globalShortcut} = require("electron");
const url = require("url");
const path = require("path");
const Configuracion = require("./configuracion/Configuracion");
const Explorador = require("./explorador/Explorador");
const fs = require("fs");
const CargadorInformacion = require("./explorador/CargadorInformacion");
const Reproductor = require("./Reproductor");
const CargarConfiguracion = require("./configuracion/CargadorConfiguracion");

let ventanaInicial, reproductor;

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
        process.exit(0);
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
        ventanaInicial.webContents.send("agregar-carpeta:cargando", {});
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
        await Explorador.explorarPersonalizados();
        await actualizarCarpetas();
        ventanaInicial.webContents.send("agregar-carpeta:finished", Configuracion.datos);
        console.log("Agregado completado");

    })

    ipcMain.on("eliminarPath", async(e, obj) => {
        delete Configuracion.datos.directorios[obj.path];
        Configuracion.guardarCambios();
        ventanaInicial.webContents.send("respuesta:finished", {
            datos: Configuracion.datos
        });
    })
    
}

const reproducir = (template) => {
    console.log("A reproducir");
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
        console.log("segunda bkn", argv);
        ventanaInicial.show();
        ventanaInicial.focus();
        if (argv.length >= ((app.isPackaged)?3:4)) {
            if (path.isAbsolute((app.isPackaged)?argv[2]:argv[3])) {
                abrirRuta((app.isPackaged)?argv[2]:argv[3]);
            }
        }
    })

    // lo normal
    app.on("ready", (e, info) => {
        CargarConfiguracion.ruta = process.env['USERPROFILE']+path.sep+((!app.isPackaged)?".vuzux-dev":".vuzux")+path.sep
        Configuracion.ffmpegPath = path.join(__dirname,app.isPackaged?"../app.asar.unpacked":"", "nativos/ffmpeg.exe");
        Configuracion.ffprobePath = path.join(__dirname,app.isPackaged?"../app.asar.unpacked":"", "nativos/ffprobe-static/bin/win32/x64/ffprobe.exe");
        Configuracion.iniciar();
        instanciarVentanaInicial();

        Configuracion.datos.argv = process.argv;
        if (process.argv.length >= ((app.isPackaged)?2:3)) {
            if (path.isAbsolute((app.isPackaged)?process.argv[1]:process.argv[2])) {
                abrirRuta((app.isPackaged)?process.argv[1]:process.argv[2]);
            }
        }
    })

    const abrirRuta = async(ruta) => {
        console.log(ruta);
        partesRuta = ruta.split("\\");
        ruta = "";
        for (let i = 0; i < partesRuta.length; i++) {
            if (i != 0) ruta += "/";
            ruta += partesRuta[i];
        }
        try {
            let template = Configuracion.datos.archivos[ruta];
            if (template == undefined) {
                let status = fs.statSync(ruta);

                if (!status.isDirectory()) {
                    let ext = path.extname(ruta);
                    // EXTENSIONES (revisar el otro lugar donde estan las extensiones)
                    if (!(ext == ".mp4" || ext == ".mkv"|| ext == ".m4v")) {
                        console.log("El archivo no tiene un formato soportado");
                        return;
                    } else {
                        console.log("Por aqui bien");
                    }
                } else {
                    console.log("El archivo abierto es un directorio");
                    return;
                }
                template = (await CargadorInformacion.getVideoTemplate(ruta)).template;
                Configuracion.guardarCambios();
            }
            Configuracion.info = template;
            Configuracion.guardarCambios();
            reproducir(template);
        } catch (e) {
            console.log("Error en el sync");
            return;
        }
    }
}