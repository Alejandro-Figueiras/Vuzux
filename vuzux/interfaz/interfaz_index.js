const { ipcRenderer } = require("electron");
const uuid = require("uuid").v4;

(() => {
    let discosRevisar = [];
    let configRapida = {
        carpetasListadas: false,
        ultimoListado: 0
    }
    let pathsUUID = {};
    let configDatos = {}
    let cargando = true;
    const mainContent = document.getElementById("mainContent");

    // ------- posicion --------
    let posicionActual = -1;
    const cambiarVista = (posicion = -1) => {
        mainContent.innerHTML = "";
        switch (posicionActual) {
            // case 0: document.getElementById("nav-inicio").classList.remove("active"); break;

            case 2: document.getElementById("nav-carpetas").classList.remove("active"); break;
            // case 1: document.getElementById("nav-series").classList.remove("active"); break;
            // case 5: document.getElementById("nav-peliculas").classList.remove("active"); break;
            // case 3: document.getElementById("nav-favoritos").classList.remove("active"); break;
            case 4: document.getElementById("nav-ajustes").classList.remove("active"); break;
        }

        if (posicion == 2) {
            document.getElementById("nav-carpetas").classList.add("active");
            vistaCarpetas();
        } else if (posicion == 4) {
            document.getElementById("nav-ajustes").classList.add("active");
            vistaAjustes();
        }
        // else if (posicion == 5) {
        //     document.getElementById("nav_peliculas").classList.add("active");
        //     vistaPeliculas();

        // }
        posicionActual = posicion;
    }

    const iniciar = () => {
        cargando = false;
        cambiarVista(2);
    }

    ipcRenderer.on("start:finished", (e, datos = {}) => {
        configDatos = datos.datos;
        iniciar();
    })
    ipcRenderer.send("start", {});

    const vistaCargando = () => {
        let html = `<div class="m-0 row justify-content-center align-items-center" style="height: 100% !important;">
            <div class="col">
                <img src="img/cargando.gif" width="40px" height="40px" class="d-block m-auto align-content-center">
                <p class="text-light mt-2" style="font-size: 18px; text-align: center;">Cargando...</p>
            </div>
        </div>`

        mainContent.innerHTML = html;
    }

    // renovando informacion
    ipcRenderer.on("respuesta:finished", (e, datos = {}) => {
        configDatos = datos.datos;
    })

    // ------- Carpetas --------
    const vistaCarpetas = () => {
        mostrarCarpetasLista();
    }

    const mostrarCarpetasLista = () => {
        let html = `<div class="container-fluid" id="mainContainer"></div>`;
        mainContent.innerHTML = html;
        let global = document.createElement("div");
        document.getElementById("mainContainer").appendChild(global);
        global.outerHTML = Plantillas.getTablaUnidad("main");
        const body = document.getElementById(`tabla${"main"}Body`);

        console.log(configDatos);
        for (let dir of Object.values(configDatos.directorios)) {
            if (dir.videos.length!=0) {
                let uuidPath = uuid();
                pathsUUID[uuidPath] = {uuid: uuidPath, path: dir.path, obj: dir};
                body.innerHTML += `<tr id="${uuidPath}"><td>${dir.path}</td><td style="text-align: right">${dir.videos.length} ${(dir.videos.length == 1)?"video":"videos"}</td></tr>`
            }
            for (let carpeta of Object.values(dir.subdirectorios)) {
                let uuidPath = uuid();
                pathsUUID[uuidPath] = {uuid: uuidPath, path: carpeta.path, obj: carpeta};
                body.innerHTML += `<tr id="${uuidPath}"><td>${carpeta.path}</td><td style="text-align: right">${carpeta.videos.length} ${(carpeta.videos.length == 1)?"video":"videos"}</td></tr>`
            }
        }
        body.addEventListener("click", e => {
            vistaCarpeta(pathsUUID[e.target.parentElement.id].obj)
        })
    }

    const vistaCarpeta = (carpeta = "") => {
        let nombre = carpeta.path.split("/").reverse()[(carpeta.path.charAt(carpeta.path.length - 1) == '/')?1:0];
        let html = `<div class="offcanvas offcanvas-top vh-100 bg-dark text-light" tabindex="-1" id="offcanvasTop" aria-labelledby="offcanvasTopLabel">
            <div class="offcanvas-header">
                <h5 id="offcanvasTopLabel"><a href="#" class="text-light text-underline-none nonDraggable" data-bs-dismiss="offcanvas" aria-label="Close"><img src="img/atras.svg" style="height:100%"></a>  ${nombre}</h5>
            </div>
            <div class="offcanvas-body" id="offcanvasTopBody">
            
                <div id="offcanvasCargando" class="m-0 row justify-content-center align-items-center" style="height: 100% !important;">
                    <div class="col">
                        <img src="img/cargando.gif" width="40px" height="40px" class="d-block m-auto align-content-center">
                        <p class="text-light mt-2" style="font-size: 18px; text-align: center;">Cargando informacion...</p>
                    </div>
                </div>
                <div class="row row-cols-md-4 row-cols-lg-5 row-cols-xl-6" id="offcanvas-row"></div>

            </div>
        </div>`
        let objeto = document.createElement("div");
        document.getElementById("elementos-static").appendChild(objeto);
        objeto.outerHTML = html;
        let pendientes = [];
        for (let video of carpeta.videos) {
            if (configDatos.archivos[video] == undefined) {
                pendientes.push(video);
            }
        }
        const mostrarVideos = () => {
            document.getElementById("offcanvasCargando").outerHTML = "";
            let htmlRow = document.getElementById("offcanvas-row");
            for (let video of carpeta.videos) {
                if (configDatos.archivos[video] == undefined) break;
                let uuidPath = uuid();
                pathsUUID[uuidPath] = video;
                htmlRow.innerHTML += Plantillas.getVistaVideo(uuidPath, configDatos.archivos[video]);
                console.log(video, ":",configDatos.archivos[video].visto);

                if ((configDatos.archivos[video].visto |0) != 0) {
                    let image = new Image();
                    image.src = configDatos.archivos[video].thumbnail;
                    document.getElementById("elementos-hidden").appendChild(image)
                    image.onload = () => {
                        let canvas = document.createElement("canvas");
                        canvas.width = image.width;
                        canvas.height = image.height;
                        // Inserta la nueva imagen
                        canvas.getContext("2d").drawImage(image, 0, 0);
                        
                        let context = canvas.getContext('2d');
                
                        context.beginPath();
                        context.rect(0, canvas.height-7, parseInt(canvas.width * (configDatos.archivos[video].visto/configDatos.archivos[video].duracion)), 6);
                        context.fillStyle = 'red';
                        context.fill();
                        context.lineWidth = 6;
                        context.strokeStyle = 'red';
                        context.stroke();

                        canvas.classList.add("card-img-top");
                        canvas.classList.add("rounded");
                        canvas.classList.add("mb-0");
                        canvas.setAttribute("style", "bottom:-5px")
                        let a = document.getElementById(uuidPath).getElementsByClassName("card-img-top")[0];
                        a.src = canvas.toDataURL();
                    };
                    
                }
            }
            
        }
        if (pendientes.length == 0) {
            mostrarVideos();
        } else {
            cargando = true;
            console.log("Mandar peticion");
            ipcRenderer.sendSync("getInfoEspecifica", {pendientes})
            ipcRenderer.on("getInfoEspecifica:finished", (e, obj) => {
                configDatos = obj.datos;
                cargando = false;
                mostrarVideos();
            })
        }
        let side = new bootstrap.Offcanvas(document.getElementById("offcanvasTop"));
        const clickEvent = (e) => {
            const target = e.target;
            console.log(target);
            let id = "";
            for (let clase of target.classList) {
                switch (clase) {
                    case "card":
                        id = target.parentElement.id;
                        break;
                    case "card-img-top":
                        id = target.parentElement.parentElement.id;
                        break;
                    case "cardimagen":
                        id = target.parentElement.parentElement.id;
                        break;
                    case "card-body":
                        id = target.parentElement.parentElement.id;
                        break;
                    case "card-text":
                        id = target.parentElement.parentElement.parentElement.id;
                        break;
                }
            }
            console.log(id);
            if (id != "" && configDatos.archivos[pathsUUID[id]]) {
                console.log(configDatos.archivos[pathsUUID[id]]);
                ipcRenderer.send("reproducir", {template: configDatos.archivos[pathsUUID[id]]});
            }
        }
        document.getElementById("offcanvas-row").addEventListener("click", clickEvent)
        side.show();
        document.getElementById("offcanvasTop").addEventListener("hidden.bs.offcanvas", e => {
            document.getElementById("offcanvas-row").removeEventListener("click", clickEvent)
            e.target.outerHTML = ""; // bai bai
        })
    }

    const vistaPeliculas = () => {
        let html = `<div class="container-fluid" id="mainContainer">
            <section class="peliculas-recientes border-bottom">
                <h5 class="text-light">Recientes:</h5>
                <div class="peliculas-recientes-div">
                    <div class="row row-cols-5 row-cols-lg-6 row-cols-xl-7">
                        
                    </div>
                </div>
            </section>
            <button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasTop" aria-controls="offcanvasTop">Toggle top offcanvas</button>
            <div class="offcanvas offcanvas-top vh-100 bg-dark text-light" tabindex="-1" id="offcanvasFavoritos" aria-labelledby="offcanvasFavoritosLabel">
                <div class="offcanvas-header">
                    <h5 id="offcanvasFavoritosLabel"><a href="#" class="text-light text-underline-none nonDraggable" data-bs-dismiss="offcanvas" aria-label="Close"><img src="img/atras.svg" style="height:100%"></a>  Peliculas Favoritas</h5>
                </div>
                <div class="offcanvas-body" id="offcanvasFavoritosBody">
                    <div class="row row-cols-md-5 row-cols-lg-6 row-cols-xl-7" id="offcanvas-row">
                    
                    </div>
                </div>
            </div>
            <section class="peliculas-favoritas">
                <a href="#" class="text-decoration-none text-light" data-bs-toggle="collapse" data-bs-target="#favoritoscollapse" aria-expanded="false" aria-controls="favoritoscollapse">Toca para mostrar favoritos</a>
                <div class="collapse row row-cols-5 row-cols-lg-6 row-cols-xl-7" id="favoritoscollapse">
                    
                </div>
            </section>
        </div>`;
        mainContent.innerHTML = html;
    }

    /* -------- Ajustes ------- */

    const vistaAjustes = () => {
        let html = `<div class="container-fluid" id="mainContainer">
            <a href="#" class="btn btn-secondary" style="text-align: right" id="agregar-ruta">Agregar</a>
        </div>`;
        mainContent.innerHTML = html;
        let global = document.createElement("div");
        document.getElementById("mainContainer").appendChild(global);
        global.outerHTML = Plantillas.getTablaRutas("rutas");
        const body = document.getElementById(`tabla${"rutas"}Body`);

        for (let dir of Object.values(configDatos.directorios)) {
            let uuidPath = uuid();
            pathsUUID[uuidPath] = {uuid: uuidPath, path: dir.path, obj: dir};
            body.innerHTML += `<tr id="${uuidPath}"><td>${dir.path}</td><td style="text-align: right; max-width: 70px;"><a href="#" class="text-danger text-decoration-none">Eliminar</a></td></tr>`
        }
        body.addEventListener("click", e => {
            // vistaCarpeta(pathsUUID[e.target.parentElement.id].obj)
        })

        document.getElementById("agregar-ruta").addEventListener("click", e => {
            ipcRenderer.send("agregar-carpeta", {});
            ipcRenderer.on("agregar-carpetas:finished", (e, datos) => {
                console.log("respuesta yeeeee");
                configDatos = datos;
                const body = document.getElementById(`tabla${"rutas"}Body`);
                body.innerHTML = "";
                for (let dir of Object.values(configDatos.directorios)) {
                    let uuidPath = uuid();
                    pathsUUID[uuidPath] = {uuid: uuidPath, path: dir.path, obj: dir};
                    body.innerHTML += `<tr id="${uuidPath}"><td>${dir.path}</td><td style="text-align: right; max-width: 70px;"><a href="#" class="text-danger text-decoration-none">Eliminar</a></td></tr>`
                }
            })
        })
    }

    document.getElementById("nav-carpetas").addEventListener("click", e => {if (!cargando) cambiarVista(2)});
    // document.getElementById("nav_peliculas").addEventListener("click", e => cambiarVista(5));
    document.getElementById("nav-ajustes").addEventListener("click", e => {if (!cargando) cambiarVista(4)});
})();