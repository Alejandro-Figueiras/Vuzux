let actualizacion = false; // esto es para que no se ignore el control en ciertas actualizaciones
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

const retroceder = (segs = 10) => { // TODO arreglar, y tambien retroceder()
    video.currentTime = parseInt((video.currentTime - segs < 0)?0:(video.currentTime - segs));
    actualizacion = true;
    if (informacion.visto < (video.currentTime + (pos * spf))) informacion.visto = video.currentTime + (pos * spf);
    actualizarInformacion();
}

const adelantar = (segs = 10) => {
    video.currentTime = parseInt((video.currentTime + segs > informacion.duracion)? informacion.duracion :(video.currentTime + segs));
    actualizacion = true;
    if (informacion.visto < (video.currentTime + (pos * spf))) informacion.visto = video.currentTime + (pos * spf);
    actualizarInformacion();
}

const reiniciar = () => {
    video.currentTime = 0; // TODO arreglar
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

/* ------ VOLUMEN ------ */
let ultimoVolumen = 1;

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

const volumechangeEvent = e => {
    volumenBar.value = parseInt(video.volume * 100);
    actualizarBotonVolumen(parseInt(video.volume * 100));
}
videoA.addEventListener("volumechange", volumechangeEvent)
videoB.addEventListener("volumechange", volumechangeEvent)

volumenBar.addEventListener("input", () => {
    video.volume = volumenBar.value / 100;
    actualizarBotonVolumen(volumenBar.value);
    if (volumenBar.value == 0) ultimoVolumen = 0.3;
})

/* ------ Progress Bar ------ */
let ultimoBar = 0;

const timeupdateEvent = e => {
    if (!actualizacion) if (progressBar.value != ultimoBar) return;
    console.log(video.currentTime);
    progressBar.value = parseInt(video.currentTime + (pos * spf));
    ultimoBar = parseInt(video.currentTime + (pos * spf));
    duracionActual.textContent = parseTime(parseInt(video.currentTime + (pos * spf)));
}
videoA.addEventListener("timeupdate", timeupdateEvent);
videoB.addEventListener("timeupdate", timeupdateEvent);

progressBar.addEventListener("input", () => {
    ultimoBar = progressBar.value;
    video.currentTime = progressBar.value - (pos * spf);
    duracionActual.textContent = parseTime(progressBar.value);

    // Actualizar informacion
    if (informacion.visto < (video.currentTime + (pos * spf))) informacion.visto = video.currentTime + (pos * spf);
    actualizarInformacion();
})


/* ----------------------------------------------------------------------- */
/* Asignacion de controles */
btnPlay.parentElement.addEventListener("click", togglePausa);
btnRetroceder.parentElement.addEventListener("click", e => {retroceder()});
btnAdelantar.parentElement.addEventListener("click", e => {adelantar()});
btnRestart.parentElement.addEventListener("click", e => {reiniciar()})
btnVolumen.parentElement.addEventListener("click", e => {mutear()});
btnFullscreen.parentElement.addEventListener("click", e => {
    requestFullscreen();
});