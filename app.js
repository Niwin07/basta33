const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session');
const port = process.env.PORT || 3000;



dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use(session({
  secret: 'tu_secreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Asegúrate de usar secure: true en producción con HTTPS
}));


// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('Conexión a la base de datos establecida correctamente.');
    connection.release();
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err);
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Middleware para verificar el token JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('Authorization Header:', authHeader);

  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token extraído:', token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Error al verificar el token:', err);
      return res.status(403).json({ error: 'Token inválido' });
    }

    req.userId = user.userId; // Decodificar el userId del token
    console.log('User ID decodificado:', req.userId);
    next();
  });
}



// Registro de usuarios
app.post('/clientes', async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    
    const { Nombres, Apellidos, fechaNacimiento, Sexo, Email, Num_telefono, password, Pais } = req.body;

    // Verificar cada campo individualmente
    if (!Nombres) console.log('Falta Nombres');
    if (!Apellidos) console.log('Falta Apellidos');
    if (!fechaNacimiento) console.log('Falta fechaNacimiento');
    if (!Sexo) console.log('Falta Sexo');
    if (!Email) console.log('Falta Email');
    if (!Num_telefono) console.log('Falta Num_telefono');
    if (!password) console.log('Falta password');
    if (!Pais) console.log('Falta Pais');

    if (!Nombres || !Apellidos || !fechaNacimiento || !Sexo || !Email || !Num_telefono || !password || !Pais) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Hasheando la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Contraseña hasheada:', hashedPassword);

    // Insertar el usuario en la base de datos
    const [result] = await pool.query(
      'INSERT INTO clientes (Nombres, Apellidos, Fecha_nacimiento, Sexo, Email, Num_telefono, Pais, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [Nombres, Apellidos, fechaNacimiento, Sexo, Email, Num_telefono, Pais, hashedPassword]
    );

    console.log('Usuario insertado, ID:', result.insertId);
    res.status(201).json({ message: 'Usuario creado exitosamente', userId: result.insertId });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Error al crear el usuario', details: error.message });
  }
});





// Inicio de sesión
app.post('/login', async (req, res) => {
  try {
    const { Email, password } = req.body;

    console.log("Email recibido:", Email);
    console.log("Password recibido:", password);

    // Buscar el usuario por email
    const [users] = await pool.query('SELECT * FROM clientes WHERE Email = ?', [Email]);

    console.log("Usuarios encontrados:", users);

    if (users.length === 0) {
      console.log("Usuario no encontrado");
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    console.log("Usuario encontrado:", user);

    // Comparar la contraseña ingresada en texto plano con la contraseña hasheada almacenada
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Contraseña ingresada:', password);
    console.log('Contraseña hasheada almacenada:', user.password);
    console.log('¿Contraseña válida?', validPassword);

    if (!validPassword) {
      console.log("Contraseña incorrecta");
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar un token JWT
    const token = jwt.sign({ userId: user.cliente_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Token generado:", token);

    res.json({ token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});



// Obtener información del usuario
app.get('/usuarios/:id', verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT ID, Nombres, Apellidos, Edad, Sexo, Email, Num_telefono FROM usuarios WHERE ID = ?', [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la información del usuario' });
  }
});

// Actualizar información del usuario
app.put('/usuarios/:id', verifyToken, async (req, res) => {
  try {
    const { Nombres, Apellidos, Fecha_nacimiento, Sexo, Email, Num_telefono, Pais } = req.body;
    const userId = req.params.id;

    // Verificar que el usuario está actualizando su propia información
    if (userId != req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para actualizar esta información' });
    }

    // Crear un objeto con los campos a actualizar
    const updateFields = {};
    if (Nombres) updateFields.Nombres = Nombres;
    if (Apellidos) updateFields.Apellidos = Apellidos;
    if (Fecha_nacimiento) updateFields.Fecha_nacimiento = Fecha_nacimiento;
    if (Pais) updateFields.Pais = Pais;
    if (Sexo) updateFields.Sexo = Sexo;
    if (Email) updateFields.Email = Email;
    if (Num_telefono) updateFields.Num_telefono = Num_telefono;

    // Construir la consulta SQL dinámicamente
    const setClause = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateFields);
    values.push(userId);

    const query = `UPDATE clientes SET ${setClause} WHERE cliente_id = ?`;

    await pool.query(query, values);

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el usuario', details: error.message });
  }
});

// Eliminar usuario
app.delete('/usuarios/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM usuarios WHERE ID = ?', [req.params.id]);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

// Endpoint para autenticar al usuario y obtener su información
app.get('/auth/me', verifyToken, async (req, res) => {
  try {
    console.log('Iniciando autenticación de usuario');
    console.log('ID de usuario a autenticar:', req.userId);

    const [users] = await pool.query('SELECT cliente_id, Nombres, Apellidos, Email, Num_telefono, Fecha_nacimiento, Sexo, Pais FROM clientes WHERE cliente_id = ?', [req.userId]);
    console.log('Consulta ejecutada. Resultado:', users);

    if (users.length === 0) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = users[0];
    console.log('Usuario autenticado:', user);

    // Devolver la información del usuario autenticado
    res.json({
      message: 'Autenticación exitosa',
      user: {
        id: user.cliente_id,  // Aquí se ajusta el id
        nombres: user.Nombres,
        apellidos: user.Apellidos,
        email: user.Email,
        Fecha_nacimiento: user.Fecha_nacimiento,
        sexo: user.Sexo,
        telefono: user.Num_telefono,
        pais: user.Pais
      }
    });
  } catch (error) {
    console.error('Error durante la autenticación:', error);
    res.status(500).json({ 
      error: 'Error al autenticar al usuario', 
      details: error.message
    });
  }
});


// Guardar reserva
app.post('/reservas', verifyToken, async (req, res) => {
  try {
    const { tours } = req.body; // tours es un array de objetos { tourId, fechaInicio, fechaFin, status }
    const clienteId = req.userId; // Obtenido del token JWT

    // Validar los datos de entrada
    if (!tours || !Array.isArray(tours) || tours.length === 0) {
      return res.status(400).json({ error: 'Faltan datos requeridos para la reserva' });
    }

    // Validar cada tour en la reserva
    const statusValidos = ['confirmado', 'pendiente', 'cancelado'];
    for (const tour of tours) {
      const { tourId, fechaInicio, fechaFin, status } = tour;
      if (!tourId || !fechaInicio || !fechaFin || !status) {
        return res.status(400).json({ error: 'Faltan datos requeridos para uno o más tours' });
      }
      if (!statusValidos.includes(status.toLowerCase())) {
        return res.status(400).json({ error: 'Status de reserva inválido para uno o más tours' });
      }
    }

    // Insertar la reserva principal
    const [reservaResult] = await pool.query(
      'INSERT INTO reservas (cliente_id) VALUES (?)',
      [clienteId]
    );
    const reservaId = reservaResult.insertId;

    // Insertar cada tour en la tabla de reservas_tours
    for (const tour of tours) {
      const { tourId, fechaInicio, fechaFin, status } = tour;
      await pool.query(
        'INSERT INTO reservas_tours (reserva_id, tour_id, fecha_inicio, fecha_cierre, estado) VALUES (?, ?, ?, ?, ?)',
        [reservaId, tourId, fechaInicio, fechaFin, status.toLowerCase()]
      );
    }

    res.status(201).json({ 
      message: 'Reserva creada exitosamente', 
      reservaId 
    });
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    res.status(500).json({ error: 'Error al crear la reserva', details: error.message });
  }
});

// ... (código existente) ...

app.post('/cambiar-password', verifyToken, async (req, res) => {
  try {
    const { passwordActual, nuevaPassword } = req.body;
    const userId = req.userId;

    // Validaciones en el servidor
    if (!passwordActual || !nuevaPassword) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Obtener el usuario de la base de datos
    const [users] = await pool.query('SELECT * FROM clientes WHERE cliente_id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const user = users[0];

    // Verificar la contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, user.password);
    if (!passwordValida) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    // Verificar que la nueva contraseña sea diferente de la actual
    const nuevaPasswordValida = await bcrypt.compare(nuevaPassword, user.password);
    if (nuevaPasswordValida) {
      return res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la actual' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    // Actualizar la contraseña en la base de datos
    await pool.query('UPDATE clientes SET password = ? WHERE cliente_id = ?', [hashedPassword, userId]);

    res.json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
});


// Agregar un tour al carrito
app.post('/api/carrito/agregar', verifyToken, async (req, res) => {
  const { tourId, cantidad, edades } = req.body;
  const clienteId = req.userId;

  try {
    const [result] = await pool.query(
      'INSERT INTO Carrito (Cliente_ID, Tour_ID, Cantidad_personas, Edad_Personas) VALUES (?, ?, ?, ?)',
      [clienteId, tourId, cantidad, edades]
    );

    res.json({ success: true, message: 'Tour agregado al carrito exitosamente' });
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ success: false, message: 'Error al agregar al carrito' });
  }
});

// Obtener el conteo de items en el carrito
app.get('/api/carrito/contar', verifyToken, async (req, res) => {
  const clienteId = req.userId;

  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM Carrito WHERE Cliente_ID = ?',
      [clienteId]
    );

    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error al contar items del carrito:', error);
    res.status(500).json({ error: 'Error al contar items del carrito' });
  }
});

app.get('/api/carrito', verifyToken, async (req, res) => {
  const clienteId = req.userId;
  try {
    const [items] = await pool.query(
      `SELECT c.*, t.Nombre_tour, t.Precio_unitario 
       FROM Carrito c
       JOIN Tours t ON c.Tour_ID = t.ID
       WHERE c.Cliente_ID = ?`,
      [clienteId]
    );
    const total = items.reduce((sum, item) => sum + item.Precio_unitario * item.Cantidad_personas, 0);
    res.json({ success: true, items, total });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el carrito' });
  }
});

app.put('/api/carrito/editar/:itemId', verifyToken, async (req, res) => {
  const { itemId } = req.params;
  const { cantidad, edades } = req.body;
  const clienteId = req.userId;
  try {
    await pool.query(
      'UPDATE Carrito SET Cantidad_personas = ?, Edad_Personas = ? WHERE ID = ? AND Cliente_ID = ?',
      [cantidad, edades, itemId, clienteId]
    );
    res.json({ success: true, message: 'Item actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el item:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el item' });
  }
});

app.post('/api/solicitud/crear', verifyToken, async (req, res) => {
  const clienteId = req.userId;
  try {
    // Iniciar transacción
    await pool.query('START TRANSACTION');

    // Insertar en la tabla Solicitud
    const [solicitudResult] = await pool.query(
      'INSERT INTO Solicitud (Cliente_ID, Fecha_inicio, Estado) VALUES (?, NOW(), ?)',
      [clienteId, 'Pendiente']
    );
    const solicitudId = solicitudResult.insertId;

    // Obtener items del carrito
    const [carritoItems] = await pool.query('SELECT * FROM Carrito WHERE Cliente_ID = ?', [clienteId]);

    // Insertar cada item del carrito en la tabla de detalles de solicitud (si existe)
    for (const item of carritoItems) {
      await pool.query(
        'INSERT INTO Detalle_Solicitud (Solicitud_ID, Tour_ID, Cantidad_personas, Edad_Personas) VALUES (?, ?, ?, ?)',
        [solicitudId, item.Tour_ID, item.Cantidad_personas, item.Edad_Personas]
      );
    }

    // Vaciar el carrito
    await pool.query('DELETE FROM Carrito WHERE Cliente_ID = ?', [clienteId]);

    // Confirmar transacción
    await pool.query('COMMIT');

    res.json({ success: true, message: 'Solicitud creada correctamente' });
  } catch (error) {
    // Si hay un error, revertir la transacción
    await pool.query('ROLLBACK');
    console.error('Error al crear la solicitud:', error);
    res.status(500).json({ success: false, message: 'Error al crear la solicitud' });
  }
});
