// 🚨 ATENCIÓN: Cambiá esta IP por la IP local de tu PC cuando pruebes desde el WiFi de tu celular
const API_BASE_URL = 'http://127.0.0.1:8000'; 

const video = document.getElementById('webcam');
const productCard = document.getElementById('product-card');
const scannerBox = document.getElementById('scanner-box');

let escaneoBloqueado = false;

// Inicialización de la cámara con fallback inteligente
async function inicializarCamara() {
    const configuraciones = [
        { video: { facingMode: { exact: "environment" } }, audio: false }, // Trasera pura
        { video: { facingMode: "environment" }, audio: false },            // Preferencia trasera
        { video: true, audio: false }                                      // Cualquier dispositivo
    ];

    for (const conf of configuraciones) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(conf);
            video.srcObject = stream;
            console.log("Cámara vinculada de forma correcta.");
            return;
        } catch (e) {
            console.log("Fallo de stream, saltando a siguiente configuración...");
        }
    }
    alert("No se detectó acceso a la cámara. Habilitá los permisos en el navegador de tu celular.");
}

// Envío y recepción de datos con el Backend
async function procesarCodigoDetectado(codigo) {
    if (escaneoBloqueado) return;
    escaneoBloqueado = true;

    // Feedback inmediato en pantalla y físico
    scannerBox.classList.add('box-success');
    if (navigator.vibrate) navigator.vibrate(50); // Vibración háptica nativa

    try {
        const response = await fetch(`${API_BASE_URL}/scan/${codigo}`);
        const data = await response.json();

        if (response.ok) {
            mostrarTarjetaProducto(data.producto);
        } else {
            alert(`Alerta del Sistema: ${data.detail || 'Error de procesamiento'}`);
            reiniciarEscaner();
        }
    } catch (error) {
        alert("Error de infraestructura: El servidor API backend no responde.");
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
    setTimeout(() => {
        escaneoBloqueado = false;
    }, 400); // Ventana de tiempo para evitar spam de lecturas infinitas
}

// Escuchadores de eventos
document.getElementById('btn-close').addEventListener('click', reiniciarEscaner);
document.getElementById('btn-close-bar').addEventListener('click', reiniciarEscaner);
document.getElementById('btn-manual').addEventListener('click', () => {
    procesarCodigoDetectado('00000000013');
});

// Lanzamiento
window.addEventListener('load', inicializarCamara);
