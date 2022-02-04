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

/* ------- Interfaz fade ------ */
let interfaz = document.getElementById("interfaz");
let interfazHover = 0;

document.addEventListener("mousemove", e => {
    interfaz.classList.add("interfaz-hover");
    interfazHover++;
    document.body.classList.remove("cursor-none");
    document.body.classList.add("cursor-auto");
    
    
    // para quitarlo
    setTimeout(function() {
        interfazHover--;
        if (!interfazHover) {
            interfaz.classList.remove("interfaz-hover");
            document.body.classList.add("cursor-none");
            document.body.classList.remove("cursor-auto");
        }
    }, 2000);
});