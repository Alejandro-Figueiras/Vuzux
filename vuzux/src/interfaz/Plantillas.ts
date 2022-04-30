import { Explorador } from "./../explorador/Explorador";

export class Plantillas {
    static getTablaUnidad(id = "") {
        return `<table class="table table-dark" id="tabla${id}">
        <thead>
            <tr>
                <th scope="col">Ruta</th>
                <th scope="col" style="max-width: 70px; text-align:right">Videos</th>
            </tr>
        </thead>
        <tbody id="tabla${id}Body"></tbody>
      </table>`;
    }

    static getTablaRutas(id = "") {
        return `<table class="table table-dark" id="tabla${id}">
        <thead>
            <tr>
                <th scope="col">Ruta</th>
                <th scope="col" style="max-width: 70px; text-align:right">Eliminar</th>
            </tr>
        </thead>
        <tbody id="tabla${id}Body"></tbody>
      </table>`;
    }

    static getVistaVideo(uuid, video) {
        return `<div class="col" id="${uuid}">
            <div class="card bg-dark card-custom-1">
                <img src="${video.thumbnail}" class="card-img-top rounded" alt="${video.nombre}">
                <div class="card-body text-center">
                    <p class="card-text card-recortar mb-0" title="${video.nombre}">${video.nombre}</p>
                    <p class="card-text card-info">${Explorador.parseTime(video.duracion)} ${Explorador.parseSize(video.size)}</p>
                </div>
            </div>
        </div>`;
    }

    static getVistaPelicula(uuid, movie, extraclass) {
        return `<div class="col ${extraclass}" id="${uuid}">
        <div class="card bg-dark card-custom-2">
            <img src="${movie.poster}" class="card-img-top rounded" alt="${movie.nombre}">
            <div class="card-body text-center">
                <p class="card-text card-recortar mb-0 card-recortar-peli" title="${movie.nombre}">${movie.nombre}</p>
                <p class="card-text card-info">${Explorador.parseTime(movie.duracion)} ${Explorador.parseSize(movie.size)}</p>
            </div>
        </div>
    </div>`
    }

}