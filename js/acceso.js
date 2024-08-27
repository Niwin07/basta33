document.addEventListener('DOMContentLoaded', function() {
    // Función para mostrar las pestañas (sin cambios)
    window.showTab = function(tabName) {
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
      document.getElementById(tabName).classList.add('active');
      document.querySelector(`.tab[onclick="showTab('${tabName}')"]`).classList.add('active');
    };
  
    // Función para manejar errores de fetch
    function handleFetchError(response) {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
        });
      }
      return response.json();
    }
  
    // Manejo del formulario de registro
    // signupForm.addEventListener('submit', function(e) {
    //     e.preventDefault();
        
    //     const formData = new FormData(signupForm);
    //     const data = Object.fromEntries(formData.entries());
      
    //     // Eliminar repeatPassword del objeto data
    //     delete data.repeatPassword;
        
    //     console.log('Datos a enviar:', data);  // Asegúrate de que todos los campos están presentes y correctos
        
    //     fetch('http://localhost:3000/clientes', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify(data)
    //     })
    //     .then(response => response.json().catch(() => ({}))) // Manejar posibles errores de JSON en la respuesta
    //     .then(result => {
    //       if (result.message) {
    //         alert('Usuario registrado exitosamente');
    //         signupForm.reset();
    //         window.location.href("index.html");
    //       } else {
    //         alert('Error al registrar usuario: ' + (result.error || 'Error desconocido'));
    //       }
    //     })
    //     .catch(error => {
    //       console.error('Error en la solicitud:', error);
    //       alert('Error al registrar usuario: ' + error.message);
    //     });
    //   });
      
      
  
    // Manejo del formulario de inicio de sesión
    const loginForm = document.querySelector('#loginForm');  // Cambiado de '#login form' a '#loginForm'
        loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        console.log('Datos a enviar:', data);  // Añade un log para verificar los datos antes de enviar

        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json().catch(() => ({}))) // Manejar posibles errores de JSON en la respuesta
        .then(result => {
            if (result.token) {
            localStorage.setItem('token', result.token);
            alert('Inicio de sesión exitoso');
            window.location.href = '/index.html';
            } else {
            alert('Error al iniciar sesión: ' + (result.error || 'Credenciales inválidas'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al iniciar sesión: ' + error.message);
        });
    });

    // Función para validar la edad
  function validarEdad(fechaNacimiento) {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad >= 18;
  }

  // Manejo del formulario de registro
  const signupForm = document.querySelector('#signup form');
  signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(signupForm);
    const data = Object.fromEntries(formData.entries());

    // Validar que todos los campos estén completos
    for (let key in data) {
      if (data[key].trim() === '') {
        alert('Por favor, complete todos los campos');
        return;
      }
    }

    // Validar que las contraseñas coincidan
    if (data.password !== data.repeatPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Validar la edad
    if (!validarEdad(data.fechaNacimiento)) {
      alert('Debes ser mayor de 18 años para registrarte');
      return;
    }

    // Eliminar repeatPassword del objeto data
    delete data.repeatPassword;
    
    console.log('Datos a enviar:', data);

    fetch('http://localhost:3000/clientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json().catch(() => ({})))
    .then(result => {
      if (result.message) {
        alert('Usuario registrado exitosamente');
        signupForm.reset();
        window.location.href = "acceso.html";
      } else {
        alert('Error al registrar usuario: ' + (result.error || 'Error desconocido'));
      }
    })
    .catch(error => {
      console.error('Error en la solicitud:', error);
      alert('Error al registrar usuario: ' + error.message);
    });
  });

  });