const { ipcRenderer } = require("electron");

(() => {
    /* Label superior */ 
    let labelFormat = function(w, d) {
        const fit = d.getElementById("labelSuperior");
        const wrap = d.getElementById("labelName");
        fontFitResize(fit, wrap);
    
        
        function fontFitResize(fit, wrap, step = 0.5) {
            var currentSize;
            console.log(`${fit.offsetWidth} < ${wrap.offsetWidth}`);
            while (fit.offsetWidth > wrap.offsetWidth) {
                currentSize = parseFloat(w.getComputedStyle(wrap, null).getPropertyValue('font-size'));
                console.log(currentSize);
                if (currentSize > 24) {
                    break;
                }
                wrap.style.fontSize = (currentSize + step) + 'px';
                console.log(wrap.style.fontSize);
            }
            while(fit.offsetWidth < wrap.offsetWidth) {
                currentSize = parseFloat(w.getComputedStyle(wrap, null).getPropertyValue('font-size'));
                console.log(currentSize);
                if (currentSize < 10) {
                    break;
                }
                wrap.style.fontSize = (currentSize - step) + 'px';
                console.log(wrap.style.fontSize);
            }
        }
        
    };

    labelFormat(window, document);
    window.onresize = () => {
        console.log("resize");
        labelFormat(window, document)
    }

    /* INTERFAZ */ 
    let interfaz = document.getElementById("interfaz");
    let interfazHover = 0;

    interfaz.addEventListener("mouseenter", () => {
        interfaz.classList.add("interfaz-hover");
        interfazHover++;
    })

    interfaz.addEventListener("mouseleave", () => {
        setTimeout(function() {
            interfazHover--;
            if (!interfazHover) interfaz.classList.remove("interfaz-hover");
        }, 2000);
    })


    /*  Controles */
    const video = document.getElementById("video");
    let informacion = {};
    let tieneHoras = false;
    const iconos = {
        play: "icons/play.png",
        pausa: "icons/pausa.png",
        fullscreen: "icons/fullscreen.png",
        windowed: "icons/windowed.png",
        vol0: "icons/volumen-0.png",
        vol1: "icons/volumen-1.png",
        vol2: "icons/volumen-2.png"
    }
    const btnPlay = document.getElementById("btn-play");
    const btnRetroceder = document.getElementById("btn-retroceder");
    const btnAdelantar = document.getElementById("btn-adelantar");
    const btnRestart = document.getElementById("btn-restart");
    const btnFullscreen = document.getElementById("btn-fullscreen");
    const btnVolumen = document.getElementById("btn-volumen");
    const progressBar = document.getElementById("progress-bar");
    const labelName = document.getElementById("labelName");
    const duracionTotal = document.getElementById("duracionTotal");
    const duracionActual = document.getElementById("duracionActual");
    const volumenBar = document.getElementById("volumenBar");
    
    let ultimoBar = 0;
    let actualizacion = false;
    let ultimoVolumen = 1;

    const parseTime = (segundos = 0) => {
        let segs = parseInt(segundos%60);
        let mins = parseInt(segundos/60%60);
        let horas = parseInt(segundos/3600%60);
        return `${(horas || tieneHoras)?`${(horas < 10)?"0":""}${horas}:`:""}${(mins < 10)?"0":""}${parseInt(mins)}:${(segs < 10)?"0":""}${parseInt(segs)}`;
    }

    const actualizarInformacion = (modoSync = false)  => {
        if (informacion.visto < video.currentTime) informacion.visto = video.currentTime;
        let info = {
            ruta: informacion.ruta,
            visto: informacion.visto,
            ultimoVolumen: video.volume,
            vistoUltimaVez: video.currentTime
        }
        if (modoSync) {
            ipcRenderer.sendSync("repro:updateInfo", info);
        } else {
            ipcRenderer.send("repro:updateInfo", info);
        }
    }
    
    const togglePausa = () => {
        if (video.paused) {
            video.play();
            btnPlay.src = iconos.pausa;
        } else {
            video.pause();
            btnPlay.src = iconos.play;
            actualizarInformacion();
        }
    }

    const retroceder = (segs = 10) => {
        video.currentTime = parseInt((video.currentTime - segs < 0)?0:(video.currentTime - segs));
        actualizacion = true;
        if (informacion.visto < video.currentTime) informacion.visto = video.currentTime;
        actualizarInformacion();
    }

    const adelantar = (segs = 10) => {
        video.currentTime = parseInt((video.currentTime + segs > informacion.duracion)? informacion.duracion :(video.currentTime + segs));
        actualizacion = true;
        actualizarInformacion();
    }

    const reiniciar = () => {
        video.currentTime = 0;
        actualizacion = true;
        actualizarInformacion();
    }

    const requestFullscreen = () => {
        ipcRenderer.send("repro:fullscreen", {});
        ipcRenderer.on("repro:fullscreenRespuesta", (e, datos) => {
            btnFullscreen.src = (datos.status)? iconos.windowed : iconos.fullscreen;
            if (datos.status) {
                document.getElementById("mainContent").classList.add("mainFullscreened");
                document.getElementById("navbar-init").classList.add("navbar-fullscreen");
                document.getElementById("labelSuperior").classList.add("labelSuperiorActive");
            } else {
                document.getElementById("mainContent").classList.remove("mainFullscreened");
                document.getElementById("navbar-init").classList.remove("navbar-fullscreen");
                document.getElementById("labelSuperior").classList.remove("labelSuperiorActive");
            }
            console.log("toggled");
        })
    }

    const actualizarBotonVolumen = (vol) => {
        if (vol == 0) {
            btnVolumen.src = iconos.vol0;
        } else if (vol < 60) {
            btnVolumen.src = iconos.vol1;
        } else {
            btnVolumen.src = iconos.vol2;
        }
        actualizarInformacion();
    }

    const modificarvolumen = (volumen = 0.05) => {
        // Operador ternario xq sino da error no se xq
        video.volume += (video.volume + volumen < 0)? -video.volume : (video.volume + volumen > 1)? 1 - video.volume : volumen;
        actualizarBotonVolumen(video.volume * 100);
        if (video.volume == 0) ultimoVolumen = 0.3;
    }
    
    const mutear = () => {
        if (video.volume == 0) {
            video.volume = ultimoVolumen;
            actualizarBotonVolumen(ultimoVolumen * 100);
        } else {
            ultimoVolumen = video.volume;
            video.volume = 0;
            actualizarBotonVolumen(0)
        }
    }


    window.addEventListener("keydown", e => {
        console.log(e.key, "|", e.keyCode);
        switch (e.keyCode) {
            case 0x20: // espacio
                e.preventDefault();
                togglePausa();
                break;
            case 0x50: // P
                e.preventDefault();
                togglePausa();
                break;
            case 0x25:
                e.preventDefault()
                retroceder();
                break;
            case 0x27:
                e.preventDefault();
                adelantar();
                break;
            case 0x46:
                e.preventDefault();
                requestFullscreen();
                break;
            case 0x0E:
                e.preventDefault();
                requestFullscreen();
                break;
            case 0x52:
                e.preventDefault();
                reiniciar();
                break;
            case 0x26:
                e.preventDefault();
                modificarvolumen(0.05);
                break;
            case 0x28:
                e.preventDefault();
                modificarvolumen(-0.05);
                break;
            case 0x4D:
                e.preventDefault();
                mutear();
                break;
        }
    })

    btnPlay.parentElement.addEventListener("click", togglePausa);
    btnRetroceder.parentElement.addEventListener("click", e => {retroceder()});
    btnAdelantar.parentElement.addEventListener("click", e => {adelantar()});
    btnRestart.parentElement.addEventListener("click", e => {reiniciar()})
    btnVolumen.parentElement.addEventListener("click", e => {mutear()});
    btnFullscreen.parentElement.addEventListener("click", e => {
        requestFullscreen();
    });

    video.addEventListener("timeupdate", e => {
        if (!actualizacion) if (progressBar.value != ultimoBar) return;
        progressBar.value = parseInt(video.currentTime);
        ultimoBar = parseInt(video.currentTime);
        duracionActual.textContent = parseTime(parseInt(video.currentTime));
    })

    progressBar.addEventListener("input", () => {
        ultimoBar = progressBar.value;
        video.currentTime = progressBar.value;
        duracionActual.textContent = parseTime(progressBar.value);

        // Actualizar informacion
        if (informacion.visto < video.currentTime) informacion.visto = video.currentTime;
        actualizarInformacion();
    })


    video.addEventListener("volumechange", e => {
        volumenBar.value = parseInt(video.volume * 100);
        actualizarBotonVolumen(parseInt(video.volume * 100));
    })

    volumenBar.addEventListener("input", () => {
        video.volume = volumenBar.value / 100;
        actualizarBotonVolumen(volumenBar.value);
        if (volumenBar.value == 0) ultimoVolumen = 0.3;
    })

    
    /* Carga del video */
    ipcRenderer.send("repro:listo", {});
    ipcRenderer.on("repro:start", (e, template = {}) => {
        console.log("inicio");
        informacion = template;
        video.src = template.ruta;
        video.load();
        
        tieneHoras = (parseInt(template.duracion/3600%60))?true:false;

        labelName.textContent = template.nombre;
        document.getElementById("brandname").textContent = template.nombre;
        duracionTotal.textContent = parseTime(template.duracion);
        duracionActual.textContent = parseTime(template.vistoUltimaVez | 0);
        progressBar.max = template.duracion;
        progressBar.value = template.vistoUltimaVez | 0;
        ultimoBar = template.vistoUltimaVez | 0;
        video.volume = template.ultimoVolumen | 1;
        video.currentTime = template.vistoUltimaVez | 0;
        informacion.visto = template.visto | 0; // Esto es estupido pero tengo que ponerlo xd

        togglePausa() // iniciar
    })

    /* Cerrando ventana */
    ipcRenderer.on("repro:close", (e, datos) => {
        video.pause();
        actualizarInformacion(false);
        console.log("closed");
        btnPlay.src = iconos.play;
        video.load();
    })

})()