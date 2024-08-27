// En Main.js o en un nuevo archivo carrito.js
function loadCarrito() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Por favor, inicia sesión para ver tu carrito.');
        return;
    }

    fetch('http://localhost:3000/api/carrito', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const carritoContainer = document.getElementById('carrito-container');
        carritoContainer.innerHTML = '';

        data.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="item-details">
                    <h3 class="item-name">${item.Nombre_tour}</h3>
                    <p class="item-info">Cantidad: ${item.Cantidad_personas}</p>
                    <p class="item-info">Edades: ${item.Edad_Personas || 'No especificado'}</p>
                    <p class="item-info">Precio: $${item.Precio_unitario}</p>
                </div>
                <div class="item-actions">
                    <div class="item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.ID}, -1)">-</button>
                        <span class="quantity-value">${item.Cantidad_personas}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.ID}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="eliminarItem(${item.ID})">Eliminar</button>
                </div>
            `;
            carritoContainer.appendChild(itemElement);
        });

        document.getElementById('total-amount').textContent = data.total;
    })
    .catch(error => console.error('Error al cargar el carrito:', error));
}
function updateQuantity(itemId, change) {
    // Implement the logic to update the quantity
    // You'll need to make an API call to update the quantity on the server
    // After the update is successful, call loadCarrito() to refresh the cart
}

  // Llamar a esta función cuando se cargue carrito.html
  document.addEventListener('DOMContentLoaded', loadCarrito);

  

  function realizarSolicitud() {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:3000/api/solicitud/crear', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Solicitud realizada correctamente. Un administrador revisará su solicitud.');
            loadCarrito();
        } else {
            alert('Error al realizar la solicitud');
        }
    })
    .catch(error => console.error('Error:', error));
}
