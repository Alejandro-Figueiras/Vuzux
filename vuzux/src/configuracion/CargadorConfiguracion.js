const fs = require('fs');
const path = require('path');

module.exports = class CargarConfiguracion {
    
    static ruta = ""; // Inicializacion en el index
    static verificar() {
        if(!fs.existsSync(this.ruta)) {
            fs.mkdirSync(this.ruta);
        }
        if(!fs.existsSync(this.ruta + "thumbnails/")) {
            fs.mkdirSync(this.ruta + "thumbnails/");
        }
    }

    static cargarConfiguracion() {
        this.verificar();
        const ruta = this.ruta+"configuracion.json";
        if (fs.existsSync(ruta)) {
            let file = fs.readFileSync(ruta, 'utf-8');
            return JSON.parse(file);
        } else {
            return {}
        }
    }

    static guardarConfiguracion(json = {}) {
        this.verificar();
        const ruta = this.ruta+"configuracion.json";
        return fs.writeFileSync(ruta, JSON.stringify(json));
    }

}



