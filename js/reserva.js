let allTours = [];

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const { tours } = await import('./tours.js');
        allTours = tours;

        const urlParams = new URLSearchParams(window.location.search);
        const tourId = urlParams.get('id');

        if (tourId) {
            renderReservaForm(tourId);
        } else {
            renderErrorMessage('No se proporcionó ID del tour. Por favor, selecciona un tour desde la página principal.');
        }
    } catch (error) {
        console.error('Error al cargar los tours:', error);
        renderErrorMessage('Hubo un problema al cargar la información del tour. Por favor, intenta de nuevo más tarde.');
    }
});

function renderReservaForm(tourId) {
    const tour = allTours.find(t => t.id === tourId);
    if (!tour) {
        renderErrorMessage('Tour no encontrado. Por favor, selecciona un tour válido.');
        return;
    }

    const reservaContainer = document.getElementById('reserva-container');
    reservaContainer.innerHTML = `
        <div class="reserva-wrapper">
            <div class="tour-info">
                <h1>${tour.name}</h1>
                <img src="${tour.imagenes[0]}" alt="${tour.name}" class="tour-image">
                <div class="tour-details">
                    <p><i class="fas fa-clock"></i> <strong>Duración:</strong> ${tour.caracteristicas[0].duracion}</p>
                    <p><i class="fas fa-mountain"></i> <strong>Dificultad:</strong> ${tour.caracteristicas[0].dificultad}</p>
                    <p><i class="fas fa-map-marker-alt"></i> <strong>Ubicación:</strong> ${tour.caracteristicas[0].ubicacion}</p>
                    <p><i class="fas fa-hiking"></i> <strong>Tipo:</strong> ${tour.caracteristicas[0].tipo}</p>
                    <p><i class="fas fa-sun"></i> <strong>Temporada:</strong> ${tour.temporada ? 'Invierno' : 'Verano'}</p>
                </div>
            </div>
            <div class="reserva-form-container">
                <h2>Reserva tu experiencia</h2>
                <form id="reserva-form" class="reserva-form">
                    <div class="form-group">
                        <label for="fecha">Fecha de la excursión:</label>
                        <input type="date" id="fecha" name="fecha" required>
                    </div>
                    <div class="form-group">
                        <label for="participantes">Número de participantes:</label>
                        <input type="number" id="participantes" name="participantes" min="1" required>
                    </div>
                    <div id="resumen-costos" class="resumen-costos">
                        <p>Precio base por persona: <span id="precio-base">${tour.caracteristicas[0].Precio}</span></p>
                        <p>Subtotal: $<span id="subtotal">0</span></p>
                        <p>Total: $<span id="total">0</span></p>
                    </div>
                    <div class="form-group">
                        <legend>Opciones de pago:</legend>
                        <label class="radio-label">
                            <input type="radio" name="tipo-pago" value="completo" checked>
                            <span class="radio-custom"></span>
                            Pago completo
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="tipo-pago" value="deposito">
                            <span class="radio-custom"></span>
                            Pago de depósito (50%)
                        </label>
                    </div>
                    <div class="form-group buttons-group">
                        <button type="button" class="submit-btn" onclick="checkUserAuthentication('${tour.id}')">Reservar ahora</button>  
                        <button type="button" onclick="addToCart('${tour.id}', '${tour.name}', ${tour.caracteristicas[0].Precio})">Agregar al carrito</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    setupReservaFormListeners(tour);
}


// window.enviarReservaWhatsApp = function(tourName) {
//     const telefono = '5492901481578'; // Reemplaza con el número de teléfono real
//     const fecha = document.getElementById('fecha').value;
//     const participantes = document.getElementById('participantes').value;
//     const tipoPago = document.querySelector('input[name="tipo-pago"]:checked').value;

//     if (!fecha || !participantes || !tipoPago) {
//         alert('Por favor, completa todos los campos antes de enviar la reserva.');
//         return;
//     }

//     const mensaje = `Hola, quiero reservar el tour "${tourName}" para el ${fecha} para ${participantes} personas. Tipo de pago: ${tipoPago}.`;

//     const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
//     window.open(url, '_blank');
// }


function setupReservaFormListeners(tour) {
    const form = document.getElementById('reserva-form');
    const participantesInput = document.getElementById('participantes');
    const subtotalSpan = document.getElementById('subtotal');
    const totalSpan = document.getElementById('total');

    participantesInput.addEventListener('input', updateCostos);
    form.addEventListener('submit', handleSubmit);

    function updateCostos() {
        const participantes = parseInt(participantesInput.value) || 0;
        const precioBaseText = document.getElementById('precio-base').textContent;
        
        if (precioBaseText === "Sujeto a consulta") {
            subtotalSpan.textContent = "Sujeto a consulta";
            totalSpan.textContent = "Sujeto a consulta";
        } else {
            const precioBase = parseFloat(precioBaseText.replace('$', '')) || 0;
            const subtotal = participantes * precioBase;
            const total = subtotal;

            subtotalSpan.textContent = subtotal.toFixed(2);
            totalSpan.textContent = total.toFixed(2);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        console.log('Reserva enviada', {
            tourId: tour.id,
            fecha: form.fecha.value,
            participantes: form.participantes.value,
            tipoPago: form.querySelector('input[name="tipo-pago"]:checked').value
        });
        // Aquí puedes agregar la lógica para procesar la reserva
        alert('Reserva enviada con éxito!'); // Reemplaza esto con tu lógica de procesamiento real
    }
}


function renderErrorMessage(message) {
    const reservaContainer = document.getElementById('reserva-container');
    reservaContainer.innerHTML = `
        <h1>Error</h1>
        <p>${message}</p>
        <a href="index.html">Volver a la página principal</a>
    `;
}


