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