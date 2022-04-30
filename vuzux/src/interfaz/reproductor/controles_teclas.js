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