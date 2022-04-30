const Cargador = require("./CargadorConfiguracion");

module.exports = class Configuracion {

    static ffmpegPath = "";
    static ffprobePath = "";

    static datos = {}

    static iniciar() {
        this.datos = Cargador.cargarConfiguracion();
        
        if (!this.datos.archivos) {
            this.datos.archivos = {}
        }
        if (!this.datos.directorios) {
            this.datos.directorios = {}
        }
        
    }

    static guardarCambios() {
        Cargador.guardarConfiguracion(this.datos);
        console.log(`Configuracion guardada`);
    }

}