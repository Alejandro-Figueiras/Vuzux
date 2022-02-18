const { ipcRenderer } = require("electron");

// video en el html
let video = document.getElementById("videoA");
const videoA = document.getElementById("videoA"); 
const videoB = document.getElementById("videoB");
let videoActual = 0;

// Video fragmentado
let sources = [
    // '\\videos\\98e906b9-19ca-4577-bb9f-c763de04c968__0.mp4',
    // '\\videos\\98e906b9-19ca-4577-bb9f-c763de04c968__1.mp4',
    // '\\videos\\98e906b9-19ca-4577-bb9f-c763de04c968__2.mp4',
    // '\\videos\\98e906b9-19ca-4577-bb9f-c763de04c968__3.mp4',
    // '\\videos\\98e906b9-19ca-4577-bb9f-c763de04c968__4.mp4',
    // '\\videos\\98e906b9-19ca-4577-bb9f-c763de04c968__5.mp4',
    // '\\videos\\98e906b9-19ca-4577-bb9f-c763de04c968__6.mp4',
    // '\\videos\\98e906b9-19ca-4577-bb9f-c763de04c968__7.mp4',
    // '\\videos\\98e906b9-19ca-4577-bb9f-c763de04c968__8.mp4',
    // '\\videos\\98e906b9-19ca-4577-bb9f-c763de04c968__9.mp4',
    // '\\videos\\98e906b9-19ca-4577-bb9f-c763de04c968__10.mp4'

    // '\\videos\\f876cb7d-faaa-47d6-be27-9d7b981ebaf6__0.mp4',
    // '\\videos\\f876cb7d-faaa-47d6-be27-9d7b981ebaf6__1.mp4',
    // '\\videos\\f876cb7d-faaa-47d6-be27-9d7b981ebaf6__2.mp4',
    // '\\videos\\f876cb7d-faaa-47d6-be27-9d7b981ebaf6__3.mp4',
    // '\\videos\\f876cb7d-faaa-47d6-be27-9d7b981ebaf6__4.mp4',
    // '\\videos\\f876cb7d-faaa-47d6-be27-9d7b981ebaf6__5.mp4',
    // '\\videos\\f876cb7d-faaa-47d6-be27-9d7b981ebaf6__6.mp4',
    // '\\videos\\f876cb7d-faaa-47d6-be27-9d7b981ebaf6__7.mp4',
    // '\\videos\\f876cb7d-faaa-47d6-be27-9d7b981ebaf6__8.mp4',
    // '\\videos\\f876cb7d-faaa-47d6-be27-9d7b981ebaf6__9.mp4',
    // '\\videos\\f876cb7d-faaa-47d6-be27-9d7b981ebaf6__10.mp4'
    
    '\\videos\\20c2cbfc-ec06-4beb-a29e-0ea8894ee779__0.mp4',
  '\\videos\\20c2cbfc-ec06-4beb-a29e-0ea8894ee779__1.mp4',
  '\\videos\\20c2cbfc-ec06-4beb-a29e-0ea8894ee779__2.mp4',
  '\\videos\\20c2cbfc-ec06-4beb-a29e-0ea8894ee779__3.mp4',
  '\\videos\\20c2cbfc-ec06-4beb-a29e-0ea8894ee779__4.mp4',
  '\\videos\\20c2cbfc-ec06-4beb-a29e-0ea8894ee779__5.mp4',
  '\\videos\\20c2cbfc-ec06-4beb-a29e-0ea8894ee779__6.mp4',
  '\\videos\\20c2cbfc-ec06-4beb-a29e-0ea8894ee779__7.mp4',
  '\\videos\\20c2cbfc-ec06-4beb-a29e-0ea8894ee779__8.mp4',
  '\\videos\\20c2cbfc-ec06-4beb-a29e-0ea8894ee779__9.mp4',
  '\\videos\\20c2cbfc-ec06-4beb-a29e-0ea8894ee779__10.mp4'
];

let pos = 0;
let pos_totales = sources.length // TODO cambiar
const spf = 30; // segundos por fragmento !SPF

// info
let informacion = {}; // la template donde esta la info del video
let tieneHoras = false; // esto es si tiene horas para en el parseTime evitar poner 00
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

const parseTime = (segundos = 0, tenerEnCuentaFragmentos = false) => {
    if (tenerEnCuentaFragmentos) segundos += (pos * spf);
                         
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

const cambiarVideoA = () => {
    video = videoA;
    videoActual = 0;
    videoA.classList.add("video-active");
    videoB.classList.remove("video-active");
    videoA.volume = videoB.volume;
    videoA.play();
    actualizacion = true;
}

const cambiarVideoB = () => {
    video = videoB;
    videoActual = 1;
    videoB.classList.add("video-active");
    videoA.classList.remove("video-active");
    videoB.volume = videoA.volume;
    videoB.play();
    actualizacion = true;
}



const siguienteParte = () => {
    console.log("sig", video.currentTime);
    // hacer comprobacion de que no falte la parte
    pos++;
    if (videoActual) {
        cambiarVideoA();
        videoB.src = sources[pos];
        videoB.load();
    } else {
        cambiarVideoB();
        videoA.src = sources[pos];
        videoA.load();
    }
    console.log("siguiente");

}

const endedEvent = e => {
    if (pos != (pos_totales - 1)) {
        siguienteParte();
    }

}
videoA.addEventListener("ended", endedEvent);
videoB.addEventListener("ended", endedEvent);