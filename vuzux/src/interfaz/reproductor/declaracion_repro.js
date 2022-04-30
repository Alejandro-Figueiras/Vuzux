const { ipcRenderer } = require("electron");

const video = document.getElementById("video"); // video en el html
let informacion = {}; // la template donde esta la info del video
let tieneHoras = false; // esto es si tiene horas para en el parseTime evitar poner 00
const iconos = {
    play: "../../assets/player-icons/play.png",
    pausa: "../../assets/player-icons/pausa.png",
    fullscreen: "../../assets/player-icons/fullscreen.png",
    windowed: "../../assets/player-icons/windowed.png",
    vol0: "../../assets/player-icons/volumen-0.png",
    vol1: "../../assets/player-icons/volumen-1.png",
    vol2: "../../assets/player-icons/volumen-2.png"
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