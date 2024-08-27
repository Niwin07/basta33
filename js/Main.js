let allTours = [];

document.addEventListener('DOMContentLoaded', async function() {
    const { tours } = await import('./tours.js');
    allTours = tours;

    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get('id');

    if (window.location.pathname.includes('tour.html') && tourId) {
        renderTour(tourId);
    } else if (window.location.pathname.includes('destinos.html')) {
        initializeDestinosPage();
    } else {
        initializeHomePage();
    }

    setupDropdowns();
    navSlide();
});

// Verificar la sesión del usuario
async function checkUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
  
    try {
      const response = await fetch('http://localhost:3000/usuarios/me', {
        headers: {
          'Authorization': token
        }
      });
  
      if (!response.ok) {
        throw new Error('Token inválido');
      }
  
      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Error al verificar el usuario:', error);
      return null;
    }
  }
  

  function initializeDestinosPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const season = urlParams.get('season');
    const city = urlParams.get('city');
  
    // Filtrar por temporada y ciudad
    const filteredTours = filterTours(city, season);
    displayTours(filteredTours);
  
    // Añadir event listeners a los botones de filtro
    const filterButtons = document.querySelectorAll('.filtros button');
    filterButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const city = this.getAttribute('data-city');
        const season = this.getAttribute('data-season');
        const filteredTours = filterTours(city, season);
        displayTours(filteredTours);
  
        // Actualizar la URL con los nuevos filtros
        const newUrl = `?city=${city}${season ? `&season=${season}` : ''}`;
        window.history.replaceState(null, null, newUrl);
      });
    });
  }
  
  function filterTours(city, season) {
    let filteredTours = allTours;
  
    if (city !== 'all' && city) {
      filteredTours = filteredTours.filter(tour => tour.lugar === city);
    }
  
    if (season !== 'all' && season !== null) {
      filteredTours = filteredTours.filter(tour => tour.temporada === (season === 'winter' ? true : season === 'summer' ? false : null));
    }
  
    return filteredTours;
  }
  function initializeHomePage() {
    const buttons = document.querySelectorAll('.botonmoderno, .botonmoderno-tours');
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const season = this.getAttribute('data-season');
        const city = this.getAttribute('data-city');
        if (city) {
          window.location.href = `destinos.html?city=${city}`;
        } else if (season) {
          window.location.href = `destinos.html?season=${season}`;
        }
      });
    });
  }

function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggleButton = dropdown.querySelector('.dropdown-toggle');
        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
    });

    document.addEventListener('click', function() {
        dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
    });

    const langLinks = document.querySelectorAll('.dropdown-menu [data-lang]');
    langLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            console.log(`Cambiando idioma a: ${lang}`);
        });
    });
}

function displayTours(tours) {
    const container = document.getElementById('contenedor');
    if (!container) {
        console.error('El contenedor no existe en el DOM.');
        return;
    }
    container.innerHTML = '';
    container.className = 'tours-container';

    tours.forEach(tour => {
        const tourBox = document.createElement('div');
        tourBox.className = 'tour-box';

        const name = document.createElement('h2');
        name.textContent = tour.name;

        const bannerImg = document.createElement('img');
        bannerImg.src = tour.imagenes[0];
        bannerImg.alt = `Banner de ${tour.name}`;

        tourBox.appendChild(bannerImg);
        tourBox.appendChild(name);

        tourBox.addEventListener('click', () => {
            window.location.href = `tour.html?id=${tour.id}`;
        });

        container.appendChild(tourBox);
    });
}



// header

const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    burger.addEventListener('click', () => {
      nav.classList.toggle('nav-active');
      
      navLinks.forEach((link, index) => {
        if (link.style.animation) {
          link.style.animation = '';
        } else {
          link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
      });
      
      burger.classList.toggle('toggle');
    });
  }
  
  navSlide();

  const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');

    burger.addEventListener('click', () => {
    nav.classList.toggle('active');
    burger.classList.toggle('toggle');
    });

    // Cerrar el menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        burger.classList.remove('toggle');
    });
    });

//render de los tours

function renderTour(tourId) {
    const tour = allTours.find(t => t.id === tourId);
    if (!tour) {
        console.error('Tour no encontrado');
        return;
    }

    const mainElement = document.querySelector('[role="main"]');
    mainElement.innerHTML = ''; // Limpiar el contenido existente

    // Sección de presentación
    const presentationSection = createSection('presentation', tour.imagenes[0]);
    presentationSection.innerHTML = `
        <h1 class="titulo-tour">${tour.name}</h1>
        <p id="slogan">${tour.slogan || ''}</p>
    `;
    mainElement.appendChild(presentationSection);

    // Sección de ubicación
    const locationSection = createSection('location', tour.imagenes[1]);
    locationSection.innerHTML = `
        <div class="ubicacion-desc">

         <h2 class="subtitulo">Ubicación</h2>
         <p>${tour.caracteristicas[0].ubicacion}</p>

        </div>
        <div class="image-container" id="ubicacion">
            <img src="${tour.imagenes_secundarias[0]}" alt="Imagen secundaria 1">
            <img src="${tour.imagenes_secundarias[1]}" alt="Imagen secundaria 2">
        </div>
    `;
    mainElement.appendChild(locationSection);

    // Sección de dificultad
    const difficultySection = createSection('difficulty', tour.imagenes[2]);
    difficultySection.innerHTML = `
        <div class="dificultad-desc">
        <h2 class="subtitulo">Dificultad</h2>
        <p>${tour.caracteristicas[0].dificultad}</p>
        </div>
        
        <div class="image-container" id="dificultad">
            <img src="${tour.imagenes_secundarias[2]}" alt="Imagen secundaria 3">
            <img src="${tour.imagenes_secundarias[3]}" alt="Imagen secundaria 4">
        </div>
    `;
    mainElement.appendChild(difficultySection);

    // Sección de más información
    const moreInfoSection = createSection('more-info', tour.imagenes[3]);
    moreInfoSection.innerHTML = `
        <h2 class="subtitulo" id="masinfo">Más Información</h2>
    <div class="mas-info-desc">
        <p>Si desea conocer más información sobre el recorrido de este tour, seleccione la temporada en la que desee asistir y más información será revelada</p>
    </div>
    
    <div class="image-container" id="mas-informacion">
        <div class="image-subtitle-wrapper">
            <img src="${tour.imagenes_secundarias[4]}" alt="Imagen secundaria 5" class="info-trigger" data-info-image="${tour.imagenes_info[0]}">
            <h2 class="sub-desc">Verano</h2>
        </div>
        <div class="image-subtitle-wrapper">
            <img src="${tour.imagenes_secundarias[5]}" alt="Imagen secundaria 6" class="info-trigger" data-info-image="${tour.imagenes_info[1]}">
            <h2 class="sub-desc">Invierno</h2>
        </div>
    </div>
    <div id="info-modal" class="modal">
        <span class="close">&times;</span>
        <img class="modal-content" id="info-image">
    </div>
    `;
    mainElement.appendChild(moreInfoSection);

    // Sección de reserva
    const bookingSection = createSection('booking', tour.imagenes[4]);
    bookingSection.innerHTML = `
        <div class="reserva">

        <h2 class="subtitulo">Reserva</h2>
        <p>¡Descubre ${tour.name} con nuestros guías locales expertos y vive una experiencia inolvidable! Reserva tu aventura hoy mismo y conecta con la naturaleza en su máxima expresión.</p>
        <div class="botonmoderno-tours" id="reserva-btn">¡Reserva ahora!</div>
        
        </div>
    `;
    mainElement.appendChild(bookingSection);

    setupInfoModal();

    document.getElementById('reserva-btn').addEventListener('click', function() {
        window.location.href = `reserva.html?id=${tourId}`;
    });
    
}

function createSection(className, backgroundImage) {
    const section = document.createElement('section');
    section.className = `section secciones-tours ${className}`;
    section.style.backgroundImage = `url(${backgroundImage})`;
    return section;
}

function setupInfoModal() {
    const modal = document.getElementById('info-modal');
    const modalImg = document.getElementById('info-image');
    const closeBtn = document.getElementsByClassName('close')[0];

    document.querySelectorAll('.info-trigger').forEach(img => {
        img.onclick = function() {
            modal.style.display = "block";
            modalImg.src = this.getAttribute('data-info-image');
        }
    });

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

async function loginUser(email, password) {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
  
      if (!response.ok) {
        throw new Error('Error al iniciar sesión');
      }
  
      const data = await response.json();
      localStorage.setItem('token', data.token);
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }

  function logout() {
    // Eliminar token y otros datos de sesión
    
    // Agregar más llamadas a removeItem si necesitas eliminar otros datos de sesión
  
    // Redireccionar después de un timeout
    
  
    // Opcional: agregar una confirmación
     if (confirm('¿Seguro que deseas cerrar la sesión?')) {
        localStorage.removeItem('token');
        setTimeout(() => {
            window.location.href = 'acceso.html';
        }, 500);
    } else {
        alert("cancelado")
     }
  }

  //carrito
  function addToCart(tourId, tourName, tourPrice) {
    console.log('Función addToCart llamada con:', tourId, tourName, tourPrice);
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No hay token de autenticación');
        alert('Por favor, inicia sesión para agregar tours al carrito.');
        return;
    }
    const cantidad = prompt("¿Cuántas personas?", "1");
    if (cantidad === null) return; // El usuario canceló

    let edades = "";
    for (let i = 0; i < parseInt(cantidad); i++) {
      const edad = prompt(`Edad de la persona ${i + 1}:`);
      if (edad === null) return; // El usuario canceló
      edades += edad + ",";
    }
    edades = edades.slice(0, -1); // Eliminar la última coma

    console.log('Enviando solicitud a la API...');
    fetch('http://localhost:3000/api/carrito/agregar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tourId: parseInt(tourId, 10),
          cantidad: parseInt(cantidad),
          edades: edades
        })
    })
    .then(response => {
        console.log('Respuesta de la API recibida', response);
        return response.json();
    })
    .then(data => {
        console.log('Datos de la respuesta:', data);
        if (data.success) {
            alert('Tour agregado al carrito exitosamente');
            updateCartCount();
        } else {
            alert('Error al agregar el tour al carrito: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error al agregar al carrito:', error);
        alert('Ocurrió un error al agregar el tour al carrito');
    });
}
  
  function updateCartCount() {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    fetch('http://localhost:3000/api/carrito/contar', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      const cartCount = document.querySelector('.cart-count');
      cartCount.textContent = data.count;
    })
    .catch(error => console.error('Error al actualizar el contador del carrito:', error));
  }

// Llamar a updateCartCount cuando se carga la página
document.addEventListener('DOMContentLoaded', updateCartCount);