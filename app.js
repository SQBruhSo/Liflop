const video = document.getElementById('webcam');
const productCard = document.getElementById('product-card');
const scannerBox = document.getElementById('scanner-box');

let escaneoBloqueado = false;

// 1. Validar el código matemáticamente en el celular
function validarCodigo11Digitos(codigoStr) {
    if (codigoStr.length !== 11 || isNaN(codigoStr)) return false;
    
    const digitos = codigoStr.split('').map(Number);
    const digitoVerificadorReal = digitos[10];
    
    let sumaImpares = 0;
    let sumaPares = 0;
    
    for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) sumaImpares += digitos[i];
        else sumaPares += digitos[i];
    }
    
    const resultadoCalculado = ((sumaImpares * 3) + sumaPares) % 10;
    return resultadoCalculado === digitoVerificadorReal;
}

// 2. Encender la cámara
async function inicializarCamara() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Permití el acceso a la cámara para poder escanear.");
    }
}

// 3. Procesar y buscar en el archivo JSON de GitHub
async function procesarCodigoDetectado(codigo) {
    if (escaneoBloqueado) return;
    escaneoBloqueado = true;

    scannerBox.classList.add('box-success');
    if (navigator.vibrate) navigator.vibrate(50); 

    // Validar Requisito 3 (Sin errores matemáticos)
    if (!validarCodigo11Digitos(codigo)) {
        alert("Código inválido. Falló la confirmación real.");
        reiniciarEscaner();
        return;
    }

    try {
        // Buscamos el archivo directamente en tu GitHub Pages de forma relativa
        const response = await fetch('./inventario.json');
        const inventario = await response.json();

        // Buscamos el producto clonado
        const producto = inventario.find(p => p.codigo === codigo);

        if (producto) {
            mostrarTarjetaProducto(producto);
        } else {
            alert("Producto no encontrado en el inventario.");
            reiniciarEscaner();
        }
    } catch (error) {
        alert("Error al leer la base de datos de GitHub.");
        reiniciarEscaner();
    }
}

function mostrarTarjetaProducto(producto) {
    document.getElementById('prod-nombre').innerText = producto.nombre;
    document.getElementById('prod-precio').innerText = `$${producto.precio.toLocaleString('es-AR')}`;
    document.getElementById('prod-stock').innerText = `Stock: ${producto.stock} u.`;
    document.getElementById('prod-id').innerText = `STRIPEID // ${producto.codigo}`;
    
    productCard.classList.add('sheet-open');
}

function reiniciarEscaner() {
    productCard.classList.remove('sheet-open');
    scannerBox.classList.remove('box-success');
    setTimeout(() => { escaneoBloqueado = false; }, 400); 
}

document.getElementById('btn-close').addEventListener('click', reiniciarEscaner);
document.getElementById('btn-close-bar').addEventListener('click', reiniciarEscaner);
document.getElementById('btn-manual').addEventListener('click', () => {
    procesarCodigoDetectado('00000000013');
});

window.addEventListener('load', inicializarCamara);
